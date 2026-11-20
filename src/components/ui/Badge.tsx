'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'pending' | 'confirmed' | 'cancelled' | 'unpaid' | 'paid' | 'active' | 'inactive' | 'admin' | 'customer' | 'gold';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    const variants = {
      default: 'badge',
      pending: 'badge-pending',
      confirmed: 'badge-confirmed',
      cancelled: 'badge-cancelled',
      unpaid: 'badge-unpaid',
      paid: 'badge-paid',
      active: 'badge-active',
      inactive: 'badge-inactive',
      admin: 'badge-admin',
      customer: 'badge-customer',
      gold: 'badge-gold',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-[0.625rem]',
      md: 'px-2.5 py-1 text-xs',
    };

    return (
      <span
        ref={ref}
        className={classNames(
          'badge',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';