'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface QuantitySelectorProps {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
  size?: 'sm' | 'default'
  className?: string
}

function QuantitySelector({
  value: controlled,
  defaultValue = 1,
  min = 1,
  max = 99,
  onChange,
  size = 'default',
  className,
}: QuantitySelectorProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? controlled : internal

  const set = (next: number) => {
    const clamped = Math.max(min, Math.min(max, next))
    if (!isControlled) setInternal(clamped)
    onChange?.(clamped)
  }

  const btn =
    'flex items-center justify-center text-foreground transition-colors hover:bg-foreground hover:text-background disabled:pointer-events-none disabled:opacity-30 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
  const dim = size === 'sm' ? 'size-8' : 'size-11'

  return (
    <div
      className={cn(
        'inline-flex items-center border border-border bg-card',
        className,
      )}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className={cn(btn, dim)}
        onClick={() => set(value - 1)}
        disabled={value <= min}
      >
        <Minus className="size-4" strokeWidth={1.5} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label="Quantity"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ''), 10)
          if (!Number.isNaN(n)) set(n)
          else if (e.target.value === '') set(min)
        }}
        className={cn(
          'h-full w-10 border-x border-border bg-transparent text-center text-sm font-medium tabular-nums outline-none',
          size === 'sm' ? 'py-1.5' : 'py-3',
        )}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        className={cn(btn, dim)}
        onClick={() => set(value + 1)}
        disabled={value >= max}
      >
        <Plus className="size-4" strokeWidth={1.5} />
      </button>
    </div>
  )
}

export { QuantitySelector }
