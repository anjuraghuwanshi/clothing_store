'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react'

import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { Button } from '@/components/ui/button'

interface ProductFormProps {
  initialData?: any
  isEdit?: boolean
}

export function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [categories, setCategories] = React.useState<any[]>([])

  // Form State
  const [name, setName] = React.useState(initialData?.name || '')
  const [description, setDescription] = React.useState(initialData?.description || '')
  const [categoryId, setCategoryId] = React.useState(initialData?.category_id || '')
  const [price, setPrice] = React.useState(initialData?.price || '')
  const [compareAt, setCompareAt] = React.useState(initialData?.compare_at_price || '')

  const [isActive, setIsActive] = React.useState(initialData?.is_active ?? true)
  const [isFeatured, setIsFeatured] = React.useState(initialData?.is_featured ?? false)
  const [isNewArrival, setIsNewArrival] = React.useState(initialData?.is_new_arrival ?? false)
  const [isBestSeller, setIsBestSeller] = React.useState(initialData?.is_best_seller ?? false)

  const [images, setImages] = React.useState<any[]>(initialData?.images || [])
  const [variants, setVariants] = React.useState<any[]>(initialData?.variants || [])

  React.useEffect(() => {
    // Fetch categories
    apiFetch('/categories/').then(setCategories).catch(console.error)
  }, [])

  // Image handlers
  const addImage = () => {
    setImages([...images, { image_url: '', color: '', is_primary: images.length === 0 }])
  }
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }
  const updateImage = (index: number, field: string, value: any) => {
    const newImages = [...images]
    if (field === 'is_primary' && value === true) {
      newImages.forEach(img => img.is_primary = false)
    }
    newImages[index] = { ...newImages[index], [field]: value }
    setImages(newImages)
  }

  // Variant handlers
  const addVariant = () => {
    setVariants([...variants, { size: '', color: '', sku: '', stock_quantity: 0 }])
  }
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }
  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = getToken()
      const payload = {
        name,
        description,
        price: parseFloat(price) || 0,
        compare_at_price: compareAt ? parseFloat(compareAt) : null,
        category_id: categoryId,
        is_active: isActive,
        is_featured: isFeatured,
        is_new_arrival: isNewArrival,
        is_best_seller: isBestSeller,
        images: images.map(img => ({
          id: img.id || undefined,
          image_url: img.image_url,
          color: img.color || null,
          is_primary: img.is_primary
        })),
        variants: variants.map(v => ({
          id: v.id || undefined,
          size: v.size,
          color: v.color,
          sku: v.sku,
          stock_quantity: parseInt(v.stock_quantity) || 0
        }))
      }

      if (isEdit && initialData?.id) {
        await apiFetch(`/products/${initialData.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
      } else {
        await apiFetch(`/products/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
      
      {/* Basic Info */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-medium">Product Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:border-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-medium">Category *</label>
            <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:border-foreground bg-background">
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wider font-medium">Description</label>
          <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 border border-border rounded focus:outline-none focus:border-foreground" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-medium">Price *</label>
            <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:border-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-medium">Compare-at Price</label>
            <input type="number" step="0.01" value={compareAt} onChange={e => setCompareAt(e.target.value)} className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:border-foreground" />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-medium">Product Status & Visibility</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="size-4" />
            <span className="text-sm">Active</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="size-4" />
            <span className="text-sm">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isNewArrival} onChange={e => setIsNewArrival(e.target.checked)} className="size-4" />
            <span className="text-sm">New Arrival</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} className="size-4" />
            <span className="text-sm">Best Seller</span>
          </label>
        </div>
      </div>

      {/* Images */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-medium">Images</h3>
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            <Plus className="size-4 mr-2" /> Add Image
          </Button>
        </div>
        
        <div className="space-y-4">
          {images.map((img, idx) => (
            <div key={idx} className="flex gap-4 items-start border border-border p-4 rounded bg-muted/20">
              <div className="size-16 bg-muted border border-border rounded flex items-center justify-center overflow-hidden shrink-0">
                {img.image_url ? (
                  <img src={img.image_url} alt="preview" className="size-full object-cover" />
                ) : (
                  <ImageIcon className="size-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 space-y-4">
                <input 
                  placeholder="Image URL" 
                  required 
                  value={img.image_url} 
                  onChange={e => updateImage(idx, 'image_url', e.target.value)} 
                  className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none focus:border-foreground" 
                />
                <div className="flex items-center gap-4">
                  <select
                    value={img.color || ''}
                    onChange={e => updateImage(idx, 'color', e.target.value)}
                    className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none focus:border-foreground bg-background"
                  >
                    <option value="">No specific color (All variants)</option>
                    {Array.from(new Set(variants.map(v => v.color).filter(Boolean))).map((colorStr, i) => (
                      <option key={i} value={colorStr}>{colorStr}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 whitespace-nowrap text-sm cursor-pointer">
                    <input 
                      type="radio" 
                      name="primary_image" 
                      checked={img.is_primary} 
                      onChange={e => updateImage(idx, 'is_primary', e.target.checked)} 
                    />
                    Primary Image
                  </label>
                </div>
              </div>
              <button type="button" onClick={() => removeImage(idx)} className="p-2 text-muted-foreground hover:text-destructive">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {images.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No images added. Product will use a placeholder.</p>
          )}
        </div>
      </div>

      {/* Variants */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-medium">Variants</h3>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="size-4 mr-2" /> Add Variant
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-xs uppercase tracking-wider font-medium text-muted-foreground px-2">
            <div className="col-span-3">Color *</div>
            <div className="col-span-3">Size *</div>
            <div className="col-span-3">SKU *</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-1"></div>
          </div>
          
          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-muted/20 p-2 rounded border border-border">
              <div className="col-span-3">
                <input required placeholder="e.g. Black" value={v.color} onChange={e => updateVariant(idx, 'color', e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none" />
              </div>
              <div className="col-span-3">
                <input required placeholder="e.g. M" value={v.size} onChange={e => updateVariant(idx, 'size', e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none" />
              </div>
              <div className="col-span-3">
                <input required placeholder="SKU-123" value={v.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none" />
              </div>
              <div className="col-span-2">
                <input type="number" required placeholder="0" value={v.stock_quantity} onChange={e => updateVariant(idx, 'stock_quantity', e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none" />
              </div>
              <div className="col-span-1 flex justify-end">
                <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))}
          {variants.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No variants added. Please add at least one color/size combination.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-foreground text-background w-32">
          {loading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>

    </form>
  )
}
