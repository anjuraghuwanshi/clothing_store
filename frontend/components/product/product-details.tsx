'use client'

import * as React from 'react'
import { Heart, Truck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { Price } from '@/components/ui/price'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { useWishlist } from '@/components/wishlist-provider'
import { cn } from '@/lib/utils'
import { useCart } from '@/components/cart-provider'

export interface ProductDetailsProps {
  id: string
  name: string
  price: number
  originalPrice?: number
  colors: { id: string, name: string, hex: string, inStock: boolean }[]
  sizes: { id: string, name: string, inStock: boolean }[]
  rawVariants?: { id: string, size: string, color: string, stock: number }[]
  description: string
  selectedColorId?: string | null
  onColorChange?: (colorId: string) => void
}

export function ProductDetails({
  id,
  name,
  price,
  originalPrice,
  colors,
  sizes,
  rawVariants,
  description,
  selectedColorId: propSelectedColorId,
  onColorChange
}: ProductDetailsProps) {
  const [internalColorId, setInternalColorId] = React.useState<string | null>(colors.find(c => c.inStock)?.id || null)
  
  const selectedColor = propSelectedColorId !== undefined ? propSelectedColorId : internalColorId
  const setSelectedColor = (id: string) => {
    if (onColorChange) onColorChange(id)
    setInternalColorId(id)
  }

  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(1)
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addToCart } = useCart()
  const isWished = isInWishlist(id)

  const handleWishlistToggle = () => {
    toggleWishlist({
      id,
      name,
      price,
      originalPrice,
      image: '/placeholder.svg', // In a real app, use the actual image prop
      description,
      href: `/products/${id}`
    } as any)
  }

  // PIN checker state
  const [pinCode, setPinCode] = React.useState('')
  const [pinStatus, setPinStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handlePinCheck = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pinCode.trim() || pinCode.length < 5) return
    
    setPinStatus('loading')
    // Simulate API call
    setTimeout(() => {
      // Mock: pins ending in 0 are undeliverable
      if (pinCode.endsWith('0')) {
        setPinStatus('error')
      } else {
        setPinStatus('success')
      }
    }, 1500)
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size')
      return
    }
    if (!selectedColor) {
      alert('Please select a color')
      return
    }
    const colorObj = colors.find(c => c.id === selectedColor)
    const sizeObj = sizes.find(s => s.id === selectedSize)
    
    // Find exact variant ID
    const colorName = colorObj?.name
    const sizeName = sizeObj?.name
    const variant = rawVariants?.find(v => 
      v.color.toLowerCase() === colorName?.toLowerCase() && 
      v.size === sizeName
    )
    
    if (!variant) {
      alert('Variant not found')
      return
    }
    
    addToCart({
      id: variant.id,
      productId: id,
      name,
      price,
      image: '/placeholder.svg',
      color: colorName || '',
      size: sizeName || '',
      quantity,
      compareAt: originalPrice,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{name}</h1>
        <div className="flex items-center justify-between">
          <Price amount={price} originalAmount={originalPrice} size="lg" className="text-xl" />
          <span className="text-sm text-success flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full size-2 bg-success"></span>
            </span>
            In Stock
          </span>
        </div>
      </div>

      {/* Colors */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-foreground uppercase tracking-widest text-[0.6875rem]">Color</span>
          <span className="text-muted-foreground">{colors.find(c => c.id === selectedColor)?.name}</span>
        </div>
        <div className="flex gap-3">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => color.inStock && setSelectedColor(color.id)}
              disabled={!color.inStock}
              className={cn(
                "relative size-9 rounded-full border border-border flex items-center justify-center transition-all",
                selectedColor === color.id ? "ring-2 ring-primary ring-offset-2" : "hover:border-foreground",
                !color.inStock && "opacity-50 cursor-not-allowed before:absolute before:inset-0 before:bg-white/40 before:rounded-full after:absolute after:w-full after:h-[1px] after:bg-foreground/50 after:-rotate-45"
              )}
              style={{ backgroundColor: color.hex }}
              aria-label={`Select color ${color.name}`}
            />
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-foreground uppercase tracking-widest text-[0.6875rem]">Size</span>
          <Dialog>
            <DialogTrigger render={<button className="text-muted-foreground underline underline-offset-4 hover:text-primary transition-colors text-xs uppercase tracking-widest" />}>
              Size Guide
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Size Guide</DialogTitle>
              </DialogHeader>
              <div className="p-4 bg-secondary text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="py-2 font-medium">Size</th>
                      <th className="py-2 font-medium">Bust (in)</th>
                      <th className="py-2 font-medium">Waist (in)</th>
                      <th className="py-2 font-medium">Hips (in)</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    <tr className="border-b border-border/50"><td className="py-2">XS</td><td className="py-2">32</td><td className="py-2">24</td><td className="py-2">34</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2">S</td><td className="py-2">34</td><td className="py-2">26</td><td className="py-2">36</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2">M</td><td className="py-2">36</td><td className="py-2">28</td><td className="py-2">38</td></tr>
                    <tr className="border-b border-border/50"><td className="py-2">L</td><td className="py-2">38.5</td><td className="py-2">30.5</td><td className="py-2">40.5</td></tr>
                    <tr><td className="py-2">XL</td><td className="py-2">41</td><td className="py-2">33</td><td className="py-2">43</td></tr>
                  </tbody>
                </table>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {sizes.map((size) => (
            <button
              key={size.id}
              onClick={() => size.inStock && setSelectedSize(size.id)}
              disabled={!size.inStock}
              className={cn(
                "h-10 text-xs font-medium border transition-colors",
                selectedSize === size.id 
                  ? "border-foreground bg-foreground text-background" 
                  : "border-border bg-background text-foreground hover:border-foreground/50",
                !size.inStock && "opacity-50 cursor-not-allowed bg-secondary/50 text-muted-foreground hover:border-border"
              )}
            >
              {size.name}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex gap-4">
          <div className="w-24 shrink-0">
            <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={10} className="w-full h-12" />
          </div>
          <Button 
            className="flex-1 h-12 text-xs tracking-widest uppercase bg-foreground hover:bg-primary"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
          <button
            onClick={handleWishlistToggle}
            className="flex size-12 items-center justify-center border border-border shrink-0 hover:border-foreground transition-colors"
            aria-label="Wishlist"
          >
            <Heart className={cn("size-5 transition-colors", isWished && "fill-primary text-primary")} strokeWidth={1.5} />
          </button>
        </div>
        <Button 
          variant="outline" 
          className="w-full h-12 text-xs tracking-widest uppercase border-foreground text-foreground hover:bg-foreground hover:text-background"
        >
          Buy It Now
        </Button>
      </div>

      <hr className="border-border my-2" />

      {/* Delivery Checker */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-foreground font-medium text-sm">
          <Truck className="size-4" />
          Delivery & Return Options
        </div>
        <form onSubmit={handlePinCheck} className="flex gap-2">
          <input
            type="text"
            placeholder="Enter PIN Code"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            className="flex-1 h-10 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            maxLength={6}
          />
          <Button type="submit" variant="secondary" className="h-10 px-6 uppercase text-xs tracking-widest" disabled={pinStatus === 'loading' || !pinCode}>
            {pinStatus === 'loading' ? '...' : 'Check'}
          </Button>
        </form>
        {pinStatus === 'success' && (
          <div className="flex items-start gap-2 text-success text-sm bg-success/10 p-3">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <p>Delivery available for {pinCode}. Standard delivery in 3-5 business days. Free returns within 14 days.</p>
          </div>
        )}
        {pinStatus === 'error' && (
          <div className="flex items-start gap-2 text-destructive text-sm bg-destructive/10 p-3">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <p>Unfortunately, delivery is not available for {pinCode} at this time.</p>
          </div>
        )}
      </div>

      <hr className="border-border my-2" />

      {/* Accordions */}
      <div className="w-full">
        <Accordion>
          <AccordionItem title="Description">
            <p>{description}</p>
          </AccordionItem>
          <AccordionItem title="Fabric & Care">
            <ul className="list-disc list-inside space-y-1">
              <li>65% Linen, 35% Viscose</li>
              <li>Dry clean only</li>
              <li>Do not bleach</li>
              <li>Iron on low heat</li>
            </ul>
          </AccordionItem>
          <AccordionItem title="Size & Fit">
            <ul className="list-disc list-inside space-y-1">
              <li>Tailored, relaxed fit</li>
              <li>Fits true to size, take your normal size</li>
              <li>Model is 5'10" and is wearing a size S</li>
            </ul>
          </AccordionItem>
          <AccordionItem title="Shipping">
            <p>Complimentary standard shipping on all orders over $150. Expedited shipping options available at checkout. Orders are typically processed within 1-2 business days.</p>
          </AccordionItem>
          <AccordionItem title="Returns">
            <p>We accept returns within 14 days of delivery. Items must be unworn, unwashed, and in their original condition with all tags attached.</p>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}
