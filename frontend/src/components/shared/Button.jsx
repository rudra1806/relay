import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={cn(
        'relay-btn',
        `relay-btn--${variant}`,
        `relay-btn--${size}`,
        fullWidth && 'relay-btn--full',
        isLoading && 'relay-btn--loading',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="relay-btn__spinner" size={18} />
      ) : Icon ? (
        <Icon className="relay-btn__icon" size={18} />
      ) : null}
      {children && <span className="relay-btn__label">{children}</span>}
    </motion.button>
  );
}
