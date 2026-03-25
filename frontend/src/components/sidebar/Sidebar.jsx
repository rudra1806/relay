import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, PanelLeftClose, PanelLeft, MessageSquarePlus, Settings, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import Avatar from '../shared/Avatar';
import { formatSidebarTime } from '../../lib/utils';
import './Sidebar.css';

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const { contacts, selectedContact, setSelectedContact, isLoadingContacts, lastMessages, unreadCounts } = useChatStore();
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  // Sort contacts: those with messages first (by most recent), then the rest
  const sortedContacts = useMemo(() => {
    const withMessages = [];
    const withoutMessages = [];

    contacts.forEach((c) => {
      if (lastMessages[c._id]) {
        withMessages.push(c);
      } else {
        withoutMessages.push(c);
      }
    });

    // Sort by last message time (most recent first)
    withMessages.sort((a, b) => {
      const timeA = new Date(lastMessages[a._id]?.createdAt || 0).getTime();
      const timeB = new Date(lastMessages[b._id]?.createdAt || 0).getTime();
      return timeB - timeA;
    });

    return [...withMessages, ...withoutMessages];
  }, [contacts, lastMessages]);

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return sortedContacts;
    const q = searchQuery.toLowerCase();
    return sortedContacts.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [sortedContacts, searchQuery]);

  const getLastMessagePreview = (contactId) => {
    const msg = lastMessages[contactId];
    if (!msg) return null;

    let preview = '';
    const isMine = msg.senderId === user?._id;
    const prefix = isMine ? 'You: ' : '';

    if (msg.text) {
      preview = prefix + (msg.text.length > 35 ? msg.text.slice(0, 35) + '…' : msg.text);
    } else if (msg.image) {
      preview = prefix + '📷 Photo';
    }

    return { preview, time: msg.createdAt };
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar__header">
        {!sidebarCollapsed && (
          <h2 className="sidebar__title">Messages</h2>
        )}
        <div className="sidebar__header-actions">
          <button
            className="sidebar__toggle"
            onClick={() => navigate('/profile')}
            aria-label="My profile"
            title="Profile & Settings"
          >
            <Settings size={18} />
          </button>
          <button
            className="sidebar__toggle"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
      </div>

      {/* Search */}
      {!sidebarCollapsed && (
        <div className="sidebar__search">
          <Search size={16} className="sidebar__search-icon" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="sidebar__search-input"
          />
        </div>
      )}

      {/* Contact list */}
      <div className="sidebar__list">
        {isLoadingContacts ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sidebar__skeleton">
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }} />
              {!sidebarCollapsed && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div className="skeleton" style={{ width: '70%', height: 12 }} />
                  <div className="skeleton" style={{ width: '50%', height: 10 }} />
                </div>
              )}
            </div>
          ))
        ) : filteredContacts.length === 0 ? (
          <div className="sidebar__empty">
            {!sidebarCollapsed && (
              <>
                <MessageSquarePlus size={32} className="sidebar__empty-icon" />
                <p className="sidebar__empty-text">
                  {searchQuery ? 'No contacts found' : 'No contacts yet'}
                </p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredContacts.map((contact, i) => {
              const lastMsg = getLastMessagePreview(contact._id);
              const unread = unreadCounts[contact._id] || 0;
              return (
                <motion.button
                  key={contact._id}
                  className={`sidebar__contact ${
                    selectedContact?._id === contact._id ? 'sidebar__contact--active' : ''
                  } ${unread > 0 ? 'sidebar__contact--unread' : ''}`}
                  onClick={() => setSelectedContact(contact)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  layout
                >
                  <div className="sidebar__avatar-wrapper">
                    <Avatar
                      src={contact.profilePic}
                      name={contact.name}
                      size={sidebarCollapsed ? 'md' : 'lg'}
                    />
                    {unread > 0 && sidebarCollapsed && (
                      <span className="sidebar__badge sidebar__badge--dot" />
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="sidebar__contact-info">
                      <div className="sidebar__contact-row">
                        <span className="sidebar__contact-name">{contact.name}</span>
                        {lastMsg && (
                          <span className="sidebar__contact-time">
                            {formatSidebarTime(lastMsg.time)}
                          </span>
                        )}
                      </div>
                      <div className="sidebar__contact-row">
                        <span className="sidebar__contact-preview">
                          {lastMsg ? lastMsg.preview : contact.email}
                        </span>
                        {unread > 0 && (
                          <span className="sidebar__badge">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </aside>
  );
}
