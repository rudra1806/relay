import { format, isToday, isYesterday, isThisWeek, isThisYear } from 'date-fns';

/**
 * Format a timestamp for display in message list
 */
export function formatMessageTime(date) {
  const d = new Date(date);
  return format(d, 'h:mm a');
}

/**
 * Format a date for chat separators
 */
export function formatDateSeparator(date) {
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d)) return format(d, 'EEEE');
  if (isThisYear(d)) return format(d, 'MMMM d');
  return format(d, 'MMMM d, yyyy');
}

/**
 * Format timestamp for sidebar contact cards
 */
export function formatSidebarTime(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d)) return format(d, 'EEE');
  return format(d, 'MM/dd/yy');
}

/**
 * Get initials from a name
 */
export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Conditionally join class names
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Convert file to base64
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Calculate password strength (0-4)
 */
export function getPasswordStrength(password) {
  if (!password) return 0;
  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
}

/**
 * Get password strength label
 */
export function getPasswordLabel(strength) {
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  return labels[strength] || '';
}
