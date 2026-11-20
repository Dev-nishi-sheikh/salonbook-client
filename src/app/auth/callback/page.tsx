'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, isLoading, isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      // Wait for session to be established
      await refreshUser();
      
      // Check for error from OAuth provider
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      if (error) {
        console.error('OAuth error:', error, errorDescription);
        router.push('/auth/signin?error=' + encodeURIComponent(errorDescription || error));
        return;
      }

      // If authenticated, redirect based on role
      if (isAuthenticated && user) {
        if (user.role === 'admin') {
          router.push('/dashboard/admin/overview');
        } else {
          router.push('/dashboard/customer/overview');
        }
      } else {
        // If not authenticated after callback, go to signin
        router.push('/auth/signin');
      }
    };

    handleCallback();
  }, [refreshUser, router, searchParams, isAuthenticated, user]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-rose-600 mx-auto mb-4" />
          <p className="text-warm-gray-600">Completing sign in...</p>
        </div>
      </main>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen"><main className="flex-1 flex items-center justify-center py-12 px-4"><div className="text-center"><Loader2 className="h-12 w-12 animate-spin text-rose-600 mx-auto mb-4" /><p className="text-warm-gray-600">Loading...</p></div></main></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}