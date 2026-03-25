import { ArrowLeft } from 'lucide-react';
import useChatStore from '../../store/useChatStore';
import Avatar from '../shared/Avatar';
import './ChatHeader.css';

export default function ChatHeader() {
  const { selectedContact, clearChat } = useChatStore();

  if (!selectedContact) return null;

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
        <Avatar src={selectedContact.profilePic} name={selectedContact.name} size="md" />
        <div className="chat-header__info">
          <h3 className="chat-header__name">{selectedContact.name}</h3>
          <span className="chat-header__email">{selectedContact.email}</span>
        </div>
      </div>
    </header>
  );
}
