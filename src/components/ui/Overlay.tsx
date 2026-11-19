'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({ content, children, position = 'top', delay = 200, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowStyles = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  };

  return (
    <div className="relative inline-block" onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip}>
      {React.cloneElement(children, { onMouseEnter: showTooltip, onMouseLeave: hideTooltip, onFocus: showTooltip, onBlur: hideTooltip })}
      {isVisible && (
        <div
          className={classNames(
            'absolute z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded shadow-lg whitespace-nowrap animate-in fade-in-150 duration-150',
            positionStyles[position],
            className
          )}
        >
          {content}
          <div className={classNames('absolute w-0 h-0 border-4 border-transparent', arrowStyles[position])} />
        </div>
      )}
    </div>
  );
}

interface PopoverProps {
  trigger: React.ReactElement;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Popover({ trigger, content, position = 'bottom', className }: PopoverProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {React.cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        },
      })}
      {isOpen && (
        <div
          className={classNames(
            'absolute z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 animate-in fade-in-0 zoom-in-95',
            positionStyles[position],
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

interface AccordionProps {
  items: Array<{ title: string; content: React.ReactNode; disabled?: boolean }>;
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className }: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        if (!allowMultiple) next.clear();
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={classNames('space-y-2', className)}>
      {items.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => !item.disabled && toggleItem(index)}
            disabled={item.disabled}
            className={classNames(
              'w-full px-4 py-3 text-left font-medium flex items-center justify-between gap-4 transition-colors',
              item.disabled ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'hover:bg-gray-50'
            )}
            aria-expanded={openItems.has(index)}
            aria-controls={`accordion-content-${index}`}
          >
            {item.title}
            <svg
              className={classNames('w-5 h-5 text-gray-400 transition-transform', openItems.has(index) && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openItems.has(index) && (
            <div
              id={`accordion-content-${index}`}
              role="region"
              className="px-4 pb-4 text-gray-600 animate-in slide-in-from-top-2 duration-200"
            >
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}