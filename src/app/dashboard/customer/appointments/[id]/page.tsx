'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, XCircle, CreditCard, Loader2, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Appointment, type AppointmentStatus as AppointmentStatusType, type PaymentStatus as PaymentStatusType } from '@/types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeClass, getStatusLabel, canCancelAppointment, canPayForAppointment, classNames } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const appointmentId = params.id as string;

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.getAppointmentById(appointmentId);
        if (response.success && response.data) {
          setAppointment(response.data);
        } else {
          setError(response.message || 'Appointment not found');
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('Appointment not found');
        } else if (err.response?.status === 403) {
          setError('Not authorized to view this appointment');
        } else {
          setError(err.response?.data?.message || 'Failed to load appointment');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  const handleCancel = async () => {
    if (!appointment) return;

    setIsCancelling(true);
    try {
      const response = await api.cancelAppointment(appointment._id);
      if (response.success) {
        toast.success('Appointment cancelled successfully');
        setAppointment(prev => prev ? { ...prev, status: 'cancelled' as AppointmentStatusType } : null);
        setShowCancelModal(false);
      } else {
        toast.error(response.message || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePayNow = async () => {
    if (!appointment) return;
    try {
      const response = await api.initiatePayment(appointment._id);
      if (response.success && response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error(response.message || 'Failed to initiate payment');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    }
  };

  const status = appointment?.status as AppointmentStatusType;
  const paymentStatus = appointment?.paymentStatus as PaymentStatusType;
  const service = appointment?.serviceId as any;

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-salon-600" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The appointment you are looking for does not exist.'}</p>
            <Link href="/dashboard/customer/appointments">
              <Button>Back to Appointments</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to view appointment details</p>
            <Button onClick={() => router.push('/auth/signin')} className="mt-4">Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard/customer/appointments"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-salon-600 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </Link>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{service?.serviceName || 'Appointment Details'}</CardTitle>
                  <Badge variant={getStatusBadgeClass(status)}>{getStatusLabel(status)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {service?.image && (
                  <img
                    src={service.image}
                    alt={service.serviceName}
                    className="w-full aspect-[4/3] object-cover rounded-xl"
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Service Information</h4>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Category</dt>
                        <dd className="font-medium text-gray-900">{service?.category || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Price</dt>
                        <dd className="font-medium text-gray-900">{formatCurrency(appointment.servicePrice)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Duration</dt>
                        <dd className="font-medium text-gray-900">{service?.duration || 'N/A'} min</dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Appointment Details</h4>
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Date</dt>
                        <dd className="font-medium text-gray-900">{formatDate(appointment.appointmentDate)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Time</dt>
                        <dd className="font-medium text-gray-900">{formatTime(appointment.timeSlot)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Payment Status</dt>
                        <dd className="font-medium text-gray-900">
                          <Badge variant={getStatusBadgeClass(paymentStatus)}>{getStatusLabel(paymentStatus)}</Badge>
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">Requested On</dt>
                        <dd className="font-medium text-gray-900">{formatDate(appointment.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {appointment.message && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1">Your Message</h4>
                    <p className="text-gray-600 italic">"{appointment.message}"</p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-gray-900 mb-4">Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    {canCancelAppointment(appointment) && (
                      <Button variant="outline" onClick={() => setShowCancelModal(true)}>
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel Appointment
                      </Button>
                    )}
                    {canPayForAppointment(appointment) && (
                      <Button onClick={handlePayNow}>
                        <CreditCard className="h-4 w-4 mr-1" />
                        Pay Now
                      </Button>
                    )}
                    {status === 'confirmed' && paymentStatus === 'paid' && (
                      <Button variant="ghost" disabled>
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        Completed
                      </Button>
                    )}
                    {status === 'cancelled' && (
                      <Button variant="ghost" disabled>
                        <XCircle className="h-4 w-4 mr-1 text-red-600" />
                        Cancelled
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{service?.serviceName || 'Service'}</p>
            <p className="text-sm text-gray-500">
              {formatDate(appointment.appointmentDate)} at {formatTime(appointment.timeSlot)}
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Keep Appointment
            </Button>
            <Button variant="danger" onClick={handleCancel} isLoading={isCancelling}>
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}