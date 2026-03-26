import { ArrowLeft, Phone, Video, Search } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import useSocketStore from '../../store/useSocketStore';
import Avatar from '../shared/Avatar';
import './ChatHeader.css';

export default function ChatHeader() {
  const { selectedContact, clearChat } = useChatStore();
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const typingUsers = useSocketStore((s) => s.typingUsers);

  if (!selectedContact) return null;

  const isOnline = onlineUsers.includes(selectedContact._id);
  const isTyping = typingUsers[selectedContact._id];

  const getStatusText = () => {
    if (isTyping) return 'typing...';
    if (isOnline) return 'Online';
    return 'Offline';
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
      </div>
    </header>
  );
}
