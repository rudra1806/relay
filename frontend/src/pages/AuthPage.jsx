import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, ArrowRight, Shield, Zap, Globe, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import Logo from '../components/shared/Logo';
import VerificationModal from '../components/shared/VerificationModal';
import ForgotPasswordModal from '../components/shared/ForgotPasswordModal';
import RecoveryPhraseModal from '../components/shared/RecoveryPhraseModal';
import { isValidEmail, getPasswordStrength, getPasswordLabel } from '../lib/utils';
import './AuthPage.css';

/* ── Animation variants ── */
const formVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.32, delay: i * 0.06 },
  }),
};

const panelVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Feature cards data ── */
const features = [
  {
    icon: Zap,
    title: 'Real-time messaging',
    desc: 'Instant delivery with zero lag. Stay in the conversation as it happens.',
    color: '#e8c872',
    delay: 0.15,
  },
  {
    icon: Shield,
    title: 'End-to-end security',
    desc: 'Your messages are protected. Privacy is not optional here.',
    color: '#a78bdb',
    delay: 0.25,
  },
  {
    icon: Globe,
    title: 'Free forever',
    desc: 'No paywalls, no premium tiers. Full features for every user.',
    color: '#4ade80',
    delay: 0.35,
  },
  {
    icon: Users,
    title: 'Global connectivity',
    desc: 'Connect with anyone, anywhere. The world is your conversation.',
    color: '#60a5fa',
    delay: 0.45,
  },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [recoveryPhrase, setRecoveryPhrase] = useState(null); // E2EE: phrase to show after signup

  const { login, signup, isLoading, pendingVerification } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'At least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (isLogin) {
      const result = await login({ email: formData.email, password: formData.password });
      if (result.success) {
        navigate('/');
      } else if (result.requiresVerification) {
        setVerificationEmail(result.email);
        setShowVerification(true);
      }
    } else {
      const result = await signup(formData);
      if (result.success && result.requiresVerification) {
        setVerificationEmail(result.email);
        setShowVerification(true);
      }
    }
  };

  const handleVerificationSuccess = (result) => {
    setShowVerification(false);
    // E2EE: If signup flow returned a recovery phrase, show it before navigating
    if (result?.recoveryPhrase) {
      setRecoveryPhrase(result.recoveryPhrase);
    } else {
      navigate('/');
    }
  };

  const handleRecoveryPhraseConfirm = () => {
    setRecoveryPhrase(null);
    // Clear the pending recovery phrase from the auth store
    useAuthStore.setState({ pendingRecoveryPhrase: null });
    navigate('/');
  };

  const handleVerificationCancel = () => {
    setShowVerification(false);
    setVerificationEmail('');
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ name: '', email: '', password: '' });
    setErrors({});
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabel = getPasswordLabel(strength);

  return (
    <div className="auth-page">
      {/* Verification Modal */}
      <AnimatePresence>
        {showVerification && (
          <VerificationModal
            email={verificationEmail}
            onSuccess={handleVerificationSuccess}
            onCancel={handleVerificationCancel}
          />
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialEmail={formData.email}
      />

      {/* E2EE Recovery Phrase Modal */}
      <AnimatePresence>
        {recoveryPhrase && (
          <RecoveryPhraseModal
            phrase={recoveryPhrase}
            onConfirm={handleRecoveryPhraseConfirm}
          />
        )}
      </AnimatePresence>

      {/* ══ LEFT PANEL ══ */}
      <motion.div
        className="auth-left"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Animated background orbs */}
        <div className="auth-left__orb auth-left__orb--1" />
        <div className="auth-left__orb auth-left__orb--2" />
        <div className="auth-left__orb auth-left__orb--3" />
        <div className="auth-left__grid" />

        {/* Brand */}
        <div className="auth-left__brand">
          <Logo size={48} className="auth-left__logo-svg" />
          <span className="auth-left__name">Relay</span>
        </div>

        {/* Hero text */}
        <div className="auth-left__hero">
          <motion.h2
            className="auth-left__headline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Connect without
            <br />
            <span className="auth-left__headline--accent">limits.</span>
          </motion.h2>
          <motion.p
            className="auth-left__sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Messaging reimagined — faster, safer, and always free.
          </motion.p>
        </div>

        {/* Feature cards */}
        <div className="auth-features">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="auth-feature"
              initial={{ opacity: 0, x: -20, y: 10 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: f.delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="auth-feature__icon" style={{ '--feature-color': f.color }}>
                <f.icon size={16} strokeWidth={2} />
              </div>
              <div className="auth-feature__text">
                <p className="auth-feature__title">{f.title}</p>
                <p className="auth-feature__desc">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Social proof badge */}
        <motion.div
          className="auth-social-proof"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="auth-social-proof__avatars">
            {['A', 'B', 'C', 'D'].map((l, i) => (
              <div key={l} className="auth-social-proof__avatar" style={{ '--av-i': i }}>
                {l}
              </div>
            ))}
          </div>
          <div className="auth-social-proof__text">
            <span className="auth-social-proof__count">10,000+</span>
            <span className="auth-social-proof__label">people already chatting</span>
          </div>
        </motion.div>
      </motion.div>

      {/* ══ RIGHT PANEL ══ */}
      <motion.div
        className="auth-right"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth-right__inner">

          {/* Mobile-only brand */}
          <div className="auth-mobile-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
            <Logo size={32} />
            <span className="auth-left__name" style={{ fontSize: '1.3rem' }}>Relay</span>
          </div>

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`}
              onClick={() => { if (!isLogin) toggleMode(); }}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`}
              onClick={() => { if (isLogin) toggleMode(); }}
              type="button"
            >
              Sign Up
            </button>
            <div className={`auth-tab__indicator ${!isLogin ? 'auth-tab__indicator--right' : ''}`} />
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-head' : 'signup-head'}
              className="auth-card__heading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="auth-card__title">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h1>
              <p className="auth-card__subtitle">
                {isLogin
                  ? 'Sign in to pick up where you left off'
                  : 'Join Relay and start messaging in seconds'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login-form' : 'signup-form'}
              className="auth-form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
            >
              {!isLogin && (
                <motion.div custom={0} variants={fieldVariants}>
                  <Input
                    id="auth-name"
                    label="Full Name"
                    icon={User}
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange('name')}
                    error={errors.name}
                    autoComplete="name"
                  />
                </motion.div>
              )}

              <motion.div custom={isLogin ? 0 : 1} variants={fieldVariants}>
                <Input
                  id="auth-email"
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                  autoComplete="email"
                />
              </motion.div>

              <motion.div custom={isLogin ? 1 : 2} variants={fieldVariants}>
                <Input
                  id="auth-password"
                  label="Password"
                  type="password"
                  icon={Lock}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange('password')}
                  error={errors.password}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                {!isLogin && formData.password && (
                  <div className="auth-strength">
                    <div className="auth-strength__bar">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`auth-strength__seg ${
                            strength >= level ? `auth-strength__seg--${strength}` : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className="auth-strength__label">{strengthLabel}</span>
                  </div>
                )}
                {isLogin && (
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-primary)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </motion.div>

              <motion.div custom={isLogin ? 2 : 3} variants={fieldVariants}>
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={isLoading}
                  icon={ArrowRight}
                >
                  {isLogin ? 'Sign in' : 'Create account'}
                </Button>
              </motion.div>
            </motion.form>
          </AnimatePresence>

          {/* Footer link */}
          <p className="auth-footer">
            {isLogin ? 'New to Relay? ' : 'Already have an account? '}
            <button className="auth-footer__link" onClick={toggleMode} type="button">
              {isLogin ? 'Create a free account →' : 'Sign in →'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
