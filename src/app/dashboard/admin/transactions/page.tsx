'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, CreditCard, DollarSign, Loader2, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { api } from '@/lib/api';
import { Transaction, type TransactionStatus as TransactionStatusType } from '@/types';
import { formatCurrency, formatDate, formatTime, getStatusBadgeClass, getStatusLabel, classNames } from '@/lib/utils';

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

  const statCards = [
    { title: 'Total Transactions', value: stats.total, icon: CreditCard, color: 'bg-blue-50 text-blue-600' },
    { title: 'Successful', value: stats.paid, icon: CheckCircle, color: 'bg-green-50 text-green-600' },
    { title: 'Failed', value: stats.failed, icon: XCircle, color: 'bg-red-50 text-red-600' },
    { title: 'Total Revenue', value: formatCurrency(stats.totalAmount), icon: DollarSign, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="w-full">

      <div className="w-full">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-charcoal-900 font-display">Transactions</h1>
            <p className="text-warm-gray-600 mt-1">View and monitor all payment transactions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map(stat => (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-body-sm text-warm-gray-500">{stat.title}</p>
                      <p className="text-heading-xl font-bold text-charcoal-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={classNames('w-12 h-12 rounded-2xl flex items-center justify-center', stat.color)}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[250px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-warm-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by customer, service, or session ID..."
                className="input pl-10"
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
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th className="hidden md:table-cell">Service</th>
                      <th className="hidden lg:table-cell">Appointment</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th className="hidden lg:table-cell">Session ID</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-gray-100">
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
                <CreditCard className="h-16 w-16 text-warm-gray-300 mx-auto mb-4" />
                <h3 className="text-heading-md font-medium text-charcoal-900 mb-2">No transactions found</h3>
                <p className="text-warm-gray-500 mb-6">No payment transactions recorded yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    </div>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const customer = transaction.customerId as any;
  const appointment = transaction.appointmentId as any;
  const service = appointment?.serviceId as any;
  const status = transaction.status as TransactionStatusType;

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
        <p>{appointment ? formatDate(appointment.appointmentDate) : '-'}</p>
        <p className="text-body-sm">{appointment ? formatTime(appointment.timeSlot) : ''}</p>
      </td>
      <td className="py-4 font-medium text-charcoal-900">{formatCurrency(transaction.amount, transaction.currency.toUpperCase())}</td>
      <td className="py-4">
        <Badge variant={getStatusBadgeClass(status)}>{getStatusLabel(status)}</Badge>
      </td>
      <td className="py-4 hidden lg:table-cell text-body-sm text-warm-gray-500 font-mono">
        {transaction.stripeSessionId.slice(0, 20)}...
      </td>
      <td className="py-4 text-warm-gray-600">{formatDate(transaction.createdAt)}</td>
    </tr>
  );
}

function TransactionRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="py-4"><div className="h-5 bg-warm-gray-200 rounded w-3/4" /><div className="h-4 bg-warm-gray-200 rounded w-1/2 mt-1" /></td>
      <td className="py-4 hidden md:table-cell"><div className="h-5 bg-warm-gray-200 rounded w-3/4" /><div className="h-4 bg-warm-gray-200 rounded w-1/2 mt-1" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-24" /><div className="h-3 bg-warm-gray-200 rounded w-16 mt-1" /></td>
      <td className="py-4"><div className="h-5 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4"><div className="h-5 bg-warm-gray-200 rounded w-20" /></td>
      <td className="py-4 hidden lg:table-cell"><div className="h-4 bg-warm-gray-200 rounded w-24" /></td>
      <td className="py-4"><div className="h-4 bg-warm-gray-200 rounded w-24" /></td>
    </tr>
  );
}