import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import useChatStore from '../store/useChatStore';
import useContactStore from '../store/useContactStore';
import useUIStore from '../store/useUIStore';
import Sidebar from '../components/sidebar/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';
import EmptyChat from '../components/chat/EmptyChat';
import ImageLightbox from '../components/shared/ImageLightbox';
import './ChatPage.css';

export default function ChatPage() {
  const { selectedContact, fetchContacts } = useChatStore();
  const { fetchPendingRequests } = useContactStore();
  const { imagePreview, setImagePreview } = useUIStore();

  useEffect(() => {
    fetchContacts();
    fetchPendingRequests();
  }, [fetchContacts, fetchPendingRequests]);

  return (
    <div className={`chat-page ${selectedContact ? 'chat-page--chat-active' : ''}`}>
      <Sidebar />

      <main className={`chat-main ${!selectedContact ? 'chat-main--empty' : ''}`}>
        {selectedContact ? (
          <>
            <ChatHeader />
            <MessageList />
            <MessageInput />
          </>
        ) : (
          <EmptyChat />
        )}
      </main>

      {/* Image Lightbox */}
      <AnimatePresence>
        {imagePreview && (
          <ImageLightbox src={imagePreview} onClose={() => setImagePreview(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
