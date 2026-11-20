'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Loader2, Trash2, ChevronLeft, ChevronRight, DollarSign, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Appointment, type AppointmentStatus as AppointmentStatusType, type PaymentStatus as PaymentStatusType } from '@/types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeClass, getStatusLabel, canCancelAppointment, canPayForAppointment, classNames } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CustomerAppointmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusType | ''>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await api.getMyAppointments({
          page: pagination.page,
          limit: pagination.limit,
          status: statusFilter || undefined,
        });
        if (response.success && response.data) {
          setAppointments(response.data);
          if (response.pagination) {
            setPagination(prev => ({ ...prev, ...response.pagination }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [pagination.page, statusFilter]);

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    
    setIsCancelling(true);
    try {
      const response = await api.cancelAppointment(selectedAppointment._id);
      if (response.success) {
        toast.success('Appointment cancelled successfully');
        setAppointments(prev => prev.map(a => 
          a._id === selectedAppointment._id ? { ...a, status: 'cancelled' as AppointmentStatusType } : a
        ));
        setShowCancelModal(false);
        setSelectedAppointment(null);
      } else {
        toast.error(response.message || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setIsCancelling(false);
    }
  };

  const handlePayNow = async (appointment: Appointment) => {
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

  const statusFilters: { value: AppointmentStatusType | ''; label: string }[] = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-1">View and manage your salon appointments</p>
        </div>
        <Link href="/browse">
          <Button>
            Book New Appointment
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map(filter => (
          <Button
            key={filter.value}
            variant={statusFilter === filter.value ? 'primary' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter(filter.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <AppointmentCardSkeleton key={i} />
          ))}
        </div>
      ) : appointments.length > 0 ? (
        <>
          <div className="space-y-4">
            {appointments.map(appointment => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
                onCancel={() => {
                  setSelectedAppointment(appointment);
                  setShowCancelModal(true);
                }}
                onPay={() => handlePayNow(appointment)}
              />
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
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
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card className="text-center py-12">
          <CardContent>
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {statusFilter ? `No ${statusFilter} appointments` : 'No appointments yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {statusFilter 
                ? 'Try changing the filter or book a new appointment'
                : 'Book your first salon service today'}
            </p>
            <Link href="/browse">
              <Button>Browse Services</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setSelectedAppointment(null); }}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
      >
        <div className="space-y-4">
          {selectedAppointment && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">{(selectedAppointment.serviceId as any)?.serviceName}</p>
              <p className="text-sm text-gray-500">
                {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.timeSlot)}
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setShowCancelModal(false); setSelectedAppointment(null); }}>
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

function AppointmentCard({ appointment, onCancel, onPay }: { appointment: Appointment; onCancel: () => void; onPay: () => void }) {
  const service = appointment.serviceId as any;
  const status = appointment.status as AppointmentStatusType;
  const paymentStatus = appointment.paymentStatus as PaymentStatusType;

  return (
    <Link href={`/dashboard/customer/appointments/${appointment._id}`} className="block">
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {service?.image && (
              <img
                src={service.image}
                alt={service.serviceName}
                className="w-full md:w-32 h-32 md:h-auto object-cover"
              />
            )}
            <div className="flex-1 p-4 md:p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{service?.serviceName || 'Service'}</h4>
                  <p className="text-sm text-gray-500">{service?.category}</p>
                </div>
                <Badge variant={getStatusBadgeClass(status)}>{getStatusLabel(status)}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(appointment.appointmentDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(appointment.timeSlot)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <CreditCard className="h-4 w-4" />
                  <span>{formatCurrency(appointment.servicePrice)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeClass(paymentStatus)}>{getStatusLabel(paymentStatus)}</Badge>
                </div>
              </div>

              {appointment.message && (
                <p className="text-sm text-gray-600 mb-4 italic">"{appointment.message}"</p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" size="sm" className="text-salon-600 hover:text-salon-700">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                {canCancelAppointment(appointment) && (
                  <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); onCancel(); }}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
                {canPayForAppointment(appointment) && (
                  <Button size="sm" onClick={(e) => { e.preventDefault(); onPay(); }}>
                    <CreditCard className="h-4 w-4 mr-1" />
                    Pay Now
                  </Button>
                )}
                {status === 'confirmed' && paymentStatus === 'paid' && (
                  <Button variant="ghost" size="sm" disabled>
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Completed
                  </Button>
                )}
                {status === 'cancelled' && (
                  <Button variant="ghost" size="sm" disabled>
                    <XCircle className="h-4 w-4 mr-1 text-red-600" />
                    Cancelled
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AppointmentCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-32 h-32 md:h-auto bg-gray-200" />
          <div className="flex-1 p-4 md:p-6 space-y-4">
            <div className="h-5 bg-gray-200 rounded w-3/4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-5 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-200 rounded" />
              <div className="h-5 bg-gray-200 rounded" />
            </div>
            <div className="h-8 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}