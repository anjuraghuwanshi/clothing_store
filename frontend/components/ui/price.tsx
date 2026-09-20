import * as React from 'react'

import { cn } from '@/lib/utils'

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current price in the smallest sensible unit (major currency amount, e.g. 129 or 129.99). */
  amount: number
  /** Optional original price to show as struck-through when the item is on sale. */
  compareAt?: number
  /** Alternative prop for original price to prevent DOM leakage if passed */
  originalAmount?: number
  currency?: string
  locale?: string
  size?: 'sm' | 'default' | 'lg'
}

const sizeMap = {
  sm: 'text-sm',
  default: 'text-base',
  lg: 'text-xl',
} as const

function formatMoney(value: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
  }).format(value)
}

function Price({
  amount,
  compareAt,
  originalAmount,
  currency = 'INR',
  locale = 'en-IN',
  size = 'default',
  className,
  ...props
}: PriceProps) {
  const finalCompareAt = compareAt !== undefined ? compareAt : originalAmount
  const onSale = typeof finalCompareAt === 'number' && finalCompareAt > amount

  return (
    <div
      className={cn('flex items-baseline gap-2 tabular-nums', className)}
      {...props}
    >
      <span
        className={cn(
          'font-medium tracking-tight',
          sizeMap[size],
          onSale ? 'text-primary' : 'text-foreground',
        )}
      >
        {formatMoney(amount, currency, locale)}
      </span>
      {onSale && (
        <span
          className={cn(
            'text-muted-foreground line-through',
            size === 'lg' ? 'text-base' : 'text-xs',
          )}
        >
          {formatMoney(finalCompareAt as number, currency, locale)}
        </span>
      )}
    </div>
  )
}

export { Price }
