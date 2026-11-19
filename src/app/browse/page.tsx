'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { Service, ServiceStatus, SERVICE_CATEGORIES } from '@/types';
import { formatCurrency, classNames } from '@/lib/utils';

export default function BrowseServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 9, total: 0, pages: 0 });
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'createdAt' | 'serviceName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await api.getServices({
        page: pagination.page,
        limit: pagination.limit,
        search: search || undefined,
        category: selectedCategory || undefined,
        sortBy,
        sortOrder,
        status: ServiceStatus.ACTIVE,
      });
      
      if (response.success && response.data) {
        setServices(response.data);
        if (response.pagination) {
          setPagination(prev => ({ ...prev, ...response.pagination }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
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
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [pagination.page, search, selectedCategory, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchServices();
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const hasFilters = search || selectedCategory;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <section className="bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Browse Services</h1>
              <p className="text-gray-600 mt-1">Explore our salon services and find the perfect treatment for you</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
              <div className="md:flex-1">
                <label htmlFor="search" className="sr-only">Search services</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="search"
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search services by name..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-salon-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="md:w-48">
                <Select
                  label="Category"
                  options={categories.map(c => ({ value: c, label: c }))}
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  placeholder="All Categories"
                />
              </div>

              <div className="md:w-48">
                <Select
                  label="Sort By"
                  options={[
                    { value: 'createdAt', label: 'Newest' },
                    { value: 'price', label: 'Price: Low to High' },
                    { value: '-price', label: 'Price: High to Low' },
                    { value: 'serviceName', label: 'Name: A-Z' },
                    { value: '-serviceName', label: 'Name: Z-A' },
                  ]}
                  value={sortBy + (sortOrder === 'desc' && sortBy !== 'createdAt' ? '' : '')}
                  onChange={e => {
                    const value = e.target.value;
                    if (value.startsWith('-')) {
                      setSortBy(value.slice(1) as any);
                      setSortOrder('desc');
                    } else {
                      setSortBy(value as any);
                      setSortOrder('asc');
                    }
                  }}
                />
              </div>

              {hasFilters && (
                <Button type="button" variant="ghost" onClick={clearFilters} className="whitespace-nowrap">
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </form>
          </div>
        </section>

        <section className="py-8 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {services.map(service => (
                    <ServiceCard key={service._id} service={service} />
                  ))}
                </div>

                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-4 text-sm text-gray-600">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Filter className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link href={`/services/${service._id}`} className="card group overflow-hidden h-full flex flex-col">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={service.image}
          alt={service.serviceName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={service.status === 'active' ? 'active' : 'inactive'} size="sm">
            {service.status}
          </Badge>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-salon-600">{service.category}</span>
          <span className="text-lg font-bold text-gray-900">{formatCurrency(service.price)}</span>
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-salon-600 transition-colors mb-1 flex-1">
          {service.serviceName}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{service.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t border-gray-100">
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
    <div className="card overflow-hidden animate-pulse flex flex-col h-full">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 bg-gray-200 rounded w-24" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full flex-1" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
        <div className="pt-2 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  );
}