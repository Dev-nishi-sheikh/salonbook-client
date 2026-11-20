'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertCircle, Loader2, ArrowRight, Calendar } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { api } from '@/lib/api';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<{
    appointmentId: string;
    amount: number;
    currency: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await api.paymentSuccess(sessionId);
        if (response.success && response.data) {
          setPaymentData({
            appointmentId: response.data.appointmentId,
            amount: response.data.amount,
            currency: response.data.currency,
          });
        } else {
          setError(response.message || 'Payment verification failed');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Payment verification failed');
      } finally {
        setIsLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-8 w-8 text-rose-600" />
              </div>
              <h1 className="text-heading-lg font-bold text-charcoal-900 mb-2 font-display">Payment Needs Attention</h1>
              <p className="text-warm-gray-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/customer/appointments">
                  <Button className="w-full sm:w-auto">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Appointments
                  </Button>
                </Link>
                <Link href="/browse">
                  <Button variant="outline" className="w-full sm:w-auto">Browse Services</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            
            <h1 className="text-heading-lg font-bold text-charcoal-900 mb-2 font-display">Payment Successful</h1>
            <p className="text-warm-gray-600 mb-6">
              Thank you for your payment. Your appointment has been confirmed.
            </p>

            {paymentData && (
              <div className="bg-warm-gray-50 rounded-2xl p-6 mb-6 text-left border border-warm-gray-100">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-body-sm text-warm-gray-500">Amount Paid</span>
                    <span className="font-semibold text-charcoal-900">{paymentData.amount} {paymentData.currency.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-warm-gray-500">Appointment ID</span>
                    <span className="font-mono text-body-sm text-charcoal-900">{paymentData.appointmentId.slice(0, 12)}...</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/customer/appointments">
                <Button className="w-full sm:w-auto">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  View My Appointments
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="w-full sm:w-auto">
                  Book Another Service
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen"><main className="flex-1 flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-rose-600" /></main></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}