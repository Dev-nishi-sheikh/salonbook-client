'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={classNames(
            'textarea',
            error && 'input-error',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="error-text" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${textareaId}-helper`} className="helper-text">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';