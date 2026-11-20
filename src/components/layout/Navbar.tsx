'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { classNames } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { UserRole } from '@/types';

export function Navbar() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Browse Services', href: '/browse' },
  ];

  const authNavigation = [
    { name: 'Dashboard', href: user?.role === 'admin' ? '/dashboard/admin/overview' : '/dashboard/customer/overview', icon: LayoutDashboard },
    { name: 'Profile', href: user?.role === 'admin' ? '/dashboard/admin/profile' : '/dashboard/customer/profile', icon: User },
  ];

  if (isLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-warm-gray-100">
        <div className="container-main">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-bold text-rose-600">SalonBook</span>
              <div className="hidden md:flex items-center gap-6">
                {navigation.map(item => (
                  <div key={item.name} className="h-6 w-24 bg-warm-gray-200 animate-pulse rounded-xl" />
                ))}
              </div>
            </div>
            <div className="h-10 w-24 bg-warm-gray-200 animate-pulse rounded-xl" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-warm-gray-100 shadow-soft">
      <div className="container-main">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-rose-600 flex items-center gap-2">
              <span className="text-3xl">💇</span>
              <span className="font-display">SalonBook</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              {navigation.map(item => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-charcoal-600 hover:text-rose-600 transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-warm-gray-100 transition-colors duration-200"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    {user?.image ? (
                      <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-sm font-medium text-rose-600">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-charcoal-700">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-warm-gray-500" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-medium border border-warm-gray-100 py-1 z-50 animate-in fade-in-0 zoom-in-95">
                    <div className="px-4 py-3 border-b border-warm-gray-100">
                      <p className="text-sm font-medium text-charcoal-900">{user?.name}</p>
                      <p className="text-xs text-warm-gray-500 truncate">{user?.email}</p>
                      <span className={classNames(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1',
                        user?.role === 'admin' ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                      )}>
                        {user?.role}
                      </span>
                    </div>
                    {authNavigation.map(item => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-warm-gray-50 transition-colors duration-200"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    ))}
                    <hr className="my-1 border-warm-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-warm-gray-50 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/auth/signin" className="btn-ghost text-sm">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="btn-primary text-sm">
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl text-charcoal-600 hover:bg-warm-gray-100 transition-colors duration-200"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div
          id="mobile-menu"
          className={classNames('md:hidden border-t border-warm-gray-100 py-4', isMenuOpen ? 'block' : 'hidden')}
        >
          <div className="flex flex-col gap-2">
            {navigation.map(item => (
              <Link
                key={item.name}
                href={item.href}
                className="px-2 py-2 text-charcoal-600 hover:text-rose-600 hover:bg-warm-gray-50 rounded-xl transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <hr className="my-2 border-warm-gray-100" />
                {authNavigation.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-2 py-2 text-charcoal-600 hover:text-rose-600 hover:bg-warm-gray-50 rounded-xl transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-2 py-2 text-red-600 hover:bg-warm-gray-50 rounded-xl transition-colors duration-200 w-full text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/auth/signin"
                  className="btn-secondary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="btn-primary text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}