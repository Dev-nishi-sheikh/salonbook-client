import { format, formatDistanceToNow, parseISO } from 'date-fns';
import type { AppointmentStatus, PaymentStatus, ServiceStatus, TransactionStatus, Appointment } from '@/types';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string, pattern = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateString), pattern);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
  } catch {
    return dateString;
  }
}

export function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch {
    return timeString;
  }
}

export function getRelativeTime(dateString: string): string {
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeClass(status: AppointmentStatus | PaymentStatus | ServiceStatus | TransactionStatus): 'default' | 'pending' | 'confirmed' | 'cancelled' | 'unpaid' | 'paid' | 'active' | 'inactive' {
  switch (status) {
    case 'pending':
      return 'pending';
    case 'confirmed':
    case 'paid':
    case 'active':
      return 'confirmed';
    case 'cancelled':
    case 'failed':
    case 'inactive':
      return 'cancelled';
    case 'unpaid':
      return 'unpaid';
    default:
      return 'default';
  }
}

export function getStatusLabel(status: AppointmentStatus | PaymentStatus | ServiceStatus | TransactionStatus): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    unpaid: 'Unpaid',
    paid: 'Paid',
    active: 'Active',
    inactive: 'Inactive',
    failed: 'Failed',
  };
  return labels[status] || status;
}

export function canCancelAppointment(appointment: Appointment): boolean {
  return appointment.status === 'pending';
}

export function canPayForAppointment(appointment: Appointment): boolean {
  return appointment.status === 'confirmed' && appointment.paymentStatus === 'unpaid';
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}