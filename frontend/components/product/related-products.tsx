import * as React from 'react'
import { ProductCard } from '@/components/ui/product-card'
import { apiFetch } from '@/lib/apis/client'

export async function RelatedProducts({ productId }: { productId: string }) {
  let relatedProducts: any[] = []
  
  try {
    relatedProducts = await apiFetch(`/products/${productId}/related?limit=4`, { cache: 'no-store' })
  } catch (error) {
    console.error("Failed to fetch related products:", error)
  }

  if (!relatedProducts || relatedProducts.length === 0) {
    return null
  }

  return (
    <section className="border-t border-border mt-16">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <h2 className="font-serif text-2xl tracking-[0.15em] uppercase mb-10 text-center">
          You May Also Like
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {relatedProducts.map((product) => {
            const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url 
                                || product.images?.[0]?.image_url 
                                || "/placeholder.svg"

            const badges: Array<{ label: string; variant: any }> = []
            if (product.is_new_arrival) badges.push({ label: 'NEW', variant: 'accent' })
            if (product.is_best_seller) badges.push({ label: 'BEST SELLER', variant: 'solid' })
            if (product.compare_at_price > product.price) {
              badges.push({ label: `-${Math.round((1 - product.price / product.compare_at_price) * 100)}%`, variant: 'sale' })
            }

            return (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                compareAt={product.compare_at_price}
                image={primaryImage}
                rating={product.rating}
                reviewCount={product.review_count}
                badge={badges}
                href={`/products/${product.id}`}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
