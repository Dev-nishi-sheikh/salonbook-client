'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export default function PaymentCancelPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 bg-ivory-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <XCircle className="h-8 w-8 text-gold-600" />
            </div>
            
            <h1 className="text-heading-lg font-bold text-charcoal-900 mb-2 font-display">Payment Cancelled</h1>
            <p className="text-warm-gray-600 mb-6 leading-relaxed">
              Your payment was not completed. No charges have been made.
              You can try again whenever you're ready.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/customer/appointments">
                <Button className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Appointments
                </Button>
              </Link>
              <Link href="/browse">
                <Button variant="outline" className="w-full sm:w-auto">
                  Browse Services
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