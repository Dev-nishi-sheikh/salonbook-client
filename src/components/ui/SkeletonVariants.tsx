'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  className?: string;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ variant = 'text', width, height, className, animation = 'pulse' }: SkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    rounded: 'rounded-xl',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'animate-[wave_1.5s_ease-in-out_infinite]',
    none: '',
  };

  const baseStyle = {
    width: typeof width === 'number' ? `${width}px` : width || '100%',
    height: typeof height === 'number' ? `${height}px` : height || (variant === 'text' ? '1rem' : '100%'),
  };

  return (
    <div
      className={classNames(
        'bg-gray-200',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={baseStyle}
      aria-hidden="true"
    />
  );
}

interface CardSkeletonProps {
  hasImage?: boolean;
  imageAspectRatio?: string;
  lines?: number;
  className?: string;
}

export function CardSkeleton({ hasImage = true, imageAspectRatio = '16/9', lines = 3, className }: CardSkeletonProps) {
  return (
    <div className={classNames('card overflow-hidden animate-pulse', className)}>
      {hasImage && (
        <div className={classNames('w-full', `aspect-${imageAspectRatio}`, 'bg-gray-200')} />
      )}
      <div className="p-6 space-y-4">
        <Skeleton variant="text" width="40%" />
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} variant="text" width={i === lines - 1 ? '60%' : '100%'} />
        ))}
      </div>
    </div>
  );
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={classNames('overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, i) => (
              <th key={i} className="pb-3">
                <Skeleton variant="text" width="80%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, row) => (
            <tr key={row}>
              {Array.from({ length: columns }, (_, col) => (
                <td key={col} className="py-4">
                  <Skeleton variant="text" width="90%" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface ListSkeletonProps {
  items?: number;
  hasAvatar?: boolean;
  hasAction?: boolean;
  lines?: number;
  className?: string;
}

export function ListSkeleton({ items = 5, hasAvatar = true, hasAction = false, lines = 2, className }: ListSkeletonProps) {
  return (
    <div className={classNames('space-y-4', className)}>
      {Array.from({ length: items }, (_, i) => (
        <div key={i} className="flex items-start gap-4 animate-pulse">
          {hasAvatar && <Skeleton variant="circular" width={48} height={48} />}
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton variant="text" width="40%" />
            {Array.from({ length: lines }, (_, j) => (
              <Skeleton key={j} variant="text" width={j === lines - 1 ? '60%' : '100%'} />
            ))}
          </div>
          {hasAction && <Skeleton variant="rectangular" width={80} height={36} />}
        </div>
      ))}
    </div>
  );
}

interface ProfileSkeletonProps {
  className?: string;
}

export function ProfileSkeleton({ className }: ProfileSkeletonProps) {
  return (
    <div className={classNames('card p-6 animate-pulse', className)}>
      <div className="flex items-center gap-6">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-3">
          <Skeleton variant="text" width="50%" />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-4">
        <Skeleton variant="rectangular" />
        <Skeleton variant="rectangular" />
        <Skeleton variant="rectangular" />
      </div>
    </div>
  );
}