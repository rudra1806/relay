import { ArrowLeft, Phone, Video, Search, MoreVertical, UserMinus } from 'lucide-react';
import { useState } from 'react';
import useChatStore from '../../store/useChatStore';
import useContactStore from '../../store/useContactStore';
import useSocketStore from '../../store/useSocketStore';
import Avatar from '../shared/Avatar';
import './ChatHeader.css';

export default function ChatHeader() {
  const { selectedContact, clearChat } = useChatStore();
  const { removeContact } = useContactStore();
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);
  const [showMenu, setShowMenu] = useState(false);

  if (!selectedContact) return null;

  const isOnline = onlineUsers.includes(selectedContact._id);
  const isTyping = typingUsers[selectedContact._id];

  const getStatusText = () => {
    if (isTyping) return 'typing...';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  const handleRemoveContact = async () => {
    if (confirm(`Remove ${selectedContact.name} from your contacts?`)) {
      const success = await removeContact(selectedContact._id);
      if (success) {
        clearChat();
        // Refresh contacts list without full page reload
        const { fetchContacts } = useChatStore.getState();
        fetchContacts();
      }
    }
    setShowMenu(false);
  };

  return (
    <header className="chat-header">
      <div className="chat-header__left">
        <button
          className="chat-header__back"
          onClick={clearChat}
          aria-label="Back to contacts"
        >
          <ArrowLeft size={20} />
        </button>
        <Avatar
          src={selectedContact.profilePic}
          name={selectedContact.name}
          size="md"
          showOnline
          isOnline={isOnline}
        />
        <div className="chat-header__info">
          <h3 className="chat-header__name">{selectedContact.name}</h3>
          <span className={`chat-header__status ${
            isTyping ? 'chat-header__status--typing' :
            isOnline ? 'chat-header__status--online' : ''
          }`}>
            {getStatusText()}
          </span>
        </div>
      </div>
      <div className="chat-header__actions">
        <button className="chat-header__action" aria-label="Voice call" title="Voice call">
          <Phone size={18} />
        </button>
        <button className="chat-header__action" aria-label="Video call" title="Video call">
          <Video size={18} />
        </button>
        <button className="chat-header__action" aria-label="Search messages" title="Search">
          <Search size={18} />
        </button>
        <div className="chat-header__menu-wrapper">
          <button 
            className="chat-header__action" 
            aria-label="More options" 
            title="More"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <>
              <div className="chat-header__menu-overlay" onClick={() => setShowMenu(false)} />
              <div className="chat-header__menu">
                <button className="chat-header__menu-item chat-header__menu-item--danger" onClick={handleRemoveContact}>
                  <UserMinus size={16} />
                  Remove Contact
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
