'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Scissors, Calendar, CheckCircle, CreditCard, Loader2, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { api } from '@/lib/api';
import { classNames } from '@/lib/utils';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalServices: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    successfulPayments: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getDashboardStats();
        if (response.success && response.data) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Customers', value: stats.totalCustomers, icon: Users, color: 'bg-blue-100 text-blue-600', href: '/dashboard/admin/users' },
    { title: 'Active Services', value: stats.totalServices, icon: Scissors, color: 'bg-purple-100 text-purple-600', href: '/dashboard/admin/services' },
    { title: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: 'bg-green-100 text-green-600', href: '/dashboard/admin/appointments' },
    { title: 'Pending Requests', value: stats.pendingAppointments, icon: CheckCircle, color: 'bg-yellow-100 text-yellow-600', href: '/dashboard/admin/appointments?status=pending' },
    { title: 'Confirmed', value: stats.confirmedAppointments, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600', href: '/dashboard/admin/appointments?status=confirmed' },
    { title: 'Successful Payments', value: stats.successfulPayments, icon: CreditCard, color: 'bg-indigo-100 text-indigo-600', href: '/dashboard/admin/transactions' },
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

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-600">Access denied. Admin privileges required.</p>
            <Button onClick={() => router.push('/')} className="mt-4">Go Home</Button>
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's an overview of your salon platform.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <Link key={stat.title} href={stat.href} className={classNames('card hover:shadow-md transition-shadow', index >= 3 && 'xl:col-span-2')}>
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
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/admin/services" className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                    <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Scissors className="h-7 w-7 text-purple-600" />
                    </div>
                    <span className="font-medium text-gray-900">Manage Services</span>
                    <span className="text-sm text-gray-500">Add, edit, or remove services</span>
                  </Link>
                  <Link href="/dashboard/admin/appointments" className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                    <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-7 w-7 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-900">Appointments</span>
                    <span className="text-sm text-gray-500">Review & manage bookings</span>
                  </Link>
                  <Link href="/dashboard/admin/users" className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-7 w-7 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">Manage Users</span>
                    <span className="text-sm text-gray-500">View & manage customers</span>
                  </Link>
                  <Link href="/dashboard/admin/transactions" className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center">
                    <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-7 w-7 text-indigo-600" />
                    </div>
                    <span className="font-medium text-gray-900">Transactions</span>
                    <span className="text-sm text-gray-500">View payment history</span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem 
                    icon={Users} 
                    iconColor="bg-blue-100 text-blue-600"
                    title="New Customer Registration"
                    description="A new customer has signed up"
                    time="2 hours ago"
                  />
                  <ActivityItem 
                    icon={Calendar} 
                    iconColor="bg-yellow-100 text-yellow-600"
                    title="New Appointment Request"
                    description="Appointment requested for Haircut & Styling"
                    time="4 hours ago"
                  />
                  <ActivityItem 
                    icon={CreditCard} 
                    iconColor="bg-green-100 text-green-600"
                    title="Payment Received"
                    description="$85.00 received for Facial Treatment"
                    time="6 hours ago"
                  />
                  <ActivityItem 
                    icon={Scissors} 
                    iconColor="bg-purple-100 text-purple-600"
                    title="Service Added"
                    description="New service 'Deep Conditioning' added"
                    time="1 day ago"
                  />
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

function ActivityItem({ icon: Icon, iconColor, title, description, time }: { icon: React.ComponentType<{ className?: string }>; iconColor: string; title: string; description: string; time: string }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <span className="text-xs text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
}