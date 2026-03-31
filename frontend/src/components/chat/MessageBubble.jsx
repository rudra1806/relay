import { motion } from 'framer-motion';
import { CheckCheck, Lock } from 'lucide-react';
import { formatMessageTime } from '../../lib/utils';
import useUIStore from '../../store/useUIStore';
import './MessageBubble.css';

export default function MessageBubble({ message, currentUserId, isFirstInGroup = true, isLastInGroup = true }) {
  const { setImagePreview } = useUIStore();
  const isSent = message.senderId === currentUserId;
  const isImageOnly = message.image && !message.text;
  const isEncrypted = !!message.nonce;
  const decryptFailed = message._decryptFailed;

  return (
    <motion.div
      className={`msg ${isSent ? 'msg--sent' : 'msg--received'} ${
        !isFirstInGroup ? 'msg--grouped' : ''
      } ${isLastInGroup ? 'msg--last-in-group' : ''}`}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      layout
    >
      <div className={`msg__bubble ${isImageOnly ? 'msg__bubble--image-only' : ''} ${decryptFailed ? 'msg__bubble--decrypt-failed' : ''}`}>
        {decryptFailed ? (
          /* Decrypt failure state */
          <div className="msg__encrypted">
            <Lock size={14} className="msg__encrypted-icon" />
            <span className="msg__encrypted-text">Encrypted message</span>
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Footer: time + encryption indicator + read status */}
        <div className="msg__footer">
          {isEncrypted && !decryptFailed && (
            <Lock size={10} className="msg__lock" />
          )}
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
