'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface DropdownProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
    danger?: boolean;
  }>;
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({ trigger, items, align = 'right', className }: DropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={classNames('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {isOpen && (
        <div
          className={classNames(
            'absolute z-50 mt-2 min-w-[180px] bg-white rounded-sm shadow-medium border border-warm-gray-200 py-1',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onClick={(e) => {
                if (!item.href) e.preventDefault();
                if (item.onClick) item.onClick();
                if (!item.disabled) setIsOpen(false);
              }}
              className={classNames(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                item.disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50',
                item.danger && !item.disabled ? 'text-red-600 hover:bg-red-50' : ''
              )}
              style={{ pointerEvents: item.disabled ? 'none' : 'auto' }}
            >
              {item.icon && <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

interface TabsProps {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode; disabled?: boolean }>;
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'line' | 'pills' | 'enclosed';
}

export function Tabs({ tabs, activeTab, onChange, className, variant = 'line' }: TabsProps) {
  const variantClasses = {
    line: 'border-b border-gray-200',
    pills: '',
    enclosed: 'bg-gray-100 rounded-lg p-1',
  };

  const tabClasses = (isActive: boolean, disabled?: boolean) => {
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
          disabled={!!tab.disabled}
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