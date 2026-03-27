import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon } from 'lucide-react';
import api from '../../lib/api';
import { ENDPOINTS } from '../../lib/constants';
import useContactStore from '../../store/useContactStore';
import Avatar from './Avatar';
import Button from './Button';
import Input from './Input';
import './AddContactModal.css';

export default function AddContactModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { sendContactRequest } = useContactStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.get(ENDPOINTS.CONTACTS.SEARCH, {
        params: { query: searchQuery },
      });
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    const success = await sendContactRequest(userId);
    if (success) {
      // Update the local state to show pending status
      setSearchResults((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, connectionStatus: 'pending' } : user
        )
      );
    }
  };

  const getStatusButton = (user) => {
    switch (user.connectionStatus) {
      case 'connected':
        return (
          <span className="status-badge status-connected">Connected</span>
        );
      case 'pending':
        return (
          <span className="status-badge status-pending">Pending</span>
        );
      case 'received':
        return (
          <span className="status-badge status-received">Sent you request</span>
        );
      default:
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSendRequest(user._id)}
          >
            Add Contact
          </Button>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="add-contact-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="modal-header">
          <h2>Add Contact</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSearch} className="search-form">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <Button type="submit" variant="primary" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </form>

          <div className="search-results">
            {isSearching ? (
              <div className="empty-state">Searching...</div>
            ) : searchResults.length === 0 && searchQuery ? (
              <div className="empty-state">
                <SearchIcon size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p>No users found</p>
              </div>
            ) : (
              searchResults.map((user, index) => (
                <motion.div
                  key={user._id}
                  className="user-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Avatar src={user.profilePic} name={user.name} size="md" />
                  <div className="user-info">
                    <p className="user-name">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                  {getStatusButton(user)}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
