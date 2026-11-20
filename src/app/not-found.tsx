'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Search, Calendar, LifeBuoy } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const QUICK_LINKS = [
  { href: '/', label: 'Home', description: 'Back to the landing page', icon: Home },
  { href: '/browse', label: 'Browse Services', description: 'Explore all salon services', icon: Search },
  { href: '/auth/signin', label: 'Sign In', description: 'Access your dashboard', icon: Calendar },
];

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl text-center">
          <div className="mb-8">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mb-6">
              <LifeBuoy className="h-8 w-8" />
            </span>
            <p className="text-6xl sm:text-7xl font-bold text-rose-600 font-display leading-none mb-4">404</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 font-display mb-3">
              We couldn&apos;t find that page
            </h1>
            <p className="text-warm-gray-600 max-w-lg mx-auto leading-relaxed">
              The page you are looking for may have moved or no longer exists.
              Try one of the destinations below to get back on track.
            </p>
          </div>

          <Card className="text-left">
            <CardContent className="p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {QUICK_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex flex-col gap-2 p-4 rounded-2xl border border-warm-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/50 transition-colors duration-200"
                  >
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-warm-gray-100 text-charcoal-700 group-hover:bg-rose-100 group-hover:text-rose-600 transition-colors duration-200">
                      <link.icon className="h-5 w-5" />
                    </span>
                    <span className="font-medium text-charcoal-900">{link.label}</span>
                    <span className="text-body-sm text-warm-gray-500">{link.description}</span>
                  </Link>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6 pt-6 border-t border-warm-gray-100">
                <Link href="/browse" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Services
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}