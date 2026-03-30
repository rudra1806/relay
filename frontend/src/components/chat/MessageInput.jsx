import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ImagePlus, X, Reply } from 'lucide-react';
import toast from 'react-hot-toast';
import useChatStore from '../../store/useChatStore';
import useSocketStore from '../../store/useSocketStore';
import useUIStore from '../../store/useUIStore';
import { fileToBase64 } from '../../lib/utils';
import './MessageInput.css';

export default function MessageInput() {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const { selectedContact, sendMessage, isSending } = useChatStore();
  const { emitTyping, emitStopTyping } = useSocketStore();
  const { replyingTo, clearReply } = useUIStore();
  const imageUrlRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  // Cleanup ObjectURL and typing timeout on unmount
  useEffect(() => {
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current && selectedContact) {
        emitStopTyping(selectedContact._id);
      }
    };
  }, [selectedContact, emitStopTyping]);

  // Focus textarea when replying
  useEffect(() => {
    if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [replyingTo]);

  const handleImageSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10 MB');
      return;
    }
    const base64 = await fileToBase64(file);
    setImageBase64(base64);
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    const url = URL.createObjectURL(file);
    imageUrlRef.current = url;
    setImagePreview(url);
  };

  const handleFileInput = (e) => {
    if (e.target.files?.[0]) {
      handleImageSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const clearImage = () => {
    if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    imageUrlRef.current = null;
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText && !imageBase64) return;
    if (!selectedContact) return;

    const data = {};
    if (trimmedText) data.text = trimmedText;
    if (imageBase64) data.image = imageBase64;

    const result = await sendMessage(selectedContact._id, data);
    if (result.success) {
      setText('');
      clearImage();
      clearReply();
      if (isTypingRef.current) {
        emitStopTyping(selectedContact._id);
        isTypingRef.current = false;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      }
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && replyingTo) {
      clearReply();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';

    if (selectedContact) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        emitTyping(selectedContact._id);
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        emitStopTyping(selectedContact._id);
      }, 1500);
    }
  };

  const canSend = (text.trim() || imageBase64) && !isSending;

  return (
    <div
      className={`msg-input ${isDragOver ? 'msg-input--drag' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Reply bar */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            className="msg-input__reply"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="msg-input__reply-inner">
              <Reply size={14} className="msg-input__reply-icon" />
              <div className="msg-input__reply-content">
                <span className="msg-input__reply-label">Replying</span>
                <span className="msg-input__reply-text">
                  {replyingTo.text?.slice(0, 80) || '📷 Photo'}
                </span>
              </div>
              <button
                className="msg-input__reply-close"
                onClick={clearReply}
                aria-label="Cancel reply"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            className="msg-input__preview"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="msg-input__preview-inner">
              <img src={imagePreview} alt="Preview" className="msg-input__preview-img" />
              <button className="msg-input__preview-close" onClick={clearImage} aria-label="Remove image">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="msg-input__bar">
        {/* Image upload */}
        <button
          className="msg-input__action"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach image"
          title="Attach image"
        >
          <ImagePlus size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileInput}
          className="sr-only"
        />

        {/* Textarea wrapper */}
        <div className="msg-input__textarea-wrapper">
          <textarea
            ref={textareaRef}
            className="msg-input__textarea"
            placeholder="Write a message..."
            value={text}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
          />
        </div>

        {/* Send */}
        <motion.button
          className={`msg-input__send ${canSend ? 'msg-input__send--active' : ''}`}
          onClick={handleSend}
          disabled={!canSend}
          whileTap={{ scale: 0.9 }}
          aria-label="Send message"
        >
          <Send size={18} />
        </motion.button>
      </div>

      {/* Drag overlay */}
      <AnimatePresence>
        {isDragOver && (
          <motion.div
            className="msg-input__drag-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ImagePlus size={32} />
            <span>Drop image here</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
