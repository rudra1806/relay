import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Inbox, UserCheck } from 'lucide-react';
import useContactStore from '../../store/useContactStore';
import Avatar from './Avatar';
import Button from './Button';
import './ContactRequestsModal.css';

export default function ContactRequestsModal({ isOpen, onClose }) {
  const {
    pendingRequests,
    sentRequests,
    isLoadingRequests,
    fetchPendingRequests,
    fetchSentRequests,
    acceptRequest,
    declineRequest,
    cancelRequest,
  } = useContactStore();

  useEffect(() => {
    if (isOpen) {
      fetchPendingRequests();
      fetchSentRequests();
    }
  }, [isOpen, fetchPendingRequests, fetchSentRequests]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="contact-requests-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="modal-header">
          <h2>Contact Requests</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Received Requests */}
          <section className="requests-section">
            <h3>
              <Inbox size={14} />
              Received ({pendingRequests.length})
            </h3>
            {isLoadingRequests ? (
              <div className="loading">Loading requests...</div>
            ) : pendingRequests.length === 0 ? (
              <p className="empty-state">No pending requests</p>
            ) : (
              <div className="requests-list">
                {pendingRequests.map((request) => (
                  <motion.div
                    key={request._id}
                    className="request-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Avatar
                      src={request.senderId.profilePic}
                      name={request.senderId.name}
                      size="md"
                    />
                    <div className="request-info">
                      <p className="request-name">{request.senderId.name}</p>
                      <p className="request-email">{request.senderId.email}</p>
                    </div>
                    <div className="request-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => acceptRequest(request._id)}
                        disabled={isLoadingRequests}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => declineRequest(request._id)}
                        disabled={isLoadingRequests}
                      >
                        Decline
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Sent Requests */}
          <section className="requests-section">
            <h3>
              <UserCheck size={14} />
              Sent ({sentRequests.length})
            </h3>
            {sentRequests.length === 0 ? (
              <p className="empty-state">No sent requests</p>
            ) : (
              <div className="requests-list">
                {sentRequests.map((request) => (
                  <motion.div
                    key={request._id}
                    className="request-item"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                  >
                    <Avatar
                      src={request.receiverId.profilePic}
                      name={request.receiverId.name}
                      size="md"
                    />
                    <div className="request-info">
                      <p className="request-name">{request.receiverId.name}</p>
                      <p className="request-email">{request.receiverId.email}</p>
                    </div>
                    <div className="request-actions">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => cancelRequest(request._id)}
                        disabled={isLoadingRequests}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
}
