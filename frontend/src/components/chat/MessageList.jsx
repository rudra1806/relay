import { useRef, useEffect, useMemo, useState } from 'react';
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
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Scroll to bottom when new messages arrive (only if already at bottom)
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' });
  }, []);

  // Detect scroll position with debounce
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const atBottom = distanceFromBottom < 50;
    
    // Update bottom state immediately
    setIsAtBottom(atBottom);
    
    // Hide button while scrolling
    setShowScrollBtn(false);
    
    // Clear previous timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Show button after user stops scrolling (if not at bottom)
    scrollTimeoutRef.current = setTimeout(() => {
      if (!atBottom && distanceFromBottom > 100) {
        setShowScrollBtn(true);
      }
    }, 150);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsAtBottom(true);
    setShowScrollBtn(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
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
    );
  }

  return (
    <div className="msg-list" ref={containerRef} onScroll={handleScroll}>
      <div className="msg-list__content">
        {groupedMessages.map((item) =>
          item.type === 'date' ? (
            <div key={item.id} className="msg-list__date">
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
