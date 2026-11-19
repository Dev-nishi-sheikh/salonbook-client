'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  minDate?: string;
  maxDate?: string;
  showTime?: boolean;
}

export function DatePicker({ label, error, minDate, maxDate, showTime, className, id, ...props }: DatePickerProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        type={showTime ? 'datetime-local' : 'date'}
        id={inputId}
        min={minDate}
        max={maxDate}
        className={classNames(
          'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-salon-500 focus:border-transparent',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface TimePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  step?: number;
}

export function TimePicker({ label, error, step = 30, className, id, ...props }: TimePickerProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        type="time"
        id={inputId}
        step={step * 60}
        className={classNames(
          'w-full px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-salon-500 focus:border-transparent',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface DateRangePickerProps {
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  label?: string;
  error?: string;
  minDate?: string;
  maxDate?: string;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  label,
  error,
  minDate,
  maxDate,
  className,
}: DateRangePickerProps) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <input
          type="date"
          value={startDate || ''}
          onChange={e => onChange(e.target.value, endDate)}
          min={minDate}
          max={endDate || maxDate}
          className={classNames(
            'px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-salon-500',
          )}
          placeholder="Start date"
        />
        <input
          type="date"
          value={endDate || ''}
          onChange={e => onChange(startDate, e.target.value)}
          min={startDate || minDate}
          max={maxDate}
          className={classNames(
            'px-4 py-2.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-salon-500',
          )}
          placeholder="End date"
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export function TimeSlotPicker({
  label,
  error,
  value,
  onChange,
  disabledSlots = [],
  className,
}: {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
  disabledSlots?: string[];
  className?: string;
}) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
        {TIME_SLOTS.map(slot => (
          <button
            key={slot}
            type="button"
            onClick={() => !disabledSlots.includes(slot) && onChange(slot)}
            disabled={disabledSlots.includes(slot)}
            className={classNames(
              'px-3 py-2 text-sm font-medium rounded-lg border transition-all',
              value === slot
                ? 'bg-salon-600 text-white border-salon-600'
                : disabledSlots.includes(slot)
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-salon-400'
            )}
          >
            {slot}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}