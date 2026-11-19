'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Twitter, MapPin, Clock, Phone, Mail } from 'lucide-react';

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
    { name: 'Facebook', href: '#', icon: Facebook },
    { name: 'Instagram', href: '#', icon: Instagram },
    { name: 'Twitter', href: '#', icon: Twitter },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-white mb-4">
              <span className="text-3xl">💇</span>
              SalonBook
            </Link>
            <p className="text-gray-400 max-w-sm mb-6">
              Your premier destination for professional salon services. Book appointments online with ease and enjoy exceptional beauty experiences.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors"
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
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {navigationLinks.QuickLinks.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              {navigationLinks.Services.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-salon-400 mt-0.5 flex-shrink-0" />
                <address className="not-italic text-gray-400 text-sm">{contactInfo.address}</address>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-salon-400 flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                  {contactInfo.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-salon-400 flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="text-gray-400 hover:text-white transition-colors text-sm">
                  {contactInfo.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-salon-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-400 text-sm whitespace-pre-line">{contactInfo.hours}</div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} SalonBook. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {navigationLinks.Support.map(link => (
                <Link key={link.name} href={link.href} className="text-gray-400 hover:text-white transition-colors text-sm">
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