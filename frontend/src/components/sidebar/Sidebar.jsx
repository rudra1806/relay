import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, PanelLeftClose, PanelLeft,
  Settings, X, UserPlus, Inbox, MessageSquare, Users,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import useContactStore from '../../store/useContactStore';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import useSocketStore from '../../store/useSocketStore';
import Avatar from '../shared/Avatar';
import Logo from '../shared/Logo';
import ContactRequestsModal from '../shared/ContactRequestsModal';
import AddContactModal from '../shared/AddContactModal';
import { formatSidebarTime } from '../../lib/utils';
import './Sidebar.css';

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'all'
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const searchRef = useRef(null);

  // Reset search when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  const {
    contacts, selectedContact, setSelectedContact,
    isLoadingContacts, lastMessages, unreadCounts,
  } = useChatStore();
  const { pendingRequests } = useContactStore();
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);
  const navigate = useNavigate();

  /* ── Two-Tab System ─────────────────────────────────────────── */

  // Tab 1: Messages - Contacts with message history
  // Sort: Unread first, then by most recent activity
  const messagesTab = useMemo(() => {
    const withMessages = contacts.filter((c) => !!lastMessages[c._id]);
    
    return withMessages.sort((a, b) => {
      const unreadA = unreadCounts[a._id] || 0;
      const unreadB = unreadCounts[b._id] || 0;
      
      // Unread messages come first
      if (unreadA > 0 && unreadB === 0) return -1;
      if (unreadB > 0 && unreadA === 0) return 1;
      
      // Then sort by most recent message
      const timeA = new Date(lastMessages[a._id]?.createdAt || 0).getTime();
      const timeB = new Date(lastMessages[b._id]?.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [contacts, lastMessages, unreadCounts]);

  // Tab 2: All Contacts - ALL contacts sorted alphabetically
  const allContactsTab = useMemo(() => {
    return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts]);

  // Apply search filter
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return activeTab === 'messages' ? messagesTab : allContactsTab;
    }
    
    const q = searchQuery.toLowerCase();
    const source = activeTab === 'messages' ? messagesTab : allContactsTab;
    return source.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [activeTab, messagesTab, allContactsTab, searchQuery]);

  /* ── Helpers ──────────────────────────────────────────────────── */

  const getLastMessagePreview = (contactId) => {
    if (typingUsers[contactId]) return { preview: null, isTyping: true, time: null };
    const msg = lastMessages[contactId];
    if (!msg) return null;
    const isMine = msg.senderId === user?._id;
    const prefix = isMine ? 'You: ' : '';
    let preview = '';
    if (msg.text) {
      preview = prefix + (msg.text.length > 35 ? msg.text.slice(0, 35) + '…' : msg.text);
    } else if (msg.image) {
      preview = prefix + '📷 Photo';
    }
    return { preview, time: msg.createdAt, isTyping: false };
  };

  const totalUnread = useMemo(
    () => Object.values(unreadCounts).reduce((s, n) => s + n, 0),
    [unreadCounts]
  );

  /* ── Render Contact Item ──────────────────────────────────────── */
  const renderContact = (contact, index, hasHistory = true) => {
    const lastMsg = hasHistory ? getLastMessagePreview(contact._id) : null;
    const unread = unreadCounts[contact._id] || 0;
    const isOnline = onlineUsers.includes(contact._id);

    return (
      <motion.button
        key={contact._id}
        className={`sidebar__contact ${
          selectedContact?._id === contact._id ? 'sidebar__contact--active' : ''
        } ${unread > 0 ? 'sidebar__contact--unread' : ''} ${
          !hasHistory ? 'sidebar__contact--no-history' : ''
        }`}
        onClick={() => setSelectedContact(contact)}
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ delay: Math.min(index * 0.02, 0.15), duration: 0.2 }}
        layout
      >
        <div className="sidebar__avatar-wrapper">
          <Avatar
            src={contact.profilePic}
            name={contact.name}
            size={sidebarCollapsed ? 'md' : 'lg'}
            showOnline
            isOnline={isOnline}
          />
          {unread > 0 && sidebarCollapsed && (
            <span className="sidebar__badge sidebar__badge--dot" />
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="sidebar__contact-info">
            <div className="sidebar__contact-row">
              <span className="sidebar__contact-name">{contact.name}</span>
              <div className="sidebar__contact-meta">
                {lastMsg?.time && (
                  <span className="sidebar__contact-time">
                    {formatSidebarTime(lastMsg.time)}
                  </span>
                )}
              </div>
            </div>
            <div className="sidebar__contact-row">
              {lastMsg?.isTyping ? (
                <span className="sidebar__typing-text">typing…</span>
              ) : (
                <span className="sidebar__contact-preview">
                  {lastMsg
                    ? lastMsg.preview
                    : isOnline
                    ? '● Online'
                    : contact.email}
                </span>
              )}
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
  };

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>

      {/* ── Header ── */}
      <div className="sidebar__header">
        {!sidebarCollapsed ? (
          <>
            <div className="sidebar__brand">
              <Logo size={24} />
              <h2 className="sidebar__title">Relay</h2>
            </div>
            <div className="sidebar__header-actions">
              <button
                className="sidebar__icon-btn"
                onClick={() => setShowAddContactModal(true)}
                aria-label="Add contact"
                title="Add contact"
              >
                <UserPlus size={18} />
              </button>
              <button
                className="sidebar__icon-btn sidebar__icon-btn--with-badge"
                onClick={() => setShowRequestsModal(true)}
                aria-label="Contact requests"
                title="Contact requests"
              >
                <Inbox size={18} />
                {pendingRequests.length > 0 && (
                  <span className="sidebar__notification-badge">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                className="sidebar__icon-btn"
                onClick={toggleSidebar}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sidebar__brand--collapsed">
              <Logo size={28} />
            </div>
            <div className="sidebar__header-actions">
              <button
                className="sidebar__icon-btn"
                onClick={() => setShowAddContactModal(true)}
                aria-label="Add contact"
                title="Add contact"
              >
                <UserPlus size={18} />
              </button>
              <button
                className="sidebar__icon-btn sidebar__icon-btn--with-badge"
                onClick={() => setShowRequestsModal(true)}
                aria-label="Contact requests"
                title="Contact requests"
              >
                <Inbox size={18} />
                {pendingRequests.length > 0 && (
                  <span className="sidebar__notification-badge">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
              <button
                className="sidebar__icon-btn"
                onClick={toggleSidebar}
                aria-label="Expand sidebar"
                title="Expand sidebar"
              >
                <PanelLeft size={18} />
              </button>
            </div>
          </>
        )}
      </div>

      {/* ── Tabs ── */}
      {!sidebarCollapsed && (
        <div className="sidebar__tabs">
          <button
            className={`sidebar__tab ${activeTab === 'messages' ? 'sidebar__tab--active' : ''}`}
            onClick={() => handleTabChange('messages')}
          >
            <MessageSquare size={16} />
            <span>Messages</span>
            {totalUnread > 0 && (
              <span className="sidebar__tab-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>
            )}
          </button>
          <button
            className={`sidebar__tab ${activeTab === 'all' ? 'sidebar__tab--active' : ''}`}
            onClick={() => handleTabChange('all')}
          >
            <Users size={16} />
            <span>All Contacts</span>
            <span className="sidebar__tab-count">{contacts.length}</span>
          </button>
        </div>
      )}

      {/* ── Search ── */}
      {!sidebarCollapsed && (
        <div className="sidebar__search">
          <div className="sidebar__search-inner">
            <Search size={15} className="sidebar__search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar__search-input"
            />
            {searchQuery && (
              <button
                className="sidebar__search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Contact list with tab-based filtering ── */}
      <div className="sidebar__list">
        {isLoadingContacts ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="sidebar__skeleton">
              <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
              {!sidebarCollapsed && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="skeleton" style={{ width: '65%', height: 12, borderRadius: 6 }} />
                  <div className="skeleton" style={{ width: '45%', height: 10, borderRadius: 6 }} />
                </div>
              )}
            </div>
          ))
        ) : contacts.length === 0 ? (
          <div className="sidebar__empty">
            {!sidebarCollapsed && (
              <>
                <div className="sidebar__empty-icon-wrap">
                  <MessageSquare size={28} className="sidebar__empty-icon" />
                </div>
                <p className="sidebar__empty-text">No contacts yet</p>
                <p className="sidebar__empty-hint">Add contacts to start chatting</p>
                <button
                  className="sidebar__new-chat-btn"
                  onClick={() => setShowAddContactModal(true)}
                >
                  Add Contact
                </button>
              </>
            )}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="sidebar__empty">
            {!sidebarCollapsed && (
              <>
                <p className="sidebar__empty-text">
                  {searchQuery ? 'No contacts found' : activeTab === 'messages' ? 'No messages yet' : 'No contacts'}
                </p>
                <p className="sidebar__empty-hint">
                  {searchQuery ? 'Try a different name or email' : 'Start a conversation'}
                </p>
              </>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredContacts.map((contact, i) => {
              const hasHistory = !!lastMessages[contact._id];
              return renderContact(contact, i, hasHistory);
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── User footer ── */}
      <div className="sidebar__footer">
        {!sidebarCollapsed ? (
          <>
            <Avatar src={user?.profilePic} name={user?.name} size="md" />
            <div className="sidebar__footer-info">
              <span className="sidebar__footer-name">{user?.name}</span>
              <span className="sidebar__footer-status">Online</span>
            </div>
            <button
              className="sidebar__footer-settings"
              onClick={() => navigate('/profile')}
              aria-label="Settings"
              title="Profile & Settings"
            >
              <Settings size={18} />
            </button>
          </>
        ) : (
          <button
            className="sidebar__footer-settings"
            onClick={() => navigate('/profile')}
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showRequestsModal && (
          <ContactRequestsModal
            isOpen={showRequestsModal}
            onClose={() => setShowRequestsModal(false)}
          />
        )}
        {showAddContactModal && (
          <AddContactModal
            isOpen={showAddContactModal}
            onClose={() => setShowAddContactModal(false)}
          />
        )}
      </AnimatePresence>
    </aside>
  );
}
