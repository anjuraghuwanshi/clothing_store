'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductForm } from '@/components/admin/product-form'
import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const resolvedParams = React.use(params)

  React.useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = getToken()
        const data = await apiFetch(`/admin/products/${resolvedParams.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setProduct(data)
      } catch (error) {
        console.error("Failed to fetch product", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [resolvedParams.id])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-pulse flex gap-2 items-center">
          <div className="w-4 h-4 bg-foreground/20 rounded-full" />
          <div className="w-4 h-4 bg-foreground/20 rounded-full" />
          <div className="w-4 h-4 bg-foreground/20 rounded-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Product not found</h2>
        <Link href="/admin/products" className="text-primary mt-4 inline-block hover:underline">
          Return to products
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif">Edit Product</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update {product.name}</p>
        </div>
      </div>

      <ProductForm isEdit={true} initialData={product} />
    </div>
  )
}
