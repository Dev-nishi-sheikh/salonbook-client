'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface TableProps<T> {
  columns: Array<{
    key: string;
    header: string;
    render?: (item: T, index: number) => React.ReactNode;
    className?: string;
  }>;
  data: T[];
  keyExtractor: (item: T) => string;
  striped?: boolean;
  hoverable?: boolean;
  bordered?: boolean;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  striped = true,
  hoverable = true,
  bordered = false,
  emptyMessage = 'No data available',
  className,
  rowClassName,
}: TableProps<T>) {
  return (
    <div className={classNames('overflow-x-auto', className)}>
      {data.length > 0 ? (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 font-medium border-b border-gray-100">
              {columns.map(column => (
                <th key={column.key} className={classNames('pb-3 pr-4', column.className)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item)}
                className={classNames(
                  striped && index % 2 === 1 ? 'bg-gray-50' : '',
                  hoverable ? 'hover:bg-gray-50' : '',
                  rowClassName?.(item, index)
                )}
              >
                {columns.map(column => (
                  <td key={column.key} className={classNames('py-4 pr-4', column.className)}>
                    {column.render ? column.render(item, index) : String((item as any)[column.key] || '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
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