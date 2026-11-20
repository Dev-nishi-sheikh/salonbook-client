'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const providerError = searchParams.get('error');
      const providerErrorDescription = searchParams.get('error_description');

      if (providerError) {
        setError(providerErrorDescription || providerError);
        setIsWorking(false);
        return;
      }

      try {
        await refreshUser();
      } catch {
        // refreshUser already swallows network errors; fall through to the check below.
      }

      const { data } = await getSession();
      if (data?.user) {
        const role = (data.user as { role?: string }).role;
        router.replace(role === 'admin' ? '/dashboard/admin/overview' : '/dashboard/customer/overview');
        return;
      }

      setError('We could not complete your sign-in. Please try again.');
      setIsWorking(false);
    };

    handleCallback();
  }, [refreshUser, router, searchParams]);

  if (isWorking) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-charcoal-700 mx-auto mb-3" />
            <p className="text-warm-gray-600">Completing sign in...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-sm flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="text-heading-md font-semibold text-charcoal-900 mb-1">Sign in failed</h1>
            <p className="text-warm-gray-600 mb-5">{error}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link href="/auth/signin" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Back to Sign In</Button>
              </Link>
              <Link href="/" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">Go Home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen"><main className="flex-1 flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-charcoal-700" /></main></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}