import { useState, useRef, useEffect } from 'react';
import useAuthStore from '../../store/useAuthStore';
import Button from './Button';
import Input from './Input';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '' }) => {
  const [step, setStep] = useState(1); // 1: email, 2: otp + password
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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

    const otpString = otp.join('');
    const result = await resetPassword(email, otpString, newPassword);
    
    if (result.success) {
      onClose();
      setStep(1);
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleResendCode = async () => {
    await forgotPassword(email);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setEmail('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="forgot-password-header">
          <h2>{step === 1 ? 'Reset Password' : 'Enter Reset Code'}</h2>
          <p>
            {step === 1
              ? 'Enter your email address and we\'ll send you a code to reset your password.'
              : 'Enter the 6-digit code sent to your email and your new password.'}
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
        ) : (
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
                {isLoading ? 'Resetting...' : 'Reset Password'}
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
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
