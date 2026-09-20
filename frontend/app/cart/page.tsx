'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Trash2, Heart, Plus, Minus } from 'lucide-react'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-provider'
import { useWishlist } from '@/components/wishlist-provider'
import { Price } from '@/components/ui/price'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart()
  const { toggleWishlist } = useWishlist()
  
  // Hydration safety since we rely on localStorage
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const deliveryCharge = items.length > 0 ? (cartTotal > 150 ? 0 : 15) : 0
  const total = cartTotal + deliveryCharge
  const freeShippingThreshold = 150
  const amountForFreeShipping = freeShippingThreshold - cartTotal

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
              <h1 className="font-serif text-3xl md:text-5xl text-foreground">Your bag is empty</h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-md">
                Discover something you'll love.
              </p>
              <Button asChild className="mt-4 text-xs tracking-widest uppercase px-8 h-12 bg-foreground hover:bg-primary">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
              
              {/* Left Side: Cart Items */}
              <div className="flex-1">
                <div className="mb-10 flex flex-col gap-3">
                  <h1 className="font-serif text-3xl leading-tight md:text-4xl">
                    Your Shopping Bag
                  </h1>
                  <p className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                
                <div className="flex flex-col gap-8 border-t border-border pt-8">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 sm:gap-6">
                      <div className="relative aspect-[3/4] w-24 sm:w-32 md:w-40 bg-secondary shrink-0 overflow-hidden">
                        <Link href={`/products/${item.productId}`}>
                          <Image
                            src={item.image || '/placeholder.svg'}
                            alt={item.name}
                            fill
                            className="object-cover transition-opacity hover:opacity-80"
                          />
                        </Link>
                      </div>
                      
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <Link href={`/products/${item.productId}`} className="text-sm sm:text-base font-medium text-foreground hover:text-primary transition-colors">
                              {item.name}
                            </Link>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {item.color} / {item.size}
                            </p>
                          </div>
                          <Price amount={item.price} className="text-sm sm:text-base" />
                        </div>
                        
                        <div className="mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center border border-border h-10 w-28">
                            <button
                              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="flex-1 text-center text-xs font-medium">{item.quantity}</span>
                            <button
                              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              aria-label="Increase quantity"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs uppercase tracking-widest text-muted-foreground font-medium">
                            <button 
                              onClick={() => {
                                removeFromCart(item.id)
                                toggleWishlist({
                                  id: item.productId,
                                  name: item.name,
                                  price: item.price,
                                  compareAt: item.compareAt,
                                  image: item.image,
                                  href: `/products/${item.productId}`
                                } as any)
                              }}
                              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                            >
                              <Heart className="size-4" strokeWidth={1.5} />
                              Move to Wishlist
                            </button>
                            <span className="h-4 w-px bg-border hidden sm:block"></span>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                            >
                              <Trash2 className="size-4" strokeWidth={1.5} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Order Summary */}
              <div className="lg:w-[380px] shrink-0">
                <div className="bg-secondary/30 p-6 md:p-8 sticky top-24">
                  <h2 className="font-serif text-xl mb-6">Order Summary</h2>
                  
                  <div className="flex flex-col gap-4 text-sm mb-6 border-b border-border pb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Charge</span>
                      <span className="font-medium">{deliveryCharge === 0 ? 'Free' : `₹${deliveryCharge.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-medium">₹0.00</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end mb-8">
                    <span className="text-base font-medium">Total</span>
                    <span className="text-2xl font-serif">₹{total.toFixed(2)}</span>
                  </div>
                  
                  <div className="mb-6 flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Promo Code" 
                      className="flex-1 h-12 px-4 border border-border bg-background text-sm focus:outline-none focus:border-foreground transition-colors"
                    />
                    <Button variant="outline" className="h-12 px-6 uppercase text-xs tracking-widest border-foreground hover:bg-foreground hover:text-background">
                      Apply
                    </Button>
                  </div>
                  
                  <Button className="w-full h-12 text-xs tracking-widest uppercase bg-foreground hover:bg-primary">
                    Proceed to Checkout
                  </Button>
                  
                  <div className="mt-6 text-center text-xs text-muted-foreground">
                    {amountForFreeShipping > 0 ? (
                      <p>
                        Add <span className="font-medium text-foreground">₹{amountForFreeShipping.toFixed(2)}</span> more to get free shipping.
                      </p>
                    ) : (
                      <p className="text-success font-medium">
                        You've unlocked free shipping!
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          )}
          
        </section>
      </main>

      <Footer />
    </div>
  )
}
