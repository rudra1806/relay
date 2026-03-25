import { useRef, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import MessageBubble from './MessageBubble';
import { formatDateSeparator } from '../../lib/utils';
import './MessageList.css';

export default function MessageList() {
  const { messages, isLoadingMessages } = useChatStore();
  const currentUserId = useAuthStore((s) => s.user?._id);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Detect scroll position
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 200);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const groupedMessages = useMemo(() => {
    const groups = [];
    let currentDate = '';

    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt).toDateString();
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ type: 'date', date: msg.createdAt, id: `date-${msgDate}` });
      }
      groups.push({ type: 'message', data: msg, id: msg._id });
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
              <div className="skeleton" style={{ width: [180, 120, 240, 100, 200, 140, 220, 160][i], height: 36 }} />
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
            <MessageBubble key={item.id} message={item.data} currentUserId={currentUserId} />
          )
        )}
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
            <ChevronDown size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
