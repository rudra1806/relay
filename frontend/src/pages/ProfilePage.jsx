import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowLeft, LogOut, User, Lock, Save, Sun, Moon, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import useThemeStore from '../store/useThemeStore';
import Avatar from '../components/shared/Avatar';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import { fileToBase64 } from '../lib/utils';
import { APP_VERSION } from '../lib/version';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateProfile, logout, isLoading } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const avatarUrlRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarBase64, setAvatarBase64] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarSelect = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const base64 = await fileToBase64(file);
    setAvatarBase64(base64);
    if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    const url = URL.createObjectURL(file);
    avatarUrlRef.current = url;
    setAvatarPreview(url);
  };

  useEffect(() => {
    return () => {
      if (avatarUrlRef.current) URL.revokeObjectURL(avatarUrlRef.current);
    };
  }, []);

  const handleAvatarUpload = async () => {
    if (!avatarBase64) return;
    setIsUploadingAvatar(true);
    const result = await updateProfile({ profilePic: avatarBase64 });
    setIsUploadingAvatar(false);
    if (result.success) {
      setAvatarBase64(null);
      setAvatarPreview(null);
    }
  };

  const handleSaveName = async () => {
    if (name.trim() === user?.name) return;
    await updateProfile({ name: name.trim() });
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    const result = await updateProfile({ currentPassword, newPassword });
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="profile-page">
      <motion.div
        className="profile-page__card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="profile-page__header">
          <button className="profile-page__back" onClick={() => navigate('/')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="profile-page__title">Profile</h1>
        </div>

        {/* Avatar section */}
        <div className="profile-page__avatar-section">
          <div className="profile-page__avatar-wrapper">
            <Avatar
              src={avatarPreview || user?.profilePic}
              name={user?.name}
              size="2xl"
            />
            <button
              className="profile-page__avatar-edit"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Change avatar"
            >
              <Camera size={18} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => e.target.files?.[0] && handleAvatarSelect(e.target.files[0])}
              className="sr-only"
            />
          </div>

          <AnimatePresence>
            {avatarBase64 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Button
                  size="sm"
                  onClick={handleAvatarUpload}
                  isLoading={isUploadingAvatar}
                  icon={Save}
                >
                  Save avatar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="profile-page__email">{user?.email}</p>
        </div>

        {/* Divider */}
        <div className="profile-page__divider" />

        {/* Theme section */}
        <div className="profile-page__section">
          <div className="profile-page__section-header">
            <Palette size={16} className="profile-page__section-icon" />
            <h3 className="profile-page__section-title">Appearance</h3>
          </div>
          <button className="profile-page__theme-toggle" onClick={toggleTheme}>
            <div className="profile-page__theme-info">
              {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              <span>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
            </div>
            <div className={`profile-page__toggle-switch ${theme === 'light' ? 'profile-page__toggle-switch--on' : ''}`}>
              <div className="profile-page__toggle-knob" />
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="profile-page__divider" />

        {/* Name section */}
        <div className="profile-page__section">
          <div className="profile-page__section-header">
            <User size={16} className="profile-page__section-icon" />
            <h3 className="profile-page__section-title">Display Name</h3>
          </div>
          <div className="profile-page__row">
            <Input
              id="profile-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <Button
              size="md"
              onClick={handleSaveName}
              disabled={!name.trim() || name.trim() === user?.name}
              isLoading={isLoading}
            >
              Save
            </Button>
          </div>
        </div>

        {/* Password section */}
        <div className="profile-page__section">
          <div className="profile-page__section-header">
            <Lock size={16} className="profile-page__section-icon" />
            <h3 className="profile-page__section-title">Change Password</h3>
          </div>
          <div className="profile-page__fields">
            <Input
              id="profile-current-pw"
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Input
              id="profile-new-pw"
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Button
              onClick={handleChangePassword}
              disabled={!currentPassword || !newPassword || newPassword.length < 6}
              isLoading={isLoading}
            >
              Update password
            </Button>
          </div>
        </div>

        {/* Divider */}
        <div className="profile-page__divider" />

        {/* Logout */}
        <div className="profile-page__section">
          <Button variant="danger" icon={LogOut} onClick={handleLogout} fullWidth>
            Log out
          </Button>
        </div>

        {/* Version */}
        <div className="profile-page__version">
          v{APP_VERSION}
        </div>
      </motion.div>
    </div>
  );
}
