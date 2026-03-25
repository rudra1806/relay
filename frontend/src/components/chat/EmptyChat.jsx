import { motion } from 'framer-motion';
import { MessageCircle, Sparkles } from 'lucide-react';
import './EmptyChat.css';

export default function EmptyChat() {
  return (
    <div className="empty-chat">
      <motion.div
        className="empty-chat__content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="empty-chat__icon"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        >
          <MessageCircle size={48} />
          <Sparkles className="empty-chat__sparkle" size={16} />
        </motion.div>
        <h2 className="empty-chat__title">Welcome to Relay</h2>
        <p className="empty-chat__description">
          Select a contact from the sidebar to start a conversation.
          <br />
          Your messages are private and secure.
        </p>
      </motion.div>
    </div>
  );
}
