import * as React from 'react'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

export interface CategoryCardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  title: string
  audience?: string
  offer?: string
  image: string
  href?: string
  /** Aspect ratio of the media. */
  ratio?: 'portrait' | 'square' | 'landscape'
}

const ratioMap = {
  portrait: 'aspect-[3/4]',
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
} as const

const CategoryCard = React.forwardRef<HTMLAnchorElement, CategoryCardProps>(
  ({ title, audience, offer, image, href = '#', ratio = 'portrait', className, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          'group relative block overflow-hidden bg-secondary',
          ratioMap[ratio],
          className,
        )}
        {...props}
      >
        <Image
          src={image || '/placeholder.svg'}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90"
          aria-hidden="true"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 transition-all duration-300">
          <div className="flex flex-col gap-1 transform transition-transform duration-300 group-hover:-translate-y-2">
            {audience && (
              <span className="text-[0.625rem] uppercase tracking-[0.16em] text-white/80">
                {audience}
              </span>
            )}
            <h3 className="font-serif text-2xl leading-tight text-white">{title}</h3>
            {offer && (
              <span className="mt-1 text-sm font-medium text-white/90">
                {offer}
              </span>
            )}
          </div>
          
          <div className="mt-2 flex items-center gap-2 opacity-100 transform translate-y-0 md:opacity-0 md:translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 text-white">
            <span className="text-sm font-semibold uppercase tracking-wider">Shop Now</span>
            <ArrowRight className="size-4" strokeWidth={2} />
          </div>
        </div>
      </a>
    )
  },
)
CategoryCard.displayName = 'CategoryCard'

export { CategoryCard }
