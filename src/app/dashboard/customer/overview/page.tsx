'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, CreditCard, Loader2, ArrowRight } from 'lucide-react';
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

export default function CustomerOverviewPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    totalPayments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, appointmentsRes] = await Promise.all([
          api.getAppointmentStats(),
          api.getMyAppointments({ limit: 5 }),
        ]);

        if (statsRes.success && statsRes.data) {
          const data = statsRes.data;
          setStats(prev => ({
            ...prev,
            totalAppointments: data.total,
            total: data.total,
            pending: data.pending,
            confirmed: data.confirmed,
            cancelled: data.cancelled,
          }));
        }
        if (appointmentsRes.success && appointmentsRes.data) {
          setRecentAppointments(appointmentsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: 'bg-blue-100 text-blue-600', href: '/dashboard/customer/appointments' },
    { title: 'Pending', value: stats.pending, icon: AlertCircle, color: 'bg-yellow-100 text-yellow-600', href: '/dashboard/customer/appointments?status=pending' },
    { title: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'bg-green-100 text-green-600', href: '/dashboard/customer/appointments?status=confirmed' },
    { title: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'bg-red-100 text-red-600', href: '/dashboard/customer/appointments?status=cancelled' },
  ];

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

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Please sign in to access your dashboard</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
            <p className="text-gray-600 mt-1">Here's an overview of your appointments</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map(stat => (
              <Link key={stat.title} href={stat.href} className="card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={classNames('w-12 h-12 rounded-xl flex items-center justify-center', stat.color)}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 mt-4" />
                </CardContent>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Appointments</CardTitle>
                <Link href="/dashboard/customer/appointments" className="text-sm text-salon-600 hover:text-salon-700">
                  View All
                </Link>
              </CardHeader>
              <CardContent>
                {recentAppointments.length > 0 ? (
                  <div className="space-y-4">
                    {recentAppointments.map(appointment => (
                      <AppointmentCard key={appointment._id} appointment={appointment} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments yet</h3>
                    <p className="text-gray-500 mb-4">Book your first salon service today</p>
                    <Link href="/browse">
                      <Button>Browse Services</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link href="/browse" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-salon-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-salon-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Browse Services</p>
                      <p className="text-sm text-gray-500">Explore available salon services</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/customer/appointments" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">My Appointments</p>
                      <p className="text-sm text-gray-500">View and manage your bookings</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/customer/profile" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Payment History</p>
                      <p className="text-sm text-gray-500">View your transaction history</p>
                    </div>
                  </Link>
                  <Link href="/dashboard/customer/profile" className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Profile Settings</p>
                      <p className="text-sm text-gray-500">Update your personal information</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const service = appointment.serviceId as any;
  const status = appointment.status as AppointmentStatusType;
  const paymentStatus = appointment.paymentStatus as PaymentStatusType;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      {service?.image && (
        <img src={service.image} alt={service.serviceName} className="w-16 h-16 object-cover rounded-lg" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 truncate">{service?.serviceName || 'Service'}</h4>
          <Badge variant={getStatusBadgeClass(status)}>{getStatusLabel(status)}</Badge>
        </div>
        <p className="text-sm text-gray-500">{service?.category}</p>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(appointment.appointmentDate)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTime(appointment.timeSlot)}
          </span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{formatCurrency(appointment.servicePrice)}</p>
        <Badge variant={getStatusBadgeClass(paymentStatus)} className="mt-1">{getStatusLabel(paymentStatus)}</Badge>
      </div>
    </div>
  );
}