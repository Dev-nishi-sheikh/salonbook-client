'use client';

import React from 'react';
import { classNames } from '@/lib/utils';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export function Image({ src, alt, fallback, loading = 'lazy', objectFit = 'cover', className, ...props }: ImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleError = () => {
    if (fallback && !hasError) {
      setImageSrc(fallback);
      setHasError(true);
    } else {
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={classNames('relative overflow-hidden', className)}>
      {!hasError && isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        style={{ objectFit }}
        className={classNames('w-full h-full transition-opacity duration-300', hasError ? 'opacity-50' : '', isLoading && !hasError ? 'invisible' : 'visible')}
        {...props}
      />
      {hasError && fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <span className="text-sm">Image unavailable</span>
        </div>
      )}
    </div>
  );
}

interface ImageGalleryProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  className?: string;
}

export function ImageGallery({ images, currentIndex, onIndexChange, className }: ImageGalleryProps) {
  return (
    <div className={classNames('relative', className)}>
      <div className="aspect-video overflow-hidden rounded-lg">
        <Image src={images[currentIndex]} alt={`Image ${currentIndex + 1}`} objectFit="cover" />
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={classNames(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-salon-600' : 'bg-gray-300 hover:bg-gray-400'
              )}
              aria-label={`Go to image ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : 'false'}
            />
          ))}
        </div>
      )}
      {images.length > 1 && (
        <>
          <button
            onClick={() => onIndexChange((currentIndex - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => onIndexChange((currentIndex + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors shadow"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}

interface AvatarImageProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}

export function AvatarImage({ src, alt, name, size = 'md', className, fallback }: AvatarImageProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const initials = name
    ?.split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={classNames('relative inline-flex shrink-0 overflow-hidden rounded-full bg-salon-100', sizeClasses[size], className)}>
      {src ? (
        <Image src={src} alt={alt || name || 'Avatar'} fallback={fallback} className="w-full h-full object-cover" />
      ) : (
        <span className="flex items-center justify-center w-full h-full text-salon-600 font-medium">
          {initials || '?'}
        </span>
      )}
    </div>
  );
}