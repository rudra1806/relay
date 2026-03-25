import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles, MessageCircle, Shield, Zap, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { isValidEmail, getPasswordStrength, getPasswordLabel } from '../lib/utils';
import './AuthPage.css';

const formVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: { duration: 0.25 },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const features = [
  {
    icon: MessageCircle,
    title: 'Real-time messaging',
    desc: 'Instant delivery with live conversation updates.',
  },
  {
    icon: Shield,
    title: 'Private & secure',
    desc: 'Your messages are encrypted and protected.',
  },
  {
    icon: Zap,
    title: 'Lightning fast',
    desc: 'Optimized for speed with a sleek, modern interface.',
  },
  {
    icon: Globe,
    title: 'Share anything',
    desc: 'Send text, images, and files seamlessly.',
  },
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  const { login, signup, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
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

    const result = isLogin
      ? await login({ email: formData.email, password: formData.password })
      : await signup(formData);

    if (result.success) {
      navigate('/');
    }
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
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
      {/* ── Left Panel: Brand & Features ── */}
      <div className="auth-page__left">
        <div className="auth-page__left-bg">
          <div className="auth-page__orb auth-page__orb--1" />
          <div className="auth-page__orb auth-page__orb--2" />
        </div>

        <div className="auth-page__brand">
          <motion.div
            className="auth-page__logo"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Sparkles size={28} />
          </motion.div>
          <h1 className="auth-page__app-name">Relay</h1>
          <p className="auth-page__tagline">
            {isLogin
              ? 'Welcome back. Your conversations are waiting.'
              : 'Connect with anyone, anywhere. Start messaging today.'}
          </p>
        </div>

        <div className="auth-page__features">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              className="auth-page__feature"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
            >
              <div className="auth-page__feature-icon">
                <f.icon size={20} />
              </div>
              <div>
                <h3 className="auth-page__feature-title">{f.title}</h3>
                <p className="auth-page__feature-desc">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Right Panel: Form ── */}
      <div className="auth-page__right">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* Card Header */}
          <div className="auth-card__header">
            <h2 className="auth-card__title">
              {isLogin ? 'Sign in' : 'Create account'}
            </h2>
            <p className="auth-card__subtitle">
              {isLogin
                ? 'Enter your credentials to continue'
                : 'Fill in your details to get started'}
            </p>
          </div>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'signup'}
              className="auth-card__form"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onSubmit={handleSubmit}
            >
              {!isLogin && (
                <motion.div variants={fieldVariants}>
                  <Input
                    id="auth-name"
                    label="Name"
                    icon={User}
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    error={errors.name}
                    autoComplete="name"
                  />
                </motion.div>
              )}

              <motion.div variants={fieldVariants}>
                <Input
                  id="auth-email"
                  label="Email"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  error={errors.email}
                  autoComplete="email"
                />
              </motion.div>

              <motion.div variants={fieldVariants}>
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
                  <div className="auth-card__strength">
                    <div className="auth-card__strength-bar">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`auth-card__strength-segment ${
                            strength >= level ? `auth-card__strength-segment--${strength}` : ''
                          }`}
                        />
                      ))}
                    </div>
                    <span className="auth-card__strength-label">{strengthLabel}</span>
                  </div>
                )}
              </motion.div>

              <motion.div variants={fieldVariants}>
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

          {/* Toggle */}
          <div className="auth-card__footer">
            <span className="auth-card__footer-text">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button className="auth-card__footer-link" onClick={toggleMode} type="button">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
