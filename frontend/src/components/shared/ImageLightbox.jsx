import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import './ImageLightbox.css';

export default function ImageLightbox({ src, onClose }) {
  const dialogRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      
      // Fetch the image as a blob to bypass CORS restrictions
      const response = await fetch(src);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      
      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Extract filename from URL or generate a meaningful one
      let filename = 'relay-image.jpg';
      try {
        const urlParts = src.split('/');
        const lastPart = urlParts[urlParts.length - 1].split('?')[0];
        // Remove Cloudinary version prefix if present (e.g., v1234567890)
        const cleanName = lastPart.replace(/^v\d+\//, '');
        if (cleanName && cleanName.length > 0) {
          filename = cleanName;
        }
      } catch (e) {
        // Use default filename if extraction fails
        const timestamp = Date.now();
        filename = `relay-image-${timestamp}.jpg`;
      }
      
      // Create a temporary anchor and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
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
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="lightbox__btn"
          aria-label="Download image"
        >
          <Download size={20} />
        </button>
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
