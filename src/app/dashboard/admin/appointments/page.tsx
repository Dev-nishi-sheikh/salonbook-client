'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { api } from '@/lib/api';
import { Appointment, type AppointmentStatus as AppointmentStatusType, type PaymentStatus as PaymentStatusType } from '@/types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeClass, getStatusLabel, classNames } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatusType | ''>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatusType | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<AppointmentStatusType>('pending');

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const response = await api.getAllAppointments({
          page: pagination.page,
          limit: pagination.limit,
          search: search || undefined,
          status: statusFilter || undefined,
          paymentStatus: paymentStatusFilter || undefined,
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
  }, [pagination.page, search, statusFilter, paymentStatusFilter]);

  const handleOpenModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setNewStatus(appointment.status as AppointmentStatusType);
    setShowModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedAppointment) return;

    setIsUpdating(true);
    try {
      const response = await api.updateAppointmentStatus(selectedAppointment._id, newStatus);
      if (response.success && response.data) {
        toast.success(`Appointment ${newStatus}`);
        setAppointments(prev => prev.map(a => a._id === selectedAppointment._id ? response.data! : a));
        setShowModal(false);
        setSelectedAppointment(null);
      } else {
        toast.error(response.message || 'Failed to update appointment');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="w-full">

        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>

      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="w-full">

        <div className="flex min-h-[60vh] items-center justify-center py-12">
          <div className="text-center">
            <p className="text-warm-gray-600">Access denied. Admin privileges required.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
          </div>
        </div>

      </div>
    );
  }

  const statusFilters: { value: AppointmentStatusType | ''; label: string }[] = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentFilters: { value: PaymentStatusType | ''; label: string }[] = [
    { value: '', label: 'All Payment' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'paid', label: 'Paid' },
  ];

  return (
    <div className="w-full">

      <div className="w-full">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal-900 font-display">Manage Appointments</h1>
            <p className="text-warm-gray-600 mt-1">View and manage all appointment requests</p>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                placeholder="Search by customer or service..."
                className="input pl-10"
              />
            </div>
            <Select
              options={statusFilters}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as any); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="w-40"
            />
            <Select
              options={paymentFilters}
              value={paymentStatusFilter}
              onChange={e => { setPaymentStatusFilter(e.target.value as any); setPagination(prev => ({ ...prev, page: 1 })); }}
              className="w-40"
            />
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <AdminAppointmentRowSkeleton key={i} />
              ))}
            </div>
          ) : appointments.length > 0 ? (
            <>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th className="hidden md:table-cell">Service</th>
                      <th className="hidden lg:table-cell">Date & Time</th>
                      <th className="hidden lg:table-cell">Price</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-gray-100">
                    {appointments.map(appointment => (
                      <AdminAppointmentRow
                        key={appointment._id}
                        appointment={appointment}
                        onAction={handleOpenModal}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-4 text-body-sm text-warm-gray-600">Page {pagination.page} of {pagination.pages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.pages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar className="h-16 w-16 text-warm-gray-300 mx-auto mb-4" />
                <h3 className="text-heading-md font-medium text-charcoal-900 mb-2">No appointments found</h3>
                <p className="text-warm-gray-500 mb-6">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedAppointment(null); }}
        title="Update Appointment Status"
        description="Select the new status for this appointment"
      >
        <div className="space-y-4">
          {selectedAppointment && (
            <div className="p-4 bg-warm-gray-50 rounded-xl space-y-2">
              <p className="font-medium text-charcoal-900">{(selectedAppointment.serviceId as any)?.serviceName || 'Service'}</p>
              <p className="text-body-sm text-warm-gray-500">
                {(selectedAppointment.customerId as any)?.name || 'Customer'} • 
                {formatDate(selectedAppointment.appointmentDate)} at {formatTime(selectedAppointment.timeSlot)}
              </p>
              <p className="text-body-sm text-warm-gray-500">
                Current: <Badge variant={getStatusBadgeClass(selectedAppointment.status as AppointmentStatusType)}>{getStatusLabel(selectedAppointment.status as AppointmentStatusType)}</Badge>
              </p>
            </div>
          )}

          <Select
            label="New Status"
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'confirmed', label: 'Confirmed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            value={newStatus}
            onChange={e => setNewStatus(e.target.value as AppointmentStatusType)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-warm-gray-100">
            <Button variant="outline" onClick={() => { setShowModal(false); setSelectedAppointment(null); }}>
              Cancel
            </Button>
            <Button variant={newStatus === 'cancelled' ? 'danger' : 'primary'} onClick={handleStatusUpdate} isLoading={isUpdating}>
              {isUpdating ? 'Updating...' : `Mark as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function AdminAppointmentRow({ appointment, onAction }: { appointment: Appointment; onAction: (a: Appointment) => void }) {
  const service = appointment.serviceId as any;
  const customer = appointment.customerId as any;
  const status = appointment.status as AppointmentStatusType;
  const paymentStatus = appointment.paymentStatus as PaymentStatusType;

  return (
    <tr className="hover:bg-warm-gray-50">
      <td className="py-4">
        <div>
          <p className="font-medium text-charcoal-900">{customer?.name || 'Unknown'}</p>
          <p className="text-body-sm text-warm-gray-500">{customer?.email || ''}</p>
        </div>
      </td>
      <td className="py-4 hidden md:table-cell">
        <p className="font-medium text-charcoal-900">{service?.serviceName || 'Service'}</p>
        <p className="text-body-sm text-warm-gray-500">{service?.category || ''}</p>
      </td>
      <td className="py-4 hidden lg:table-cell text-warm-gray-600">
        <p>{formatDate(appointment.appointmentDate)}</p>
        <p className="text-body-sm">{formatTime(appointment.timeSlot)}</p>
      </td>
      <td className="py-4 hidden lg:table-cell font-medium text-charcoal-900">{formatCurrency(appointment.servicePrice)}</td>
      <td className="py-4">
        <Badge variant={getStatusBadgeClass(status)}>{getStatusLabel(status)}</Badge>
      </td>
      <td className="py-4">
        <Badge variant={getStatusBadgeClass(paymentStatus)}>{getStatusLabel(paymentStatus)}</Badge>
      </td>
      <td className="py-4">
        <Button variant="outline" size="sm" onClick={() => onAction(appointment)}>
          Update
        </Button>
      </td>
    </tr>
  );
}

function AdminAppointmentRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4"><div className="h-5 bg-warm-gray-200 rounded w-3/4" /><div className="h-4 bg-warm-gray-200 rounded w-1/2 mt-1" /></td>
      <td className="py-4 hidden md:table-cell"><div className="h-5 bg-warm-gray-200 rounded w-3/4" /><div className="h-4 bg-warm-gray-200 rounded w-1/2 mt-1" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-24" /><div className="h-3 bg-warm-gray-200 rounded w-16 mt-1" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4"><div className="h-5 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4"><div className="h-5 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4"><div className="h-8 bg-warm-gray-200 rounded w-20" /></td>
    </tr>
  );
}