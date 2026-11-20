'use client';

import React from 'react';
import Link from 'next/link';
import { Share2, Globe, MessageSquare, MapPin, Clock, Phone, Mail } from 'lucide-react';

export function Footer() {
  const navigationLinks = {
    QuickLinks: [
      { name: 'Home', href: '/' },
      { name: 'Browse Services', href: '/browse' },
      { name: 'About Us', href: '#' },
      { name: 'Contact', href: '#' },
    ],
    Services: [
      { name: 'Haircut & Styling', href: '/browse?category=Haircut & Styling' },
      { name: 'Hair Coloring', href: '/browse?category=Hair Coloring' },
      { name: 'Facial & Skincare', href: '/browse?category=Facial & Skincare' },
      { name: 'Spa & Massage', href: '/browse?category=Spa & Massage' },
    ],
    Support: [
      { name: 'FAQ', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Booking Policy', href: '#' },
    ],
  };

  const contactInfo = {
    address: '123 Beauty Street, Salon District, NY 10001',
    phone: '+1 (555) 123-4567',
    email: 'hello@salonbook.com',
    hours: 'Mon - Fri: 9:00 AM - 7:00 PM\nSat: 10:00 AM - 6:00 PM\nSun: Closed',
  };

  const socialLinks = [
    { name: 'Share', href: '#', icon: Share2 },
    { name: 'Website', href: '#', icon: Globe },
    { name: 'Contact', href: '#', icon: MessageSquare },
  ];

  return (
    <footer className="bg-charcoal-900 text-warm-gray-300">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
              <span className="text-3xl">💇</span>
              <span className="font-display">SalonBook</span>
            </Link>
            <p className="text-warm-gray-400 max-w-sm mb-6 leading-relaxed">
              Your premier destination for professional salon services. Book appointments online with ease and enjoy exceptional beauty experiences.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-warm-gray-400 hover:text-rose-300 transition-colors duration-200"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-heading-sm">Quick Links</h3>
            <ul className="space-y-2.5">
              {navigationLinks.QuickLinks.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-warm-gray-400 hover:text-rose-300 transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-heading-sm">Services</h3>
            <ul className="space-y-2.5">
              {navigationLinks.Services.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-warm-gray-400 hover:text-rose-300 transition-colors duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-heading-sm">Contact Us</h3>
            <ul className="space-y-3.5">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <address className="not-italic text-warm-gray-400 text-body-sm">{contactInfo.address}</address>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-rose-400 flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="text-warm-gray-400 hover:text-rose-300 transition-colors duration-200 text-body-sm">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-rose-400 flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="text-warm-gray-400 hover:text-rose-300 transition-colors duration-200 text-body-sm">
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="text-warm-gray-400 text-body-sm whitespace-pre-line">{contactInfo.hours}</div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-charcoal-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-warm-gray-400 text-body-sm">
              © {new Date().getFullYear()} SalonBook. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {navigationLinks.Support.map(link => (
                <Link key={link.name} href={link.href} className="text-warm-gray-400 hover:text-rose-300 transition-colors duration-200 text-body-sm">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}