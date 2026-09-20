import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-none px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em] leading-none',
  {
    variants: {
      variant: {
        /* filled caramel — for "New" */
        accent: 'bg-primary text-primary-foreground',
        /* solid charcoal — for "Bestseller" */
        solid: 'bg-foreground text-background',
        /* outline — quiet default */
        outline: 'border border-foreground/60 text-foreground',
        /* muted — soft neutral */
        muted: 'bg-secondary text-muted-foreground',
        /* sale — subtle destructive */
        sale: 'bg-destructive text-destructive-foreground',
        /* sold out */
        soldout: 'border border-muted-foreground/40 text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'accent',
    },
  },
)

export interface ProductBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function ProductBadge({ className, variant, ...props }: ProductBadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { ProductBadge, badgeVariants }
