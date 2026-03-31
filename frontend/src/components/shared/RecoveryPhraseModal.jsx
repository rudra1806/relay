/**
 * RecoveryPhraseModal — Displays the 12-word recovery phrase after signup.
 * User must acknowledge they've saved it before proceeding.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Copy, Check, AlertTriangle } from 'lucide-react';
import Button from './Button';
import './RecoveryPhraseModal.css';

export default function RecoveryPhraseModal({ phrase, onConfirm }) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!phrase) return null;

  const words = phrase.split(' ');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phrase);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = phrase;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="rp-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="rp-modal"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Header */}
          <div className="rp-header">
            <div className="rp-header__icon">
              <Shield size={24} />
            </div>
            <h2 className="rp-header__title">Your Recovery Phrase</h2>
            <p className="rp-header__subtitle">
              Write down these 12 words in order and store them somewhere safe.
              This is the <strong>only way</strong> to recover your encrypted messages.
            </p>
          </div>

          {/* Warning */}
          <div className="rp-warning">
            <AlertTriangle size={16} className="rp-warning__icon" />
            <p className="rp-warning__text">
              If you lose this phrase, your encrypted messages will be <strong>permanently unrecoverable</strong>.
              The server does not have access to your encryption keys.
            </p>
          </div>

          {/* Word Grid */}
          <div className="rp-grid">
            {words.map((word, i) => (
              <motion.div
                key={i}
                className="rp-word"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
              >
                <span className="rp-word__num">{i + 1}</span>
                <span className="rp-word__text">{word}</span>
              </motion.div>
            ))}
          </div>

          {/* Copy Button */}
          <button className="rp-copy" onClick={handleCopy} type="button">
            {copied ? (
              <>
                <Check size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy to clipboard</span>
              </>
            )}
          </button>

          {/* Confirmation Checkbox */}
          <label className="rp-confirm">
            <input
              type="checkbox"
              className="rp-confirm__check"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span className="rp-confirm__text">
              I have saved my recovery phrase in a safe place
            </span>
          </label>

          {/* Continue Button */}
          <Button
            fullWidth
            size="lg"
            disabled={!confirmed}
            onClick={() => onConfirm()}
          >
            Continue to Relay
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
