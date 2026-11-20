'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  User,
  Scissors,
  Users,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
}

const customerNavItems = [
  { href: '/dashboard/customer/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/customer/appointments', label: 'My Appointments', icon: Calendar },
  { href: '/dashboard/customer/payments', label: 'Payment History', icon: CreditCard },
  { href: '/dashboard/customer/profile', label: 'My Profile', icon: User },
];

const adminNavItems = [
  { href: '/dashboard/admin/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/admin/services', label: 'Manage Services', icon: Scissors },
  { href: '/dashboard/admin/appointments', label: 'Manage Appointments', icon: Calendar },
  { href: '/dashboard/admin/users', label: 'Manage Users', icon: Users },
  { href: '/dashboard/admin/transactions', label: 'Transactions', icon: CreditCard },
  { href: '/dashboard/admin/profile', label: 'My Profile', icon: User },
];

export function Sidebar({ isOpen, onClose, role }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const navItems = role === 'admin' ? adminNavItems : customerNavItems;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <>
      <div
        className={classNames(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      <aside
        className={classNames(
          'fixed top-0 left-0 z-50 h-screen bg-white border-r border-warm-gray-200 transition-all duration-350 ease-out lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-0 lg:w-64'
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-warm-gray-200">
            <Link href="/" className="flex items-center text-lg font-bold text-charcoal-900">
              <span className="hidden lg:inline font-display">SalonBook</span>
            </Link>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-warm-gray-500 hover:bg-warm-gray-100 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={classNames(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-charcoal-600 hover:bg-warm-gray-50 hover:text-charcoal-900'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className={classNames('h-5 w-5 flex-shrink-0', isActive ? 'text-rose-600' : 'text-warm-gray-400')} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-warm-gray-200">
            <button
              onClick={handleLogout}
              className={classNames(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600',
                'hover:bg-red-50 transition-colors duration-200'
              )}
            >
              <LogOut className="h-5 w-5" />
              <span className="truncate">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}