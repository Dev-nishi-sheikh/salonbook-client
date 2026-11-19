import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'SalonBook - Salon Appointment Booking Platform',
  description: 'Book salon appointments online with ease. Browse services, manage bookings, and enjoy professional beauty experiences.',
  keywords: ['salon', 'booking', 'appointment', 'beauty', 'hair', 'spa', 'massage'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}