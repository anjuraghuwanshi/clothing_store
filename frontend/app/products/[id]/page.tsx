import * as React from 'react'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { RelatedProducts } from '@/components/product/related-products'
import { RecentlyViewed } from '@/components/product/recently-viewed'
import { apiFetch } from '@/lib/apis/client'
import { ProductView } from '@/components/product/product-view'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const { id } = resolvedParams
  
  let productRaw = null
  
  try {
    productRaw = await apiFetch(`/products/${id}`, { cache: 'no-store' })
  } catch (error) {
    console.error("Failed to fetch product:", error)
  }

  if (!productRaw) {
    notFound()
  }

  // Extract images with colors
  const images = productRaw.images && productRaw.images.length > 0 
    ? productRaw.images.map((img: any) => ({
        url: img.image_url,
        color: img.color || null
      }))
    : [{ url: '/placeholder.svg', color: null }]

  // Extract unique colors from variants
  const uniqueColors = Array.from(new Set(productRaw.variants?.map((v: any) => v.color).filter(Boolean))) as string[];
  const colors = uniqueColors.map((color: string, idx: number) => {
    const hexMap: Record<string, string> = {
      'navy': '#1c2841', 'sand': '#d4c5b9', 'olive': '#4a5338', 'black': '#000000', 'white': '#ffffff', 'pink': '#ffc0cb'
    }
    const safeColor = color.toLowerCase();
    
    // If not in hexMap, fall back to the actual color string (e.g., 'red', 'blue') which CSS natively understands.
    return {
      id: `c_${idx}`,
      name: color,
      hex: hexMap[safeColor] || safeColor,
      inStock: productRaw.variants.some((v: any) => v.color === color && v.stock_quantity > 0)
    };
  });

  if (colors.length === 0) {
    colors.push({ id: 'c_default', name: 'Standard', hex: '#000000', inStock: true })
  }

  // Provide rawVariants to let the client component calculate size stock dynamically per color
  const rawVariants = productRaw.variants?.map((v: any) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    stock: v.stock_quantity
  })) || []

  const product = {
    id: productRaw.id,
    name: productRaw.name,
    price: productRaw.price,
    originalPrice: productRaw.compare_at_price || productRaw.price,
    description: productRaw.description || 'No description available for this product.',
    images,
    colors,
    rawVariants
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="mx-auto max-w-[1400px] px-4 py-4 md:px-8 text-xs uppercase tracking-widest text-muted-foreground flex gap-2">
          <a href="/" className="hover:text-foreground transition-colors">Home</a>
          <span>/</span>
          <a href="#" className="hover:text-foreground transition-colors">Shop</a>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Section */}
        <section className="mx-auto max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
          <ProductView product={product} />
        </section>

        {/* Related Products */}
        <RelatedProducts productId={product.id} />

        {/* Recently Viewed */}
        <RecentlyViewed />
      </main>

      <Footer />
    </div>
  )
}
