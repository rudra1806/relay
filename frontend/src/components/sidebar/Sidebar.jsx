import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, PanelLeftClose, PanelLeft, MessageSquarePlus,
  Settings, X, Clock, Users, BellDot,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useChatStore from '../../store/useChatStore';
import useAuthStore from '../../store/useAuthStore';
import useUIStore from '../../store/useUIStore';
import useSocketStore from '../../store/useSocketStore';
import Avatar from '../shared/Avatar';
import Logo from '../shared/Logo';
import { formatSidebarTime } from '../../lib/utils';
import './Sidebar.css';

const TABS = [
  { id: 'recent', label: 'Recent', icon: Clock },
  { id: 'all',    label: 'All',    icon: Users },
  { id: 'unread', label: 'Unread', icon: BellDot },
];

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  const {
    contacts, selectedContact, setSelectedContact,
    isLoadingContacts, lastMessages, unreadCounts,
  } = useChatStore();
  const { user } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, activeTab, setActiveTab } = useUIStore();
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);
  const navigate = useNavigate();

  /* ── Derived lists ────────────────────────────────────────────── */

  // Contacts that have at least one message, sorted newest-first
  const recentContacts = useMemo(() => {
    return contacts
      .filter((c) => !!lastMessages[c._id])
      .sort((a, b) => {
        const tA = new Date(lastMessages[a._id]?.createdAt || 0).getTime();
        const tB = new Date(lastMessages[b._id]?.createdAt || 0).getTime();
        return tB - tA;
      });
  }, [contacts, lastMessages]);

  // All contacts: messaged ones first (sorted newest), then the rest alphabetically
  const allContacts = useMemo(() => {
    const withMsg = recentContacts;
    const withoutMsg = contacts
      .filter((c) => !lastMessages[c._id])
      .sort((a, b) => a.name.localeCompare(b.name));
    return [...withMsg, ...withoutMsg];
  }, [recentContacts, contacts, lastMessages]);

  // Unread only
  const unreadContacts = useMemo(() => {
    return recentContacts.filter((c) => (unreadCounts[c._id] || 0) > 0);
  }, [recentContacts, unreadCounts]);

  // Base list by tab
  const baseList = useMemo(() => {
    if (activeTab === 'recent') return recentContacts;
    if (activeTab === 'unread') return unreadContacts;
    return allContacts;
  }, [activeTab, recentContacts, unreadContacts, allContacts]);

  // Apply search filter
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return baseList;
    const q = searchQuery.toLowerCase();
    return baseList.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
    );
  }, [baseList, searchQuery]);

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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
  };

  /* ── Empty-state copy ─────────────────────────────────────────── */
  const emptyText = searchQuery
    ? 'No contacts found'
    : activeTab === 'unread'
    ? 'All caught up!'
    : activeTab === 'recent'
    ? 'No conversations yet'
    : 'No contacts';

  const emptyHint = searchQuery
    ? 'Try a different name or email'
    : activeTab === 'unread'
    ? 'No unread messages right now'
    : activeTab === 'recent'
    ? 'Switch to "All" to start a chat'
    : 'No users registered yet';

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar--collapsed' : ''}`}>

      {/* ── Header ── */}
      <div className="sidebar__header">
        {!sidebarCollapsed && (
          <div className="sidebar__brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Logo size={24} />
            <h2 className="sidebar__title">Messages</h2>
            {totalUnread > 0 && (
              <span className="sidebar__total-badge">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
        )}
        <div className="sidebar__header-actions">
          {!sidebarCollapsed && (
            <button
              className="sidebar__icon-btn"
              onClick={() => {
                handleTabChange('all');
                setTimeout(() => searchRef.current?.focus(), 80);
              }}
              aria-label="New conversation"
              title="New conversation"
            >
              <MessageSquarePlus size={17} />
            </button>
          )}
          <button
            className="sidebar__icon-btn"
            onClick={() => navigate('/profile')}
            aria-label="My profile"
            title="Profile & Settings"
          >
            <Settings size={18} />
          </button>
          <button
            className="sidebar__icon-btn"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>
      </div>

      {/* ── Search (always visible when not collapsed) ── */}
      {!sidebarCollapsed && (
        <div className="sidebar__search">
          <div className="sidebar__search-inner">
            <Search size={15} className="sidebar__search-icon" />
            <input
              ref={searchRef}
              type="text"
              placeholder={
                activeTab === 'all'
                  ? 'Search all users…'
                  : activeTab === 'unread'
                  ? 'Search unread…'
                  : 'Search conversations…'
              }
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

      {/* ── Tabs ── */}
      {!sidebarCollapsed && (
        <div className="sidebar__tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`sidebar__tab ${activeTab === tab.id ? 'sidebar__tab--active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
              {tab.id === 'unread' && totalUnread > 0 && (
                <span className="sidebar__tab-count">{totalUnread}</span>
              )}
              {tab.id === 'recent' && recentContacts.length > 0 && activeTab !== 'recent' && (
                <span className="sidebar__tab-count sidebar__tab-count--dim">
                  {recentContacts.length}
                </span>
              )}
            </button>
          ))}
          <div
            className="sidebar__tab-indicator"
            style={{
              transform: `translateX(${TABS.findIndex((t) => t.id === activeTab) * 100}%)`,
              width: `${100 / TABS.length}%`,
            }}
          />
        </div>
      )}

      {/* ── "All" tab sub-header ── */}
      {!sidebarCollapsed && activeTab === 'all' && !searchQuery && (
        <div className="sidebar__section-label">
          {recentContacts.length > 0
            ? `${recentContacts.length} conversation${recentContacts.length !== 1 ? 's' : ''} · ${contacts.length - recentContacts.length} new`
            : `${contacts.length} users — start chatting`}
        </div>
      )}

      {/* ── Contact list ── */}
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
        ) : filteredContacts.length === 0 ? (
          <div className="sidebar__empty">
            {!sidebarCollapsed && (
              <>
                <div className="sidebar__empty-icon-wrap">
                  <MessageSquarePlus size={28} className="sidebar__empty-icon" />
                </div>
                <p className="sidebar__empty-text">{emptyText}</p>
                <p className="sidebar__empty-hint">{emptyHint}</p>
                {activeTab === 'recent' && (
                  <button
                    className="sidebar__new-chat-btn"
                    onClick={() => handleTabChange('all')}
                  >
                    Browse all users
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredContacts.map((contact, i) => {
              const lastMsg = getLastMessagePreview(contact._id);
              const unread = unreadCounts[contact._id] || 0;
              const isOnline = onlineUsers.includes(contact._id);
              const hasHistory = !!lastMessages[contact._id];

              return (
                <motion.button
                  key={contact._id}
                  className={`sidebar__contact ${
                    selectedContact?._id === contact._id ? 'sidebar__contact--active' : ''
                  } ${unread > 0 ? 'sidebar__contact--unread' : ''} ${
                    !hasHistory ? 'sidebar__contact--new' : ''
                  }`}
                  onClick={() => setSelectedContact(contact)}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: Math.min(i * 0.02, 0.15), duration: 0.2 }}
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
                          {!hasHistory && activeTab === 'all' && (
                            <span className="sidebar__new-pill">New</span>
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
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── User footer ── */}
      {!sidebarCollapsed && (
        <div className="sidebar__footer">
          <Avatar src={user?.profilePic} name={user?.name} size="sm" />
          <div className="sidebar__footer-info">
            <span className="sidebar__footer-name">{user?.name}</span>
            <span className="sidebar__footer-status">Online</span>
          </div>
        </div>
      )}
    </aside>
  );
}
