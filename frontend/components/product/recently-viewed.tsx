import * as React from 'react'
import { ProductCard } from '@/components/ui/product-card'

const MOCK_RECENT = [
  { id: 'recent_1', name: 'Merino Ribbed Knit', price: 145, compareAt: 210, image: '/product-knit.png', rating: 4.6, reviewCount: 212 },
  { id: 'recent_2', name: 'Structured Leather Tote', price: 340, image: '/product-tote.png', rating: 4.7, reviewCount: 41 },
]

export function RecentlyViewed() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <h2 className="font-serif text-2xl tracking-[0.15em] uppercase mb-10 text-center">
          Recently Viewed
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {MOCK_RECENT.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
              price={product.price}
              compareAt={product.compareAt}
              image={product.image}
              rating={product.rating}
              reviewCount={product.reviewCount}
              href={`/products/${product.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
