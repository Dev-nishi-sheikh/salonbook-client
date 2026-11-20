'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Clock, Users } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Service } from '@/types';
import { formatCurrency } from '@/lib/utils';

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
  "Men's Grooming": '🧔',
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
  "Men's Grooming": 'Tailored grooming for men',
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
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero: fills the first viewport; everything else is below the fold */}
        <section className="relative flex min-h-[100svh] w-full items-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=2400&q=80')",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

          <div className="relative container-main w-full py-24 sm:py-28 lg:py-32">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Discover Your Perfect Salon Experience
              </h1>
              <p className="text-base sm:text-lg text-white/90 mb-8 max-w-xl leading-relaxed">
                Book salon services online with ease. Browse haircuts, coloring, facials and spa
                treatments, then schedule an appointment that fits your day.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/browse">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Salon Services
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-white border-b border-warm-gray-200">
          <div className="container-main">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard icon={Sparkles} title="Expert Stylists" description="Certified professionals with years of experience in beauty and wellness." />
              <FeatureCard icon={Shield} title="Quality Guaranteed" description="Premium products and services with a satisfaction guarantee." />
              <FeatureCard icon={Clock} title="Flexible Booking" description="Book any time with online scheduling that suits your routine." />
              <FeatureCard icon={Users} title="Trusted by Customers" description="A growing base of clients who book with us regularly." />
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-warm-gray-50">
          <div className="container-main">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900">Featured Services</h2>
                <p className="mt-1 text-warm-gray-600">Popular services chosen by our customers</p>
              </div>
              <Link href="/browse">
                <Button variant="outline">
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
              <div className="text-center py-10">
                <p className="text-warm-gray-500">No services available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-white">
          <div className="container-main">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 text-center mb-2">Explore by Category</h2>
            <p className="text-warm-gray-600 text-center mb-8 max-w-2xl mx-auto">
              Browse our services grouped by category
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
                    className="group card card-hover p-5 text-center"
                  >
                    <div className="text-3xl mb-2">{CATEGORY_ICONS[category] || '✨'}</div>
                    <h3 className="font-semibold text-charcoal-900 group-hover:text-charcoal-700 transition-colors">
                      {category}
                    </h3>
                    <p className="text-sm text-warm-gray-500 mt-1">{CATEGORY_DESCRIPTIONS[category] || 'Professional salon services'}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-warm-gray-500">No categories available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-charcoal-900">
          <div className="container-main text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to Book Your Appointment?</h2>
            <p className="text-warm-gray-300 mb-8 max-w-2xl mx-auto">
              Create an account and book your next salon visit in a few clicks.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto bg-white text-charcoal-900 hover:bg-warm-gray-100">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/browse">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10"
                >
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
    <div className="card p-5">
      <div className="w-10 h-10 mb-3 bg-warm-gray-100 border border-warm-gray-200 rounded-sm flex items-center justify-center">
        <Icon className="h-5 w-5 text-charcoal-700" />
      </div>
      <h3 className="font-semibold text-charcoal-900 mb-1">{title}</h3>
      <p className="text-body-sm text-warm-gray-600">{description}</p>
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service._id}`} className="card card-hover group overflow-hidden flex flex-col">
      <div className="aspect-[4/3] overflow-hidden bg-warm-gray-100">
        <img
          src={service.image}
          alt={service.serviceName}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <Badge variant={service.status === 'active' ? 'active' : 'inactive'} size="sm">
            {service.status}
          </Badge>
          <span className="text-sm font-semibold text-charcoal-900">{formatCurrency(service.price)}</span>
        </div>
        <h3 className="font-semibold text-charcoal-900 mb-1">{service.serviceName}</h3>
        <p className="text-sm text-warm-gray-500 mb-2">{service.category}</p>
        <p className="text-body-sm text-warm-gray-600 line-clamp-2 mb-3">{service.description}</p>
        <div className="flex items-center gap-4 text-body-sm text-warm-gray-500 mt-auto">
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
      <div className="aspect-[4/3] bg-warm-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-warm-gray-200 rounded-sm w-3/4" />
        <div className="h-3 bg-warm-gray-200 rounded-sm w-1/2" />
        <div className="h-3 bg-warm-gray-200 rounded-sm w-5/6" />
      </div>
    </div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="card p-5 text-center animate-pulse">
      <div className="h-8 w-8 bg-warm-gray-200 rounded-full mx-auto mb-2" />
      <div className="h-4 bg-warm-gray-200 rounded-sm w-3/4 mx-auto mb-1" />
      <div className="h-3 bg-warm-gray-200 rounded-sm w-full" />
    </div>
  );
}