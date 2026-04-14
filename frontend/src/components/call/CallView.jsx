import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  User,
  SwitchCamera,
} from 'lucide-react';
import useCallStore from '../../store/useCallStore';
import useAuthStore from '../../store/useAuthStore';
import './CallView.css';

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function CallView() {
  const {
    callStatus,
    callType,
    remoteUser,
    isMuted,
    isVideoOff,
    isRemoteMuted,
    isRemoteVideoOff,
    callDuration,
    localStream,
    remoteStream,
    endCall,
    toggleMute,
    toggleVideo,
    flipCamera,
  } = useCallStore();

  const currentUser = useAuthStore((s) => s.user);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef(null);

  // Attach local stream to video element
  // Re-run when isVideoOff changes because toggling camera remounts the <video> element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isVideoOff]);

  // Attach remote stream to video element (video calls)
  // Re-run when isRemoteVideoOff changes because toggling remounts the <video> element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, isRemoteVideoOff]);

  // Attach remote stream to audio element (voice calls)
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream && callType === 'audio') {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callType]);

  // Auto-hide controls on video calls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (callStatus === 'connected' && callType === 'video' && !isRemoteVideoOff) {
        setShowControls(false);
      }
    }, 4000);
  }, [callStatus, callType, isRemoteVideoOff]);

  useEffect(() => {
    if (callType === 'video' && callStatus === 'connected') {
      resetControlsTimer();
    }
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [callType, callStatus, resetControlsTimer]);

  if (callStatus === 'idle' || callStatus === 'ringing') return null;

  const isVideoCall = callType === 'video';
  const isConnected = callStatus === 'connected' && remoteStream;
  const isCalling = callStatus === 'calling';
  const isConnecting = callStatus === 'connecting';
  const showCenterInfo = !isVideoCall || !isConnected || isRemoteVideoOff;

  const getStatusText = () => {
    if (isCalling) return 'Calling';
    if (isConnecting) return 'Connecting';
    if (callStatus === 'connected' && !remoteStream) return 'Connecting';
    if (isConnected && isRemoteVideoOff) return 'Camera off';
    return '';
  };

  const getInitial = (name) => name?.charAt(0)?.toUpperCase() || '?';

  return (
    <AnimatePresence>
      <motion.div
        className="cv"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onMouseMove={isVideoCall ? resetControlsTimer : undefined}
        onClick={isVideoCall ? resetControlsTimer : undefined}
      >
        {/* ── Ambient Background (audio/pre-connect) ── */}
        {showCenterInfo && (
          <div className="cv__bg">
            <div className="cv__bg-glow cv__bg-glow--gold" />
            <div className="cv__bg-glow cv__bg-glow--lavender" />
            <div className="cv__bg-mesh" />
          </div>
        )}

        {/* ── Hidden audio element for voice calls ── */}
        {!isVideoCall && (
          <audio ref={remoteAudioRef} autoPlay playsInline />
        )}

        {/* ── Remote Video ── */}
        {isVideoCall && isConnected && !isRemoteVideoOff && (
          <motion.div
            className="cv__remote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <video
              ref={remoteVideoRef}
              className="cv__remote-video"
              autoPlay
              playsInline
            />
          </motion.div>
        )}

        {/* ── Floating Chips ── */}
        <motion.div
          className={`cv__chips ${!showControls ? 'cv__chips--hidden' : ''}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="cv__chip cv__chip--name">
            <span>{remoteUser?.name}</span>
            {isRemoteMuted && (
              <span className="cv__chip-muted">
                <MicOff size={10} />
              </span>
            )}
          </div>

          {isConnected && (
            <div className="cv__chip cv__chip--time">
              <div className="cv__chip-dot" />
              <span>{formatDuration(callDuration)}</span>
            </div>
          )}
        </motion.div>

        {/* ── Center Info ── */}
        {showCenterInfo && (
          <motion.div
            className="cv__center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Avatar with unique ring */}
            <div className={`cv__avatar ${
              isCalling || isConnecting ? 'cv__avatar--calling' :
              isConnected ? 'cv__avatar--connected' : ''
            }`}>
              {/* Spinning dashed ring */}
              {(isCalling || isConnecting) && (
                <svg className="cv__avatar-ring" viewBox="0 0 200 200">
                  <circle
                    cx="100" cy="100" r="92"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="1.5"
                    strokeDasharray="8 6"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#e8c872" stopOpacity="0.8" />
                      <stop offset="50%" stopColor="#a78bdb" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#e8c872" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                </svg>
              )}

              {/* Connected ring */}
              {isConnected && (
                <div className="cv__avatar-connected-ring" />
              )}

              {/* Avatar content */}
              <div className="cv__avatar-inner">
                {remoteUser?.profilePic ? (
                  <img
                    src={remoteUser.profilePic}
                    alt={remoteUser.name}
                    className="cv__avatar-img"
                  />
                ) : (
                  <div className="cv__avatar-fallback">
                    {getInitial(remoteUser?.name)}
                  </div>
                )}
              </div>
            </div>

            {/* Name */}
            <h2 className="cv__name">{remoteUser?.name}</h2>

            {/* Status */}
            {!isConnected ? (
              <div className="cv__status">
                <motion.span
                  className="cv__status-text"
                  key={getStatusText()}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {getStatusText()}
                </motion.span>
                {/* Animated dots */}
                <span className="cv__status-dots">
                  <span className="cv__status-dot" />
                  <span className="cv__status-dot" />
                  <span className="cv__status-dot" />
                </span>
              </div>
            ) : (
              <div className="cv__connected-meta">
                <span className="cv__duration">{formatDuration(callDuration)}</span>
                {isRemoteMuted && (
                  <span className="cv__remote-muted">
                    <MicOff size={11} />
                    <span>Muted</span>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}



        {/* ── Local Video PiP ── */}
        {isVideoCall && localStream && (
          <motion.div
            className={`cv__pip ${!showControls && isConnected ? 'cv__pip--mini' : ''}`}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {isVideoOff ? (
              <div className="cv__pip-off">
                {currentUser?.profilePic ? (
                  <img src={currentUser.profilePic} alt="You" className="cv__pip-avatar" />
                ) : (
                  <User size={20} className="cv__pip-icon" />
                )}
              </div>
            ) : (
              <video
                ref={localVideoRef}
                className="cv__pip-video"
                autoPlay
                playsInline
                muted
              />
            )}
            {isMuted && (
              <div className="cv__pip-muted">
                <MicOff size={9} />
              </div>
            )}
          </motion.div>
        )}

        {/* ── Controls ── */}
        <motion.div
          className={`cv__bar ${!showControls ? 'cv__bar--hidden' : ''}`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 24 }}
          transition={{ duration: 0.3 }}
        >
          <div className="cv__bar-inner">
            {/* Mute */}
            <button
              className={`cv__btn ${isMuted ? 'cv__btn--on' : ''}`}
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <MicOff size={19} /> : <Mic size={19} />}
            </button>

            {/* Video */}
            {isVideoCall && (
              <button
                className={`cv__btn ${isVideoOff ? 'cv__btn--on' : ''}`}
                onClick={toggleVideo}
                aria-label={isVideoOff ? 'Camera on' : 'Camera off'}
              >
                {isVideoOff ? <VideoOff size={19} /> : <Video size={19} />}
              </button>
            )}

            {/* Flip Camera — only on video calls when camera is on */}
            {isVideoCall && !isVideoOff && (
              <button
                className="cv__btn"
                onClick={flipCamera}
                aria-label="Flip camera"
              >
                <SwitchCamera size={19} />
              </button>
            )}

            {/* End */}
            <button
              className="cv__btn cv__btn--end"
              onClick={endCall}
              aria-label="End call"
            >
              <PhoneOff size={20} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
