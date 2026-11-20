'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Clock, Users, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Service } from '@/types';
import { formatCurrency, classNames } from '@/lib/utils';

const CATEGORY_ICONS: Record<string, string> = {
  'Haircut & Styling': '✂️',
  'Hair Coloring': '🎨',
  'Hair Treatment': '✨',
  'Facial & Skincare': '🧖',
  'Makeup': '💄',
  'Manicure & Pedicure': '💅',
  'Spa & Massage': '🧘',
  'Hair Removal': '🧴',
  'Bridal': '👰',
  'Men\'s Grooming': '🧔',
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'Haircut & Styling': 'Professional cuts and styling',
  'Hair Coloring': 'Vibrant colors and highlights',
  'Hair Treatment': 'Nourishing treatments',
  'Facial & Skincare': 'Rejuvenating facials',
  'Makeup': 'Professional makeup services',
  'Manicure & Pedicure': 'Beautiful nails',
  'Spa & Massage': 'Relaxing spa treatments',
  'Hair Removal': 'Smooth and hair-free skin',
  'Bridal': 'Complete bridal packages',
  'Men\'s Grooming': 'Tailored grooming for men',
};

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedServices = async () => {
      try {
        const response = await api.getFeaturedServices();
        if (response.success && response.data) {
          setFeaturedServices(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch featured services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.getServiceCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchFeaturedServices();
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        <section className="relative bg-gradient-to-br from-salon-600 via-salon-700 to-purple-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-salon-600/90 to-purple-800/90" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
            <div className="max-w-3xl animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Discover Your Perfect{' '}
                <span className="text-salon-200">Salon Experience</span>
              </h1>
              <p className="text-lg sm:text-xl text-salon-100 mb-8 max-w-2xl leading-relaxed">
                Book premium salon services online with ease. From haircuts to spa treatments, 
                find trusted professionals and schedule appointments that fit your busy lifestyle.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/browse">
                  <Button size="lg" className="bg-white text-salon-600 hover:bg-salon-50 px-8 py-3 text-lg">
                    Explore Salon Services
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
        </section>

        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <FeatureCard icon={Sparkles} title="Expert Stylists" description="Certified professionals with years of experience in beauty and wellness." />
              <FeatureCard icon={Shield} title="Quality Guaranteed" description="Premium products and services with satisfaction guarantee." />
              <FeatureCard icon={Clock} title="Flexible Booking" description="Book anytime, anywhere with our 24/7 online scheduling system." />
              <FeatureCard icon={Users} title="Loyalty Rewards" description="Earn points on every visit and enjoy exclusive member benefits." />
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Featured Services</h2>
                <p className="mt-2 text-gray-600">Our most popular salon services loved by customers</p>
              </div>
              <Link href="/browse">
                <Button variant="ghost">
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : featuredServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map(service => (
                  <ServiceCard key={service._id} service={service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No services available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">Explore by Category</h2>
            <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
              Discover our wide range of professional salon services organized by category
            </p>
            
            {categoriesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <CategoryCardSkeleton key={i} />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {categories.map(category => (
                  <Link
                    key={category}
                    href={`/browse?category=${encodeURIComponent(category)}`}
                    className="group card p-6 text-center hover:shadow-lg transition-shadow"
                  >
                    <div className="text-4xl mb-3">{CATEGORY_ICONS[category] || '✨'}</div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-salon-600 transition-colors">
                      {category}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{CATEGORY_DESCRIPTIONS[category] || 'Professional salon services'}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No categories available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-salon-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Book Your Appointment?</h2>
            <p className="text-salon-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers. Book your next salon visit in just a few clicks.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" variant="secondary" className="px-8 py-3 text-lg">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/browse">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                  Browse Services
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="card p-6 text-center hover:shadow-md transition-shadow">
      <div className="w-14 h-14 mx-auto mb-4 bg-salon-100 rounded-xl flex items-center justify-center">
        <Icon className="h-7 w-7 text-salon-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service._id}`} className="card group overflow-hidden">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={service.image}
          alt={service.serviceName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={service.status === 'active' ? 'active' : 'inactive'} size="sm">
            {service.status}
          </Badge>
          <span className="text-sm font-semibold text-gray-900">{formatCurrency(service.price)}</span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-salon-600 transition-colors mb-1">
          {service.serviceName}
        </h3>
        <p className="text-sm text-gray-500 mb-2">{service.category}</p>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{service.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {service.duration} min
          </span>
        </div>
      </div>
    </Link>
  );
}

function ServiceCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="card p-6 text-center animate-pulse">
      <div className="text-4xl mb-3">
        <div className="h-10 w-10 bg-gray-200 rounded-full mx-auto" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-1" />
      <div className="h-4 bg-gray-200 rounded w-full" />
    </div>
  );
}