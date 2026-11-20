'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserRole } from '@/types';
import { Menu, ChevronLeft } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/signin');
        return;
      }

      const isAdminRoute = pathname.startsWith('/dashboard/admin');
      const isCustomerRoute = pathname.startsWith('/dashboard/customer');

      if (isAdminRoute && user?.role !== 'admin') {
        router.push('/dashboard/customer/overview');
        return;
      }

      if (isCustomerRoute && user?.role === 'admin') {
        router.push('/dashboard/admin/overview');
        return;
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router, mounted]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-warm-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isAdminRoute = pathname.startsWith('/dashboard/admin');
  const isCustomerRoute = pathname.startsWith('/dashboard/customer');

  return (
    <div className="min-h-screen bg-warm-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role={user!.role}
      />

      {/* Sidebar is fixed, so the content column is offset rather than flowed. */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-30 bg-white border-b border-warm-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-sm text-warm-gray-500 hover:bg-warm-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold text-charcoal-900">SalonBook</span>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}