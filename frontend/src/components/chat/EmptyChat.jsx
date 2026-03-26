import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap } from 'lucide-react';
import Logo from '../shared/Logo';
import './EmptyChat.css';

export default function EmptyChat() {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div className="empty-chat">
      {/* Background orbs */}
      <div className="empty-chat__orbs">
        <div className="empty-chat__orb empty-chat__orb--1" />
        <div className="empty-chat__orb empty-chat__orb--2" />
        <div className="empty-chat__orb empty-chat__orb--3" />
      </div>

      <motion.div
        className="empty-chat__content"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.div
          className="empty-chat__icon"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <Logo size={88} />
        </motion.div>

        <h2 className="empty-chat__greeting">{greeting}</h2>
        <h3 className="empty-chat__title">Welcome to Relay</h3>
        <p className="empty-chat__description">
          Select a contact from the sidebar to start a conversation.
        </p>

        <div className="empty-chat__features">
          <div className="empty-chat__feature">
            <Zap size={16} />
            <span>Real-time messaging</span>
          </div>
          <div className="empty-chat__feature">
            <Shield size={16} />
            <span>Private & secure</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
