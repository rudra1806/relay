import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import Button from './Button';
import './VerificationModal.css';

export default function VerificationModal({ email, onSuccess, onCancel }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  const { verifyEmail, resendOTP, isLoading } = useAuthStore();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        const newOtp = [...otp];
        digits.forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        if (digits.length === 6) {
          inputRefs.current[5]?.focus();
          handleVerify(newOtp.join(''));
        }
      });
    }
  };

  const handleVerify = async (otpCode) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    const result = await verifyEmail(email, code);
    if (result.success) {
      onSuccess?.();
    } else {
      setError(result.message);
      if (result.expired) {
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    const result = await resendOTP(email);
    if (result.success) {
      setCanResend(false);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
    } else if (result.retryAfter) {
      setCountdown(result.retryAfter);
      setCanResend(false);
    }
  };

  return (
    <div className="verification-overlay">
      <motion.div
        className="verification-modal"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Icon */}
        <div className="verification-icon">
          <Mail size={32} strokeWidth={1.5} />
        </div>

        {/* Header */}
        <h2 className="verification-title">Verify Your Email</h2>
        <p className="verification-subtitle">
          We've sent a 6-digit code to
          <br />
          <strong>{email}</strong>
        </p>

        {/* OTP Input */}
        <div className="verification-otp">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`verification-otp-input ${error ? 'verification-otp-input--error' : ''}`}
              disabled={isLoading}
            />
          ))}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="verification-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Verify button */}
        <Button
          onClick={() => handleVerify()}
          fullWidth
          size="lg"
          isLoading={isLoading}
          icon={ArrowRight}
          disabled={otp.some(digit => digit === '')}
        >
          Verify Email
        </Button>

        {/* Resend */}
        <div className="verification-resend">
          <p className="verification-resend-text">Didn't receive the code?</p>
          <button
            type="button"
            className="verification-resend-btn"
            onClick={handleResend}
            disabled={!canResend || isLoading}
          >
            <RefreshCw size={14} />
            {canResend ? 'Resend Code' : `Resend in ${countdown}s`}
          </button>
        </div>

        {/* Cancel */}
        {onCancel && (
          <button
            type="button"
            className="verification-cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </motion.div>
    </div>
  );
}
