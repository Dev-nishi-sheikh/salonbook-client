'use client';

import React, { useEffect, Fragment } from 'react';
import { X } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <Fragment>
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div
            className="modal-overlay"
            aria-hidden="true"
            onClick={closeOnOverlayClick ? onClose : undefined}
          />
          
          <div
            className={classNames(
              'modal-content',
              sizes[size]
            )}
          >
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-6 border-b border-warm-gray-100">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-heading-md font-semibold text-charcoal-900">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p id="modal-description" className="text-body-sm text-warm-gray-500 mt-1">
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-warm-gray-400 hover:text-warm-gray-600 transition-colors p-1 rounded-xl hover:bg-warm-gray-100"
                    aria-label="Close modal"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            )}
            
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}