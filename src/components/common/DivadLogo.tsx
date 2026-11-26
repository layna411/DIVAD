import React from 'react';

export interface DivadLogoProps {
  variant?: 'full' | 'icon' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
  onClick?: () => void;
}

export const DivadLogo: React.FC<DivadLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  alt = 'DIVAD – Dressing Independence with Visual and Auditory Device',
  onClick,
}) => {
  // Height / dimension classes based on size and variant
  const sizeClasses = {
    full: {
      xs: 'h-8',
      sm: 'h-10 sm:h-12',
      md: 'h-14 sm:h-16',
      lg: 'h-20 sm:h-24',
      xl: 'h-28 sm:h-36',
    },
    icon: {
      xs: 'w-6 h-6',
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-14 h-14',
      xl: 'w-20 h-20',
    },
    badge: {
      xs: 'w-7 h-7 p-0.5',
      sm: 'w-9 h-9 p-1',
      md: 'w-12 h-12 p-1.5',
      lg: 'w-16 h-16 p-2',
      xl: 'w-24 h-24 p-3',
    },
  };

  const cursorClass = onClick ? 'cursor-pointer hover:opacity-90 transition' : '';

  if (variant === 'icon') {
    return (
      <img
        src="/logo-icon.png"
        alt={alt}
        onClick={onClick}
        className={`object-contain rounded-xl ${sizeClasses.icon[size]} ${cursorClass} ${className}`}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center ${sizeClasses.badge[size]} ${cursorClass} ${className}`}
      >
        <img
          src="/logo-icon.png"
          alt={alt}
          className="w-full h-full object-contain rounded-xl"
        />
      </div>
    );
  }

  // variant === 'full'
  return (
    <img
      src="/logo.png"
      alt={alt}
      onClick={onClick}
      className={`object-contain ${sizeClasses.full[size]} ${cursorClass} ${className}`}
    />
  );
};

export default DivadLogo;
