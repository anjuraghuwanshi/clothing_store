'use client'

import React, { useState, useEffect } from 'react'
import { apiFetch } from '@/lib/apis/client'
import { ProductCard } from '@/components/ui/product-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function FeaturedCarousel() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Responsive cards to show
  const [cardsToShow, setCardsToShow] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setCardsToShow(1)
      else if (window.innerWidth < 1024) setCardsToShow(2)
      else setCardsToShow(4)
    }
    
    handleResize() // init
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        // Fetch all active + featured products
        const data = await apiFetch(`/products/?featured=true&limit=100`)
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch featured products", error)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="aspect-[3/4] bg-muted/50 rounded-md" />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No featured products at the moment.
      </div>
    )
  }

  const maxIndex = Math.max(0, products.length - cardsToShow)

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex))
  }

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  const showControls = products.length > cardsToShow

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out gap-4"
          style={{ 
            transform: `translateX(calc(-${currentIndex * (100 / cardsToShow)}% - ${currentIndex * (16 / cardsToShow)}px))` 
          }}
        >
          {products.map(product => {
            // Map the product to ProductCard format
            const image = product.images?.[0]?.image_url || '/placeholder.svg'
            
            const badges: Array<{ label: string; variant: 'outline' | 'accent' | 'sale' | 'solid' | 'muted' | 'soldout' | null }> = []
            
            if (product.is_new_arrival) {
              badges.push({ label: 'NEW', variant: 'accent' as const })
            }
            if (product.is_best_seller) {
              badges.push({ label: 'BEST SELLER', variant: 'solid' as const })
            }
            if (product.compare_at_price > product.price) {
              const discount = Math.round((1 - product.price / product.compare_at_price) * 100)
              badges.push({ label: `-${discount}%`, variant: 'sale' as const })
            }

            return (
              <div 
                key={product.id} 
                className="shrink-0"
                style={{ width: `calc((100% - ${(cardsToShow - 1) * 16}px) / ${cardsToShow})` }}
              >
                <ProductCard
                  id={product.id}
                  name={product.name}
                  category={product.category?.name || 'Category'}
                  image={image}
                  price={product.price}
                  compareAt={product.compare_at_price}
                  rating={4.8} // Using static until review system is built
                  reviewCount={Math.floor(Math.random() * 100) + 10}
                  badge={badges}
                  href={`/products/${product.id}`}
                />
              </div>
            )
          })}
        </div>
      </div>

      {showControls && (
        <>
          <button 
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className="absolute left-0 top-[40%] -translate-y-1/2 -translate-x-4 size-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
          >
            <ChevronLeft className="size-5" />
          </button>
          
          <button 
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
            className="absolute right-0 top-[40%] -translate-y-1/2 translate-x-4 size-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-all z-10"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  )
}
