import { motion } from 'framer-motion';
import { formatMessageTime } from '../../lib/utils';
import useUIStore from '../../store/useUIStore';
import './MessageBubble.css';

export default function MessageBubble({ message, currentUserId }) {
  const { setImagePreview } = useUIStore();
  const isSent = message.senderId === currentUserId;
  const isImageOnly = message.image && !message.text;

  return (
    <motion.div
      className={`msg ${isSent ? 'msg--sent' : 'msg--received'}`}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      layout
    >
      <div className={`msg__bubble ${isImageOnly ? 'msg__bubble--image-only' : ''}`}>
        {message.image && (
          <button
            className="msg__image-btn"
            onClick={() => setImagePreview(message.image)}
            aria-label="View full image"
          >
            <img
              src={message.image}
              alt="Shared image"
              className="msg__image"
              loading="lazy"
            />
          </button>
        )}
        {message.text && <p className="msg__text">{message.text}</p>}
        <span className="msg__time">{formatMessageTime(message.createdAt)}</span>
      </div>
    </motion.div>
  );
}
