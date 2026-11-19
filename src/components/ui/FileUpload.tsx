'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
  value?: File[];
  onRemove?: (index: number) => void;
  className?: string;
  dropzoneLabel?: string;
}

export function FileUpload({
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024,
  multiple = false,
  onFilesChange,
  value = [],
  onRemove,
  className,
  dropzoneLabel = 'Drag and drop files here, or click to select',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      if (maxSize && file.size > maxSize) {
        errors.push(`${file.name} exceeds maximum size of ${formatFileSize(maxSize)}`);
        return;
      }
      if (accept && !matchAccept(file, accept)) {
        errors.push(`${file.name} is not an accepted file type`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    const newFiles = multiple ? [...value, ...validFiles] : validFiles.slice(0, 1);
    onFilesChange(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else {
      const newFiles = [...value];
      newFiles.splice(index, 1);
      onFilesChange(newFiles);
    }
  };

  return (
    <div className={classNames('w-full', className)}>
      <div
        className={classNames(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          isDragging ? 'border-salon-500 bg-salon-50' : 'border-gray-300 hover:border-salon-400'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-1">{dropzoneLabel}</p>
          <p className="text-sm text-gray-500">
            {accept === 'image/*' ? 'PNG, JPG, WebP' : accept} • Max {formatFileSize(maxSize)}
          </p>
        </label>
      </div>

      {value.length > 0 && (
        <div className="mt-4 space-y-2">
          {value.map((file, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-salon-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-salon-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 18" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-gray-400 hover:text-red-600 transition-colors p-1"
                aria-label={`Remove ${file.name}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function matchAccept(file: File, accept: string): boolean {
  const acceptTypes = accept.split(',').map(t => t.trim());
  return acceptTypes.some(type => {
    if (type.endsWith('/*')) {
      return file.type.startsWith(type.slice(0, -1));
    }
    return file.type === type || file.name.endsWith(type);
  });
}