import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import './ImageLightbox.css';

export default function ImageLightbox({ src, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <motion.div
      className="lightbox"
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-label="Image preview"
      tabIndex={-1}
    >
      <div className="lightbox__controls">
        <a
          href={src}
          download
          className="lightbox__btn"
          aria-label="Download image"
        >
          <Download size={20} />
        </a>
        <button className="lightbox__btn" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
      </div>

      <motion.img
        src={src}
        alt="Full size preview"
        className="lightbox__image"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </motion.div>
  );
}
