'use client';

import { UtensilsCrossed } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  imageData?: string | null;
  alt: string;
  className?: string;
  iconClassName?: string;
}

export function ProductImage({ imageData, alt, className, iconClassName }: ProductImageProps) {
  if (imageData) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageData} alt={alt} className={cn('h-full w-full object-cover', className)} />
    );
  }

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-2 bg-black/25 text-muted',
        className
      )}
    >
      <UtensilsCrossed className={cn('h-12 w-12 opacity-40', iconClassName)} />
      <span className="text-xs opacity-70">Sin imagen</span>
    </div>
  );
}
