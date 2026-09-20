'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon } from 'lucide-react'

interface CategoryFormProps {
  initialData?: any
  isEdit?: boolean
}

export function CategoryForm({ initialData, isEdit }: CategoryFormProps) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const [categories, setCategories] = React.useState<any[]>([])

  // Form State
  const [name, setName] = React.useState(initialData?.name || '')
  const [slug, setSlug] = React.useState(initialData?.slug || '')
  const [parentId, setParentId] = React.useState(initialData?.parent_id || '')
  const [imageUrl, setImageUrl] = React.useState(initialData?.image_url || '')
  const [isActive, setIsActive] = React.useState(initialData?.is_active ?? true)

  React.useEffect(() => {
    // Fetch categories for parent selection (exclude self if editing)
    apiFetch('/categories/').then(data => {
      if (isEdit && initialData?.id) {
        setCategories(data.filter((c: any) => c.id !== initialData.id))
      } else {
        setCategories(data)
      }
    }).catch(console.error)
  }, [isEdit, initialData])

  // Auto-generate slug from name if empty
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)
    if (!isEdit && !slug) {
      setSlug(newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = getToken()
      const payload = {
        name,
        slug,
        parent_id: parentId || null,
        image_url: imageUrl || null,
        is_active: isActive
      }

      if (isEdit && initialData?.id) {
        await apiFetch(`/categories/${initialData.id}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
      } else {
        await apiFetch(`/categories/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload)
        })
      }

      router.push('/admin/categories')
      router.refresh()
    } catch (error: any) {
      console.error(error)
      alert(`Failed to save category: ${error.message || 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      
      {/* Basic Info */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-medium">Category Information</h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-medium">Category Name *</label>
            <input required value={name} onChange={handleNameChange} className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:border-foreground bg-background" />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-medium">Slug *</label>
            <input required value={slug} onChange={e => setSlug(e.target.value)} className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:border-foreground bg-background" />
            <p className="text-[10px] text-muted-foreground uppercase">The URL-friendly version of the name</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-medium">Parent Category (Optional)</label>
            <select value={parentId} onChange={e => setParentId(e.target.value)} className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:border-foreground bg-background">
              <option value="">None (Top Level Category)</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Image & Status */}
      <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6">
        <h3 className="font-serif text-lg font-medium">Media & Visibility</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="size-20 bg-muted border border-border rounded flex items-center justify-center overflow-hidden shrink-0">
              {imageUrl ? (
                <img src={imageUrl} alt="preview" className="size-full object-cover" />
              ) : (
                <ImageIcon className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 space-y-2 mt-2">
              <label className="text-xs uppercase tracking-wider font-medium">Image URL</label>
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full h-10 px-3 border border-border rounded focus:outline-none focus:border-foreground bg-background" />
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="size-4" />
              <div className="space-y-1">
                <span className="text-sm font-medium">Active</span>
                <p className="text-xs text-muted-foreground">If inactive, the category and its products will be hidden from the store.</p>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/categories')}>Cancel</Button>
        <Button type="submit" disabled={loading} className="bg-foreground text-background w-32">
          {loading ? 'Saving...' : 'Save Category'}
        </Button>
      </div>

    </form>
  )
}
