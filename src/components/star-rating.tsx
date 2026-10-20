
'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}

export function StarRating({
  rating,
  size = 16,
  className,
  onRatingChange,
  interactive = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const effectiveRating = hoverRating || rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            'transition-colors',
            effectiveRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300',
            interactive ? 'cursor-pointer' : ''
          )}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      ))}
    </div>
  );
}
