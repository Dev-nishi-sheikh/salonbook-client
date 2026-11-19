'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, error, helperText, required, children, className }: FormFieldProps) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label className={classNames('block text-sm font-medium text-gray-700 mb-1.5', required && 'after:content-["*"] after:text-red-500 after:ml-0.5')}>
          {label}
        </label>
      )}
      <div>{children}</div>
      {error && <p className="mt-1.5 text-sm text-red-600" role="alert">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
}

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export function Checkbox({ label, description, className, id, ...props }: CheckboxProps) {
  const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={classNames('flex items-start gap-3', className)}>
      <input
        type="checkbox"
        id={checkboxId}
        className="w-4 h-4 mt-0.5 text-salon-600 border-gray-300 rounded focus:ring-salon-500 focus:ring-2"
        {...props}
      />
      <div>
        <label htmlFor={checkboxId} className="text-sm font-medium text-gray-900 cursor-pointer">
          {label}
        </label>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

interface RadioGroupProps {
  name: string;
  options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  inline?: boolean;
}

export function RadioGroup({ name, options, value, onChange, label, required, className, inline = false }: RadioGroupProps) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label className={classNames('block text-sm font-medium text-gray-700 mb-2', required && 'after:content-["*"] after:text-red-500 after:ml-0.5')}>
          {label}
        </label>
      )}
      <div className={classNames(inline ? 'flex flex-wrap gap-6' : 'space-y-2')}>
        {options.map(option => (
          <label key={option.value} className={classNames('flex items-center gap-2 cursor-pointer', option.disabled && 'opacity-50 cursor-not-allowed')}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => !option.disabled && onChange(option.value)}
              disabled={option.disabled}
              className="w-4 h-4 text-salon-600 border-gray-300 focus:ring-salon-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">{option.label}</span>
              {option.description && <p className="text-xs text-gray-500">{option.description}</p>}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export function Switch({ label, description, className, id, ...props }: SwitchProps) {
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : 'switch');

  return (
    <div className={classNames('flex items-center gap-3', className)}>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={switchId}
          className="sr-only peer"
          {...props}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-salon-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-salon-600"></div>
      </label>
      {label && (
        <div>
          <span className="text-sm font-medium text-gray-900">{label}</span>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      )}
    </div>
  );
}