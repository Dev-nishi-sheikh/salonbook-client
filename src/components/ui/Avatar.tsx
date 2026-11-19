'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ src, alt, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = name
    ?.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={classNames('relative inline-flex shrink-0 overflow-hidden rounded-full bg-salon-100', sizeClasses[size], className)}>
      {src ? (
        <img src={src} alt={alt || name || 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="flex items-center justify-center w-full h-full text-salon-600 font-medium">
          {initials || '?'}
        </span>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  avatars: Array<{ src?: string; name?: string; alt?: string }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function AvatarGroup({ avatars, max = 5, size = 'md', className }: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={classNames('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar key={index} {...avatar} size={size} className="border-2 border-white" />
      ))}
      {remainingCount > 0 && (
        <div className={classNames('flex items-center justify-center bg-gray-100 text-gray-600 font-medium border-2 border-white', sizeClasses[size])}>
          +{remainingCount}
        </div>
      )}
    </div>
  );
}