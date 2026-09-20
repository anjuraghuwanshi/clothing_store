'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, CornerDownRight, Image as ImageIcon } from 'lucide-react'

import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { Button } from '@/components/ui/button'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')

  const fetchCategories = React.useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiFetch(`/categories/?limit=1000`)
      setCategories(data)
    } catch (error) {
      console.error("Failed to fetch categories", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return
    
    try {
      const token = getToken()
      await apiFetch(`/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setCategories(prev => prev.filter(c => c.id !== id))
    } catch (error: any) {
      console.error("Failed to delete category", error)
      const detail = error.message || "Cannot delete category if it has products or subcategories."
      alert(`Delete Failed: ${detail}`)
    }
  }

  // Hierarchy building
  const rootCategories = categories.filter(c => !c.parent_id)
  
  const getChildren = (parentId: string) => {
    return categories.filter(c => c.parent_id === parentId)
  }

  // Flattened hierarchical list for table rendering
  const hierarchicalCategories: any[] = []
  
  const buildHierarchy = (cats: any[], depth = 0) => {
    // Sort alphabetically at each level
    const sorted = [...cats].sort((a, b) => a.name.localeCompare(b.name))
    
    sorted.forEach(cat => {
      // Add current category
      hierarchicalCategories.push({ ...cat, depth })
      
      // Find and add children
      const children = getChildren(cat.id)
      if (children.length > 0) {
        buildHierarchy(children, depth + 1)
      }
    })
  }
  
  buildHierarchy(rootCategories)

  const filteredCategories = hierarchicalCategories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.slug.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">Categories</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your store hierarchy and product groupings.</p>
        </div>
        <Button asChild className="bg-foreground text-background">
          <Link href="/admin/categories/new">
            <Plus className="size-4 mr-2" /> Add Category
          </Link>
        </Button>
      </div>

      <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm border border-border rounded-md bg-background focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs uppercase bg-muted/50 border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Category Name</th>
                <th className="px-6 py-4 font-medium">Slug</th>
                <th className="px-6 py-4 font-medium text-center">Products</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => {
                  return (
                    <tr key={category.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4" style={{ paddingLeft: `${category.depth * 2}rem` }}>
                          {category.depth > 0 && <CornerDownRight className="size-4 text-muted-foreground shrink-0" />}
                          <div className="relative size-10 rounded overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border">
                            {category.image_url ? (
                              <Image src={category.image_url} alt={category.name} fill className="object-cover" />
                            ) : (
                              <ImageIcon className="size-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="font-medium text-foreground">{category.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        /{category.slug}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {category.product_count || 0} products
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {category.is_active !== false ? 
                            <span title="Active" className="text-green-600"><CheckCircle className="size-4" /></span> : 
                            <span title="Inactive" className="text-muted-foreground"><XCircle className="size-4" /></span>
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/categories/${category.id}`} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Edit className="size-4" />
                          </Link>
                          <button onClick={() => handleDelete(category.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
