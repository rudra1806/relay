import { useRef, useEffect, useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useSocketStore from '../../store/useSocketStore';
import MessageBubble from './MessageBubble';
import { formatDateSeparator } from '../../lib/utils';
import './MessageList.css';

export default function MessageList() {
  const { messages, isLoadingMessages, selectedContact } = useChatStore();
  const currentUserId = useAuthStore((s) => s.user?._id);
  const typingUsers = useSocketStore((s) => s.typingUsers);
  const isContactTyping = selectedContact && typingUsers[selectedContact._id];
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const stickyTimeoutRef = useRef(null);
  const dateRefs = useRef({});
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [stickyDate, setStickyDate] = useState(null);

  // Protect against false-flags mid scroll
  const isAutoScrollingRef = useRef(false);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    isAutoScrollingRef.current = true;
    bottomRef.current?.scrollIntoView({ behavior });
    setIsAtBottom(true);
    setShowScrollBtn(false);
    
    // Dynamically size the scroll lock:
    // Smooth scrolls take time to resolve, whereas 'auto'/'instant' resolve immediately.
    const lockDuration = behavior === 'smooth' ? 800 : 50;
    setTimeout(() => {
      isAutoScrollingRef.current = false;
    }, lockDuration);
  }, []);

  // Track message array size to differentiate between chat switch vs new message
  const prevMessagesLength = useRef(0);

  // 1. Initial Load & Chat Switch -> Instant Scroll
  useEffect(() => {
    if (!isLoadingMessages && messages.length > 0) {
      // Synchronously mask the length so the new-message useEffect ignores the mass load
      prevMessagesLength.current = messages.length;
      
      // Delay slightly so the DOM physically paints the enormous new list
      setTimeout(() => {
        scrollToBottom('instant');
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoadingMessages, selectedContact?._id, scrollToBottom]);

  // 2. New Message Arrival -> Smooth Scroll
  useEffect(() => {
    if (!isLoadingMessages && messages.length > prevMessagesLength.current) {
      const addedCount = messages.length - prevMessagesLength.current;
      const addedMessages = messages.slice(-addedCount);
      const iSentNewMessage = addedMessages.some((m) => m.senderId === currentUserId);

      // Only force a scroll if user is already at the bottom, OR if the user themselves sent the message
      if (isAtBottom || iSentNewMessage) {
        // 200ms allows heavy DOM nodes (like base64 image previews) to fully flex in the layout
        setTimeout(() => {
          scrollToBottom('smooth');
        }, 200);
      }
      prevMessagesLength.current = messages.length;
    } else if (!isLoadingMessages && messages.length < prevMessagesLength.current) {
      // Resync automatically if messages were deleted 
      prevMessagesLength.current = messages.length;
    }
  }, [messages, isAtBottom, currentUserId, isLoadingMessages, scrollToBottom]);

  // 3. Dynamic heights observer (keeps scroll anchored when images load into layout)
  const isAtBottomRef = useRef(isAtBottom);
  
  // Keep ref perfectly synced so observer has non-stale access without rebinding hook dependencies
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // We observe the inner layout wrapper where images expand
    const contentNode = containerRef.current.querySelector('.msg-list__content');
    if (!contentNode) return;

    let resizeTimeout;
    const observer = new ResizeObserver(() => {
      // If user is currently anchored to the bottom, force the anchor to remain 
      // when DOM nodes dynamically stretch the document height (like lazy loaded images)
      if (isAtBottomRef.current) {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          scrollToBottom('auto'); 
        }, 10);
      }
    });

    observer.observe(contentNode);
    return () => {
      observer.disconnect();
      clearTimeout(resizeTimeout);
    };
  }, [scrollToBottom]);

  // Detect scroll position with debounce
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    // Bypass calculating new scroll positions if we are synthetically animating 
    // down to the bottom. This prevents onScroll from incorrectly marking isAtBottom = false mid-animation.
    if (isAutoScrollingRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom < 50; // More precise threshold
    
    // Update bottom state immediately
    setIsAtBottom(atBottom);
    
    // Find current visible date - the one that has scrolled past the top
    const containerRect = containerRef.current.getBoundingClientRect();
    const topThreshold = containerRect.top + 10; // Small offset from top
    
    let visibleDate = null;
    let maxTop = -Infinity;
    
    // Get all dates and find which one is currently at the top
    Object.entries(dateRefs.current).forEach(([date, ref]) => {
      if (ref) {
        const dateRect = ref.getBoundingClientRect();
        
        // Ensure the element is actually visible (detached nodes often return 0 for dimensions)
        if (dateRect.width === 0 && dateRect.height === 0) return;

        // If this date separator has scrolled past the top, it's the current section
        // Finding the maxTop ensures we select the date header closest to the top threshold
        if (dateRect.top <= topThreshold && dateRect.top > maxTop) {
          maxTop = dateRect.top;
          visibleDate = date;
        }
      }
    });
    
    // Only update if we have a visible date
    if (visibleDate) {
      setStickyDate(visibleDate);
      
      // Clear existing timeout
      if (stickyTimeoutRef.current) {
        clearTimeout(stickyTimeoutRef.current);
      }
      
      // Hide sticky date 800ms after scrolling stops
      stickyTimeoutRef.current = setTimeout(() => {
        setStickyDate(null);
      }, 800);
    }
    
    // Hide scroll button while scrolling
    setShowScrollBtn(false);
    
    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Show button after user stops scrolling (if not at bottom)
    scrollTimeoutRef.current = setTimeout(() => {
      if (!atBottom && distanceFromBottom > 150) {
        setShowScrollBtn(true);
      }
    }, 150);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (stickyTimeoutRef.current) clearTimeout(stickyTimeoutRef.current);
    };
  }, []);

  // Group messages by date with grouping info
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = '';

    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msg.createdAt, id: `date-${msgDate}` });
      }

      // Determine grouping — consecutive messages from same sender
      const prevMsg = index > 0 ? messages[index - 1] : null;
      const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

      const prevSameSender = prevMsg && prevMsg.senderId === msg.senderId &&
        new Date(msg.createdAt).toDateString() === new Date(prevMsg.createdAt).toDateString();
      const nextSameSender = nextMsg && nextMsg.senderId === msg.senderId &&
        new Date(msg.createdAt).toDateString() === new Date(nextMsg?.createdAt).toDateString();

      const isFirstInGroup = !prevSameSender;
      const isLastInGroup = !nextSameSender;

      groups.push({
        type: 'message',
        data: msg,
        id: msg._id,
        isFirstInGroup,
        isLastInGroup,
      });
    });

    return groups;
  }, [messages]);

  if (isLoadingMessages) {
    return (
      <div className="msg-list-wrapper">
        <div className="msg-list">
          <div className="msg-list__loading">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`msg-list__skeleton ${i % 3 === 0 ? 'msg-list__skeleton--right' : ''}`}
              >
                <div
                  className="skeleton"
                  style={{
                    width: [180, 120, 240, 100, 200, 140, 220, 160][i],
                    height: 36,
                    borderRadius: 14,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="msg-list-wrapper">
      {/* Sticky date header */}
      <AnimatePresence>
        {stickyDate && (
          <motion.div
            className="msg-list__sticky-date"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <span className="msg-list__sticky-date-label">
              {formatDateSeparator(stickyDate)}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="msg-list" 
        ref={containerRef} 
        onScroll={handleScroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="msg-list__content">
          {groupedMessages.map((item) =>
            item.type === 'date' ? (
              <div 
                key={item.id} 
                className="msg-list__date"
                ref={(el) => {
                  if (el) {
                    dateRefs.current[item.date] = el;
                  } else {
                    delete dateRefs.current[item.date];
                  }
                }}
              >
                <span className="msg-list__date-label">
                  {formatDateSeparator(item.date)}
                </span>
              </div>
            ) : (
              <MessageBubble
                key={item.id}
                message={item.data}
                currentUserId={currentUserId}
                isFirstInGroup={item.isFirstInGroup}
                isLastInGroup={item.isLastInGroup}
              />
            )
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {isContactTyping && (
              <motion.div
                className="msg-list__typing"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                <div className="msg-list__typing-bubble">
                  <div className="msg-list__typing-dots">
                    <span className="msg-list__typing-dot" />
                    <span className="msg-list__typing-dot" />
                    <span className="msg-list__typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>
      </motion.div>

      {/* Scroll to bottom FAB */}
      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            className="msg-list__scroll-btn"
            onClick={scrollToBottom}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            aria-label="Scroll to latest messages"
          >
            <ChevronDown size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
