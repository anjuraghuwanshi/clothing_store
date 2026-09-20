'use client'

import * as React from 'react'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface RatingProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rating value from 0 to `max`. Supports fractions (e.g. 4.5). */
  value: number
  max?: number
  /** Optional review count shown next to the stars. */
  count?: number
  size?: 'sm' | 'default' | 'lg'
  /** When set, stars become interactive and call this with the chosen value. */
  onRatingChange?: (value: number) => void
}

const starSize = {
  sm: 'size-3.5',
  default: 'size-4',
  lg: 'size-5',
} as const

function Rating({
  value,
  max = 5,
  count,
  size = 'default',
  onRatingChange,
  className,
  ...props
}: RatingProps) {
  const [hover, setHover] = React.useState<number | null>(null)
  const interactive = typeof onRatingChange === 'function'
  const display = hover ?? value

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Rate this product' : `Rated ${value} out of ${max}`}
      {...props}
    >
      <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
        {Array.from({ length: max }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, display - i))
          const StarIcon = (
            <span key={i} className="relative inline-flex">
              <Star className={cn(starSize[size], 'text-muted-foreground/40')} strokeWidth={1.5} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className={cn(starSize[size], 'fill-primary text-primary')}
                  strokeWidth={1.5}
                />
              </span>
            </span>
          )

          if (!interactive) return StarIcon

          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={Math.round(value) === i + 1}
              aria-label={`${i + 1} star${i === 0 ? '' : 's'}`}
              className="cursor-pointer rounded-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onMouseEnter={() => setHover(i + 1)}
              onClick={() => onRatingChange?.(i + 1)}
            >
              {StarIcon}
            </button>
          )
        })}
      </div>
      {typeof count === 'number' && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {value.toFixed(1)} ({count})
        </span>
      )}
    </div>
  )
}

export { Rating }
