'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface BreadcrumbProps {
  items: Array<{ label: string; href?: string; current?: boolean }>;
  separator?: React.ReactNode;
  className?: string;
}

export function Breadcrumb({ items, separator = '/', className }: BreadcrumbProps) {
  return (
    <nav className={classNames('flex items-center gap-1 text-sm', className)} aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && <span className="text-gray-400">{separator}</span>}
            {item.href && !item.current ? (
              <a href={item.href} className="text-gray-500 hover:text-gray-700 transition-colors">
                {item.label}
              </a>
            ) : (
              <span className={classNames('font-medium', item.current ? 'text-gray-900' : 'text-gray-500')}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  maxVisiblePages?: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  const half = Math.floor(maxVisiblePages / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, currentPage + half);

  if (end - start + 1 < maxVisiblePages) {
    if (start === 1) {
      end = Math.min(totalPages, start + maxVisiblePages - 1);
    } else if (end === totalPages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }
  }

  if (showFirstLast && start > 1) {
    pages.push(1);
    if (start > 2) pages.push('ellipsis');
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (showFirstLast && end < totalPages) {
    if (end < totalPages - 1) pages.push('ellipsis');
    pages.push(totalPages);
  }

  return (
    <nav className={classNames('flex items-center justify-center gap-1', className)} aria-label="Pagination">
      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          aria-label="Previous page"
        >
          ← Prev
        </button>
      )}

      {pages.map((page, index) =>
        page === 'ellipsis' ? (
          <span key={index} className="px-2 text-gray-400">...</span>
        ) : (
          <button
            key={index}
            onClick={() => onPageChange(page)}
            className={classNames(
              'px-3 py-1.5 text-sm rounded-lg transition-colors',
              page === currentPage
                ? 'bg-salon-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      {showPrevNext && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          aria-label="Next page"
        >
          Next →
        </button>
      )}
    </nav>
  );
}

interface TabProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode; disabled?: boolean }>;
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'line' | 'pills' | 'enclosed';
}

export function Tab({ tabs, activeTab, onChange, className, variant = 'line' }: TabProps) {
  const variantClasses = {
    line: 'border-b border-gray-200',
    pills: '',
    enclosed: 'bg-gray-100 rounded-lg p-1',
  };

  const tabClasses = (isActive: boolean, disabled: boolean) => {
    const base = 'flex items-center gap-2 px-4 py-2 font-medium text-sm transition-all';
    if (disabled) return `${base} text-gray-400 cursor-not-allowed`;

    switch (variant) {
      case 'line':
        return `${base} ${isActive ? 'text-salon-600 border-b-2 border-salon-600' : 'text-gray-500 hover:text-gray-700'}`;
      case 'pills':
        return `${base} rounded-lg ${isActive ? 'bg-salon-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`;
      case 'enclosed':
        return `${base} rounded-md ${isActive ? 'bg-white text-salon-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`;
    }
  };

  return (
    <div className={classNames(variantClasses[variant], className)} role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          id={`${tab.id}-trigger`}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          className={tabClasses(activeTab === tab.id, tab.disabled)}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className }: TabPanelProps) {
  return (
    <div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-trigger`} className={className}>
      {children}
    </div>
  );
}