import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';
import './Input.css';

export default function Input({
  label,
  type = 'text',
  error,
  icon: Icon,
  className,
  id,
  autoComplete,
  onFocus,
  onBlur,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div
      className={cn(
        'relay-input',
        isFocused && 'relay-input--focused',
        error && 'relay-input--error',
        className
      )}
    >
      {label && (
        <label htmlFor={id} className="relay-input__label">
          {label}
        </label>
      )}
      <div className="relay-input__wrapper">
        {Icon && <Icon className="relay-input__icon" size={18} />}
        <input
          id={id}
          type={inputType}
          className="relay-input__field"
          autoComplete={autoComplete || 'off'}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="relay-input__toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="relay-input__error">{error}</span>}
    </div>
  );
}
