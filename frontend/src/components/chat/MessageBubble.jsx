import { motion } from 'framer-motion';
import { CheckCheck } from 'lucide-react';
import { formatMessageTime } from '../../lib/utils';
import useUIStore from '../../store/useUIStore';
import './MessageBubble.css';

export default function MessageBubble({ message, currentUserId, isFirstInGroup = true, isLastInGroup = true }) {
  const { setImagePreview } = useUIStore();
  const isSent = message.senderId === currentUserId;
  const isImageOnly = message.image && !message.text;

  return (
    <motion.div
      className={`msg ${isSent ? 'msg--sent' : 'msg--received'} ${
        !isFirstInGroup ? 'msg--grouped' : ''
      } ${isLastInGroup ? 'msg--last-in-group' : ''}`}
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      layout
    >
      <div className={`msg__bubble ${isImageOnly ? 'msg__bubble--image-only' : ''}`}>
        {/* Image */}
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

        {/* Text */}
        {message.text && <p className="msg__text">{message.text}</p>}

        {/* Footer: time + read status */}
        <div className="msg__footer">
          <span className="msg__time">{formatMessageTime(message.createdAt)}</span>
          {isSent && (
            <span className="msg__read-status">
              <CheckCheck size={14} className={`msg__check ${message.isRead ? 'msg__check--read' : ''}`} />
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
