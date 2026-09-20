'use client'

import * as React from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/ui/product-card'
import { Button } from '@/components/ui/button'
import { useWishlist } from '@/components/wishlist-provider'
import { useCart } from '@/components/cart-provider'

export default function WishlistPage() {
  const { items } = useWishlist()
  const { addToCart } = useCart()
  
  // Hydration safety since we rely on localStorage
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
           <div className="animate-pulse flex gap-2 items-center">
             <div className="w-4 h-4 bg-foreground/20 rounded-full" />
             <div className="w-4 h-4 bg-foreground/20 rounded-full" />
             <div className="w-4 h-4 bg-foreground/20 rounded-full" />
           </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
              <h1 className="font-serif text-3xl md:text-5xl text-foreground">Your wishlist is waiting</h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-md">
                Save your favorite styles here and come back to them anytime.
              </p>
              <Button asChild className="mt-4 text-xs tracking-widest uppercase px-8 h-12">
                <a href="/">Continue Shopping</a>
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-10 flex flex-col gap-3">
                <h1 className="font-serif text-4xl leading-tight md:text-5xl">
                  Wishlist
                </h1>
                <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
                {items.map((p) => (
                  <ProductCard 
                    key={p.id} 
                    {...p} 
                    showAddToCart={true}
                    onAddToCart={() => {
                      // Wishlist doesn't store size/color, so we must redirect to the product page 
                      // instead of sending a fake UUID to the backend.
                      window.location.href = `/products/${p.id}`
                    }}
                  />
                ))}
              </div>
            </>
          )}

        </section>
      </main>

      <Footer />
    </div>
  )
}
