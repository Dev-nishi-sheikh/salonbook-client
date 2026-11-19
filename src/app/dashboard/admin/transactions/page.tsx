'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, CreditCard, DollarSign, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { Transaction, type TransactionStatus as TransactionStatusType } from '@/types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeClass, getStatusLabel } from '@/lib/utils';

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    failed: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [txnRes, statsRes] = await Promise.all([
          api.getTransactions({
            page: pagination.page,
            limit: pagination.limit,
          }),
          api.getTransactionStats(),
        ]);

        if (txnRes.success && txnRes.data) {
          setTransactions(txnRes.data);
          if (txnRes.pagination) {
            setPagination(prev => ({ ...prev, ...txnRes.pagination }));
          }
        }

        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pagination.page]);

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

  const statCards = [
    { title: 'Total Transactions', value: stats.total, icon: CreditCard, color: 'bg-blue-100 text-blue-600' },
    { title: 'Successful', value: stats.paid, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
    { title: 'Failed', value: stats.failed, icon: XCircle, color: 'bg-red-100 text-red-600' },
    { title: 'Total Revenue', value: formatCurrency(stats.totalAmount), icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">View and monitor all payment transactions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map(stat => (
              <Card key={stat.title}>
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
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by customer, service, or session ID..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-salon-500 focus:border-transparent"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <TransactionRowSkeleton key={i} />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium hidden md:table-cell">Service</th>
                      <th className="pb-3 font-medium hidden lg:table-cell">Appointment</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium hidden lg:table-cell">Session ID</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {transactions.map(transaction => (
                      <TransactionRow key={transaction._id} transaction={transaction} />
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={pagination.page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-4 text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</span>
                  <Button variant="outline" size="sm" onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={pagination.page === pagination.pages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500 mb-6">No payment transactions recorded yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const customer = transaction.customerId as any;
  const appointment = transaction.appointmentId as any;
  const service = appointment?.serviceId as any;
  const status = transaction.status as TransactionStatusType;

  return (
    <tr className="hover:bg-gray-50">
      <td className="py-4">
        <div>
          <p className="font-medium text-gray-900">{customer?.name || 'Unknown'}</p>
          <p className="text-sm text-gray-500">{customer?.email || ''}</p>
        </div>
      </td>
      <td className="py-4 hidden md:table-cell">
        <p className="font-medium text-gray-900">{service?.serviceName || 'Service'}</p>
        <p className="text-sm text-gray-500">{service?.category || ''}</p>
      </td>
      <td className="py-4 hidden lg:table-cell text-gray-600">
        <p>{appointment ? formatDate(appointment.appointmentDate) : '-'}</p>
        <p className="text-sm">{appointment ? formatTime(appointment.timeSlot) : ''}</p>
      </td>
      <td className="py-4 font-medium text-gray-900">{formatCurrency(transaction.amount, transaction.currency.toUpperCase())}</td>
      <td className="py-4">
        <Badge variant={getStatusBadgeClass(status)}>{getStatusLabel(status)}</Badge>
      </td>
      <td className="py-4 hidden lg:table-cell text-sm text-gray-500 font-mono">
        {transaction.stripeSessionId.slice(0, 20)}...
      </td>
      <td className="py-4 text-gray-600">{formatDate(transaction.createdAt)}</td>
    </tr>
  );
}

function TransactionRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4"><div className="h-5 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2 mt-1" /></td>
      <td className="py-4 hidden md:table-cell"><div className="h-5 bg-gray-200 rounded w-3/4" /><div className="h-4 bg-gray-200 rounded w-1/2 mt-1" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /><div className="h-3 bg-gray-200 rounded w-16 mt-1" /></td>
      <td className="py-4"><div className="h-5 bg-gray-200 rounded w-20" /></td>
      <td className="py-4"><div className="h-5 bg-gray-200 rounded w-20" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
      <td className="py-4"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    </tr>
  );
}

import { CheckCircle, XCircle } from 'lucide-react';
import { classNames } from '@/lib/utils';