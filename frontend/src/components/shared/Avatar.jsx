import { getInitials, cn } from '../../lib/utils';
import './Avatar.css';

export default function Avatar({
  src,
  name,
  size = 'md',
  showOnline = false,
  isOnline = false,
  className,
}) {
  const initials = getInitials(name);

  return (
    <div className={cn('relay-avatar', `relay-avatar--${size}`, className)}>
      {src ? (
        <img
          src={src}
          alt={name || 'User avatar'}
          className="relay-avatar__img"
          loading="lazy"
        />
      ) : (
        <div className="relay-avatar__fallback">{initials}</div>
      )}
      {showOnline && (
        <span
          className={cn(
            'relay-avatar__status',
            isOnline && 'relay-avatar__status--online'
          )}
          aria-label={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
}
