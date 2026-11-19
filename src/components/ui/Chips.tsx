'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface ChipProps {
  label: string;
  onRemove?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'filled';
}

export function Chip({ label, onRemove, icon, disabled = false, className, variant = 'default' }: ChipProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    outline: 'bg-transparent text-gray-700 border border-gray-300',
    filled: 'bg-salon-600 text-white',
  };

  return (
    <span className={classNames(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors',
      variantStyles[variant],
      disabled && 'opacity-50 cursor-not-allowed',
      className
    )}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
      {onRemove && !disabled && (
        <button
          type="button"
          onClick={onRemove}
          className="flex-shrink-0 p-0.5 rounded hover:bg-black/10 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          </svg>
        </button>
      )}
    </span>
  );
}

interface ChipGroupProps {
  chips: Array<{ label: string; value: string; icon?: React.ReactNode }>;
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  className?: string;
}

export function ChipGroup({ chips, selected, onChange, multiple = true, className }: ChipGroupProps) {
  return (
    <div className={classNames('flex flex-wrap gap-2', className)} role="group" aria-label="Chip group">
      {chips.map(chip => (
        <Chip
          key={chip.value}
          label={chip.label}
          icon={chip.icon}
          variant={selected.includes(chip.value) ? 'filled' : 'outline'}
          onRemove={() => onChange(selected.filter(v => v !== chip.value))}
        />
      ))}
    </div>
  );
}

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  maxTags?: number;
  className?: string;
  error?: string;
}

export function TagInput({
  value,
  onChange,
  suggestions = [],
  placeholder = 'Add tags...',
  maxTags = 10,
  className,
  error,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const handleAddTag = () => {
    const tag = inputValue.trim();
    if (!tag) return;
    if (value.includes(tag)) return;
    if (maxTags && value.length >= maxTags) return;

    onChange([...value, tag]);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const filteredSuggestions = suggestions.filter(s => !value.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase()));

  return (
    <div className={classNames('w-full', className)}>
      <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-salon-500 focus-within:border-transparent">
        {value.map((tag, index) => (
          <Chip key={tag} label={tag} variant="filled" onRemove={() => onChange(value.filter((_, i) => i !== index))} />
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={value.length > 0 ? '' : placeholder}
          className="flex-1 min-w-[120px] px-2 py-1 text-sm border-none focus:outline-none"
          aria-label="Add tags"
        />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {filteredSuggestions.map(suggestion => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                onChange([...value, suggestion]);
                setInputValue('');
                setShowSuggestions(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface SelectTagsProps {
  options: Array<{ label: string; value: string }>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelections?: number;
  className?: string;
  error?: string;
}

export function SelectTags({
  options,
  value,
  onChange,
  placeholder = 'Select tags...',
  maxSelections,
  className,
  error,
}: SelectTagsProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
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

  const filteredOptions = options.filter(opt =>
    !value.includes(opt.value) &&
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (optionValue: string) => {
    if (maxSelections && value.length >= maxSelections) return;
    onChange([...value, optionValue]);
    setSearch('');
  };

  const handleRemove = (tagValue: string) => {
    onChange(value.filter(v => v !== tagValue));
  };

  return (
    <div className={classNames('w-full', className)} ref={dropdownRef}>
      <div
        className={classNames(
          'flex flex-wrap gap-2 p-2 border rounded-lg bg-white focus-within:ring-2 focus-within:ring-salon-500 focus-within:border-transparent',
          isOpen && 'ring-2 ring-salon-500'
        )}
        onClick={() => setIsOpen(true)}
      >
        {value.map(tag => {
          const option = options.find(o => o.value === tag);
          return (
            <Chip
              key={tag}
              label={option?.label || tag}
              variant="filled"
              onRemove={() => handleRemove(tag)}
            />
          );
        })}
        {isOpen && (
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={value.length > 0 ? '' : placeholder}
            className="flex-1 min-w-[120px] px-2 py-1 text-sm border-none focus:outline-none"
            autoFocus
          />
        )}
      </div>
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
          ) : (
            filteredOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}