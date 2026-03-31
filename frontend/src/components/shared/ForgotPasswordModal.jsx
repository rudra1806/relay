import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import useKeyStore from './../../store/useKeyStore';
import { clearPublicKeyCache } from '../../store/useChatStore';
import { isValidRecoveryPhrase } from '../../lib/crypto';
import toast from 'react-hot-toast';
import Button from './Button';
import Input from './Input';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp + password, 3: key recovery
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryPhrase, setRecoveryPhrase] = useState('');
  const [keyRecoveryLoading, setKeyRecoveryLoading] = useState(false);
  
  const otpRefs = useRef([]);
  const { forgotPassword, resetPassword, isLoading } = useAuthStore();

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(email);
    if (result.success) {
      setStep(2);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      otpRefs.current[nextEmptyIndex]?.focus();
    } else {
      otpRefs.current[5]?.focus();
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      return;
    }

    // E2EE: Don't reset password yet — move to key recovery step first.
    // The actual reset happens in handleKeyRecovery or handleGenerateNewKeys,
    // so the key material is included in the same reset request.
    setStep(3);
  };

  // E2EE: Recover keys with recovery phrase, then reset password + keys atomically
  const handleKeyRecovery = async () => {
    const trimmed = recoveryPhrase.trim().toLowerCase();
    if (!isValidRecoveryPhrase(trimmed)) {
      toast.error('Invalid recovery phrase. Please check and try again.');
      return;
    }

    setKeyRecoveryLoading(true);
    try {
      const keyStore = useKeyStore.getState();
      const keyData = await keyStore.recoverKeys(trimmed, newPassword);

      // Reset password AND update keys in a single request (no auth needed)
      const otpString = otp.join('');
      const result = await resetPassword(email, otpString, newPassword, {
        encryptedPrivateKey: keyData.encryptedPrivateKey,
        keyIv: keyData.keyIv,
        keySalt: keyData.keySalt,
      });

      if (result.success) {
        toast.success('Password reset and encryption keys restored!');
        handleFullClose();
      }
    } catch (error) {
      console.error('Key recovery failed:', error);
      toast.error('Failed to recover keys. Please check your phrase and try again.');
    } finally {
      setKeyRecoveryLoading(false);
    }
  };

  // E2EE: Generate new keys (old messages become unreadable), then reset password + keys
  const handleGenerateNewKeys = async () => {
    setKeyRecoveryLoading(true);
    try {
      const keyStore = useKeyStore.getState();
      const keyData = await keyStore.generateAndStoreKeys(newPassword);

      // Reset password AND update keys in a single request (no auth needed)
      const otpString = otp.join('');
      const result = await resetPassword(email, otpString, newPassword, {
        publicKey: keyData.publicKey,
        encryptedPrivateKey: keyData.encryptedPrivateKey,
        keyIv: keyData.keyIv,
        keySalt: keyData.keySalt,
      });

      if (result.success) {
        clearPublicKeyCache(); // Invalidate stale cached public keys
        toast.success('Password reset with new encryption keys. Previous encrypted messages cannot be read.');
        handleFullClose();
      }
    } catch (error) {
      console.error('New key generation failed:', error);
      toast.error('Failed to generate new keys. Please try again.');
    } finally {
      setKeyRecoveryLoading(false);
    }
  };

  const handleResendCode = async () => {
    await forgotPassword(email);
  };

  const handleClose = () => {
    // Don't allow closing during key recovery step
    if (step === 3) return;
    handleFullClose();
  };

  const handleFullClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setRecoveryPhrase('');
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forgot-password-header">
          <h2>
            {step === 1 ? 'Reset Password' : step === 2 ? 'Enter Reset Code' : 'Restore Encryption'}
          </h2>
          <p>
            {step === 1
              ? 'Enter your email address and we\'ll send you a code to reset your password.'
              : step === 2
              ? 'Enter the 6-digit code sent to your email and your new password.'
              : 'Enter your recovery phrase to restore access to your encrypted messages.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="forgot-password-form">
            <div className="forgot-password-step">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="forgot-password-actions">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !email}>
                {isLoading ? 'Sending...' : 'Send Code'}
              </Button>
            </div>
          </form>
        ) : step === 2 ? (
          <form onSubmit={handleResetSubmit} className="forgot-password-form">
            <div className="forgot-password-step">
              <div className="otp-input-group">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-input"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="forgot-password-actions">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  otp.some((d) => !d) ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
              >
                {isLoading ? 'Processing...' : 'Continue'}
              </Button>
            </div>

            <div className="resend-link">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Resend code
              </button>
            </div>
          </form>
        ) : null}

        {/* Step 3: E2EE Key Recovery */}
        {step === 3 && (
          <div className="forgot-password-form">
            <div className="forgot-password-step">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                To complete your password reset and keep reading your encrypted messages,
                enter the 12-word recovery phrase you saved when you signed up.
              </p>

              <textarea
                className="recovery-phrase-input"
                placeholder="Enter your 12-word recovery phrase..."
                value={recoveryPhrase}
                onChange={(e) => setRecoveryPhrase(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                  resize: 'none',
                  outline: 'none',
                }}
              />
            </div>

            <div className="forgot-password-actions">
              <Button
                type="button"
                onClick={handleKeyRecovery}
                disabled={keyRecoveryLoading || !recoveryPhrase.trim()}
              >
                {keyRecoveryLoading ? 'Restoring...' : 'Restore Keys'}
              </Button>
            </div>

            <div className="resend-link" style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '0 0 6px 0' }}>
                Don't have your recovery phrase?
              </p>
              <button
                type="button"
                onClick={handleGenerateNewKeys}
                disabled={keyRecoveryLoading}
                style={{ color: 'var(--color-warning, #fab005)' }}
              >
                Generate new keys (old messages will be lost)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
