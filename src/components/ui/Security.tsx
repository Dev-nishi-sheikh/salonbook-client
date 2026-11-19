'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface PasswordStrengthProps {
  password: string;
  showMeter?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export function PasswordStrength({
  password,
  showMeter = true,
  showRequirements = true,
  className,
}: PasswordStrengthProps) {
  const requirements = [
    { label: 'At least 8 characters', test: password.length >= 8 },
    { label: 'One uppercase letter', test: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', test: /[a-z]/.test(password) },
    { label: 'One number', test: /[0-9]/.test(password) },
    { label: 'One special character', test: /[^A-Za-z0-9]/.test(password) },
  ];

  const passedCount = requirements.filter(r => r.test).length;
  const strength = passedCount <= 1 ? 'weak' : passedCount <= 3 ? 'fair' : passedCount <= 4 ? 'good' : 'strong';

  const strengthStyles = {
    weak: { label: 'Weak', color: 'bg-red-500', width: '20%' },
    fair: { label: 'Fair', color: 'bg-yellow-500', width: '40%' },
    good: { label: 'Good', color: 'bg-blue-500', width: '60%' },
    strong: { label: 'Strong', color: 'bg-green-500', width: '80%' },
    veryStrong: { label: 'Very Strong', color: 'bg-green-600', width: '100%' },
  };

  const currentStrength = strength === 'weak' ? 'weak' : strength === 'fair' ? 'fair' : strength === 'good' ? 'good' : 'strong';

  return (
    <div className={classNames('space-y-2', className)}>
      {showMeter && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={classNames('h-full rounded-full transition-all duration-300', strengthStyles[currentStrength].color)}
            style={{ width: strengthStyles[currentStrength].width }}
          />
        </div>
      )}
      {showMeter && (
        <p className="text-xs font-medium text-gray-600">
          Strength: <span className={classNames('font-medium', strengthStyles[currentStrength].color.replace('bg-', 'text-'))}>
            {strengthStyles[currentStrength].label}
          </span>
        </p>
      )}
      {showRequirements && (
        <ul className="space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <span className={classNames('w-4 h-4 rounded border-2 flex items-center justify-center', req.test ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-gray-400')}>
                {req.test && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
              </span>
              <span className={classNames(req.test ? 'text-green-600' : 'text-gray-500')}>{req.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
}: OtpInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.replace(/[^0-9]/g, '');
    if (newValue.length > 1) return;

    const newValues = value.split('');
    newValues[index] = newValue;
    const joined = newValues.join('');
    onChange(joined);

    if (newValue && index < length - 1) {
      refs.current[index + 1]?.focus();
    } else if (!newValue && index > 0) {
      refs.current[index - 1]?.focus();
    }

    if (joined.length === length) {
      onComplete?.(joined);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length);
    const newValues = pasted.split('').concat(Array(length - pasted.length).fill(''));
    onChange(newValues.join(''));
    if (pasted.length === length) {
      onComplete?.(pasted);
    }
    refs.current[pasted.length]?.focus();
  };

  return (
    <div className={classNames('flex items-center gap-2', className)} role="group" aria-label="One-time password">
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={el => { refs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ''}
          onChange={e => handleChange(index, e)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoComplete="one-time-code"
          className={classNames(
            'w-10 h-10 text-center text-xl font-mono rounded-lg border transition-colors',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-salon-500 focus:ring-salon-500',
            disabled ? 'bg-gray-100 cursor-not-allowed' : ''
          )}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}