import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Video } from 'lucide-react';
import useCallStore from '../../store/useCallStore';
import './IncomingCallModal.css';

export default function IncomingCallModal() {
  const { callStatus, callType, remoteUser, acceptCall, rejectCall } = useCallStore();

  if (callStatus !== 'ringing' || !remoteUser) return null;

  const isVideoCall = callType === 'video';

  return (
    <AnimatePresence>
      <motion.div
        className="ic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="ic__card"
          initial={{ opacity: 0, scale: 0.92, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
        >
          {/* Type label */}
          <span className="ic__type">
            {isVideoCall ? 'Video Call' : 'Voice Call'}
          </span>

          {/* Avatar with spinning ring */}
          <div className="ic__avatar">
            <svg className="ic__avatar-ring" viewBox="0 0 160 160">
              <circle
                cx="80" cy="80" r="74"
                fill="none"
                stroke="url(#icGradient)"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="icGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e8c872" stopOpacity="0.7" />
                  <stop offset="50%" stopColor="#a78bdb" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#e8c872" stopOpacity="0.7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="ic__avatar-inner">
              {remoteUser.profilePic ? (
                <img
                  src={remoteUser.profilePic}
                  alt={remoteUser.name}
                  className="ic__avatar-img"
                />
              ) : (
                <div className="ic__avatar-fallback">
                  {remoteUser.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <h3 className="ic__name">{remoteUser.name}</h3>

          {/* Subtitle with animated dots */}
          <div className="ic__subtitle">
            <span>Incoming {isVideoCall ? 'video' : 'voice'} call</span>
            <span className="ic__subtitle-dots">
              <span className="ic__subtitle-dot" />
              <span className="ic__subtitle-dot" />
              <span className="ic__subtitle-dot" />
            </span>
          </div>

          {/* Actions */}
          <div className="ic__actions">
            <button className="ic__act" onClick={rejectCall} aria-label="Decline">
              <div className="ic__act-circle ic__act-circle--decline">
                <PhoneOff size={21} />
              </div>
              <span className="ic__act-label">Decline</span>
            </button>

            <button className="ic__act" onClick={acceptCall} aria-label="Accept">
              <div className="ic__act-circle ic__act-circle--accept">
                {isVideoCall ? <Video size={21} /> : <Phone size={21} />}
              </div>
              <span className="ic__act-label">Accept</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
