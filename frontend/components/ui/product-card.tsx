'use client'

import * as React from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Price } from '@/components/ui/price'
import { Rating } from '@/components/ui/rating'
import { ProductBadge, type ProductBadgeProps } from '@/components/ui/product-badge'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/components/wishlist-provider'

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string
  name: string
  category?: string
  image: string
  /** Optional second image shown on hover. */
  hoverImage?: string
  price: number
  compareAt?: number
  currency?: string
  rating?: number
  reviewCount?: number
  badge?: { label: string; variant?: ProductBadgeProps['variant'] } | Array<{ label: string; variant?: ProductBadgeProps['variant'] }>
  href?: string
  showAddToCart?: boolean
  onAddToCart?: () => void
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      id,
      name,
      category,
      image,
      hoverImage,
      price,
      compareAt,
      currency,
      rating,
      reviewCount,
      badge,
      href = '#',
      showAddToCart = false,
      onAddToCart,
      className,
      ...props
    },
    ref,
  ) => {
    // Generate an ID if not provided, for wishlist use
    const productId = id || href || name
    
    // Safely use context (will return undefined if not in provider, but layout wraps the whole app)
    let wishlistCtx = null
    try {
      wishlistCtx = useWishlist()
    } catch (e) {
      // Fallback if rendered outside provider (e.g. testing)
    }
    
    const isWished = wishlistCtx?.isInWishlist(productId) || false

    const handleWishlistToggle = (e: React.MouseEvent) => {
      e.preventDefault()
      if (wishlistCtx) {
        wishlistCtx.toggleWishlist({
          id: productId,
          name,
          price,
          compareAt,
          image,
          category,
          rating,
          reviewCount,
          badge: Array.isArray(badge) ? badge[0] : badge, // wishlist badge fallback
          href
        })
      }
    }

    const badgesToRender = badge ? (Array.isArray(badge) ? badge : [badge]) : []

    return (
      <div ref={ref} className={cn('group flex flex-col', className)} {...props}>
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
          <a href={href} aria-label={name} className="block h-full w-full">
            <Image
              src={image || '/placeholder.svg'}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-opacity duration-500',
                hoverImage && 'group-hover:opacity-0',
              )}
            />
            {hoverImage && (
              <Image
                src={hoverImage || '/placeholder.svg'}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </a>

          {badgesToRender.length > 0 && (
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 items-start">
              {badgesToRender.map((b, i) => (
                <ProductBadge key={i} variant={b.variant}>{b.label}</ProductBadge>
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isWished}
            onClick={handleWishlistToggle}
            className="absolute right-3 top-3 flex size-9 items-center justify-center bg-card/80 text-foreground opacity-100 md:opacity-0 transition-opacity hover:bg-card focus-visible:opacity-100 group-hover:opacity-100"
          >
            <Heart
              className={cn('size-4', isWished && 'fill-primary text-primary')}
              strokeWidth={1.5}
            />
          </button>
        </div>

        <div className="flex flex-col gap-1.5 pt-4">
          {category && (
            <span className="text-[0.625rem] uppercase tracking-[0.14em] text-muted-foreground">
              {category}
            </span>
          )}
          <a
            href={href}
            className="text-sm font-medium text-foreground transition-colors hover:text-primary"
          >
            {name}
          </a>
          {typeof rating === 'number' && (
            <Rating value={rating} count={reviewCount} size="sm" />
          )}
          <Price
            amount={price}
            compareAt={compareAt}
            currency={currency}
            className="pt-0.5"
          />
          
          {showAddToCart && (
            <Button 
              className="mt-2 w-full text-xs tracking-widest uppercase bg-foreground hover:bg-primary"
              onClick={onAddToCart}
            >
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    )
  },
)
ProductCard.displayName = 'ProductCard'

export { ProductCard }
