'use client'

import * as React from 'react'
import { ProductGallery } from '@/components/product/product-gallery'
import { ProductDetails } from '@/components/product/product-details'

export interface ProductViewProps {
  product: {
    id: string
    name: string
    price: number
    originalPrice?: number
    description: string
    images: { url: string, color: string | null }[]
    colors: { id: string, name: string, hex: string, inStock: boolean }[]
    rawVariants: { id: string, size: string, color: string, stock: number }[]
  }
}

export function ProductView({ product }: ProductViewProps) {
  const defaultColorId = product.colors.find(c => c.inStock)?.id || product.colors[0]?.id
  const [selectedColorId, setSelectedColorId] = React.useState<string | null>(defaultColorId)

  const selectedColorName = product.colors.find(c => c.id === selectedColorId)?.name

  let currentImages = product.images
    .filter(img => {
      // Include if it matches the selected color, OR if it has no color assigned
      if (!img.color) return true;
      return selectedColorName && img.color.toLowerCase() === selectedColorName.toLowerCase();
    })
    .map(img => img.url)

  // Fallback in case no images matched at all
  if (currentImages.length === 0) {
    currentImages = product.images.map(img => img.url)
  }
  if (currentImages.length === 0) {
    currentImages = ['/placeholder.svg']
  }

  // Calculate size availability for the selected color
  const uniqueSizes = Array.from(new Set(product.rawVariants.map(v => v.size).filter(Boolean)))
  const sizes = uniqueSizes.map((size, idx) => {
    const isAvailable = product.rawVariants.some(v => 
      v.size === size && 
      v.color.toLowerCase() === selectedColorName?.toLowerCase() && 
      v.stock > 0
    )
    return {
      id: `s_${idx}`,
      name: size,
      inStock: isAvailable
    }
  })

  if (sizes.length === 0) {
    sizes.push({ id: 's_default', name: 'One Size', inStock: true })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
      <ProductGallery images={currentImages} title={product.name} />
      
      <div className="lg:max-w-md xl:max-w-lg">
        <ProductDetails 
          id={product.id}
          name={product.name}
          price={product.price}
          originalPrice={product.originalPrice}
          description={product.description}
          colors={product.colors}
          sizes={sizes}
          rawVariants={product.rawVariants}
          selectedColorId={selectedColorId}
          onColorChange={setSelectedColorId}
        />
      </div>
    </div>
  )
}
