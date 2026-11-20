'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, MapPin, User, CheckCircle, AlertCircle, X, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Service, Appointment, TIME_SLOTS, AppointmentStatus } from '@/types';
import { formatCurrency, formatDate, formatTime, classNames } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    appointmentDate: '',
    timeSlot: '',
    message: '',
  });
  const [bookingErrors, setBookingErrors] = useState<Record<string, string>>({});
  const [isBooking, setIsBooking] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>(TIME_SLOTS);

  const serviceId = params.id as string;

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await api.getServiceById(serviceId);
        if (response.success && response.data) {
          setService(response.data);
        } else {
          setError(response.message || 'Service not found');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load service');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
    fetchTimeSlots();
  }, [serviceId]);

  const fetchTimeSlots = async () => {
    try {
      const response = await api.getTimeSlots();
      if (response.success && response.data) {
        setTimeSlots(response.data);
      }
    } catch {
      // Use default time slots
    }
  };

  const validateBookingForm = () => {
    const newErrors: Record<string, string> = {};
    if (!bookingForm.appointmentDate) newErrors.appointmentDate = 'Please select a date';
    if (!bookingForm.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    setBookingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBookingForm()) return;

    setIsBooking(true);
    try {
      const response = await api.createAppointment({
        serviceId,
        appointmentDate: bookingForm.appointmentDate,
        timeSlot: bookingForm.timeSlot,
        message: bookingForm.message,
      });
      
      if (response.success) {
        toast.success('Appointment request submitted successfully!');
        setShowBookingModal(false);
        setBookingForm({ appointmentDate: '', timeSlot: '', message: '' });
        setBookingErrors({});
        router.push('/dashboard/customer/appointments');
      } else {
        toast.error(response.message || 'Failed to book appointment');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-warm-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-charcoal-900 mb-2">Service Not Found</h1>
            <p className="text-warm-gray-600 mb-6">{error || 'The service you are looking for does not exist.'}</p>
            <Link href="/browse">
              <Button>Browse Services</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canBook = service.status === 'active' && isAuthenticated && user?.role !== 'admin';

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container-main">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 text-warm-gray-600 hover:text-rose-600 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <img
                src={service.image}
                alt={service.serviceName}
                className="w-full aspect-[4/3] object-cover rounded-2xl"
              />
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={service.status === 'active' ? 'active' : 'inactive'}>
                  {service.status}
                </Badge>
                <span className="text-body-sm text-warm-gray-500">{service.category}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-900 mb-2 font-display">{service.serviceName}</h1>
              <p className="text-warm-gray-600 mb-6 text-lg leading-relaxed">{service.description}</p>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-warm-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-body-sm text-warm-gray-500">Price</p>
                    <p className="text-heading-lg font-bold text-charcoal-900">{formatCurrency(service.price)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-warm-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-body-sm text-warm-gray-500">Duration</p>
                    <p className="text-heading-lg font-bold text-charcoal-900">{service.duration} min</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-warm-gray-50 rounded-2xl">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                    <User className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="text-body-sm text-warm-gray-500">Category</p>
                    <p className="text-heading-md font-medium text-charcoal-900">{service.category}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated && user?.role === 'admin' ? (
                  <div className="flex-1">
                    <p className="text-center text-warm-gray-500 py-4">
                      Admin users cannot book appointments
                    </p>
                  </div>
                ) : canBook ? (
                  <Button
                    onClick={() => setShowBookingModal(true)}
                    size="lg"
                    className="flex-1"
                  >
                    Book Appointment
                    <Calendar className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => router.push('/auth/signin')}
                    >
                      Sign In to Book
                    </Button>
                    {service.status !== 'active' && (
                      <Button
                        variant="secondary"
                        size="lg"
                        disabled
                        className="flex-1"
                      >
                        Not Available
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 mb-6 font-display">About this Service</h2>
            <div className="card p-6">
              <div className="prose max-w-none text-warm-gray-600">
                <p>{service.description}</p>
                <ul className="list-disc list-inside mt-4 space-y-2">
                  <li>Professional and certified specialists</li>
                  <li>Premium quality products used</li>
                  <li>Relaxing and hygienic environment</li>
                  <li>Customized to your preferences</li>
                  <li>Flexible scheduling options</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Book Appointment"
        description={`Schedule your ${service.serviceName} appointment`}
        size="lg"
      >
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <Input
            label="Appointment Date"
            type="date"
            value={bookingForm.appointmentDate}
            onChange={e => setBookingForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
            error={bookingErrors.appointmentDate}
            min={minDate}
            required
          />

          <Select
            label="Available Time Slot"
            options={timeSlots.map(slot => ({ value: slot, label: formatTime(slot) }))}
            value={bookingForm.timeSlot}
            onChange={e => setBookingForm(prev => ({ ...prev, timeSlot: e.target.value }))}
            error={bookingErrors.timeSlot}
            placeholder="Select a time slot"
            required
          />

          <Textarea
            label="Additional Message (Optional)"
            value={bookingForm.message}
            onChange={e => setBookingForm(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Any special requests or notes for the stylist..."
            rows={3}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowBookingModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isBooking}>
              {isBooking ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}