'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'

import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { Button } from '@/components/ui/button'

export default function AdminProductsPage() {
  const [products, setProducts] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')

  const fetchProducts = React.useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      const data = await apiFetch(`/admin/products/?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(data)
    } catch (error) {
      console.error("Failed to fetch products", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    
    try {
      const token = getToken()
      await apiFetch(`/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error("Failed to delete product", error)
      alert("Failed to delete product")
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">Products</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your catalog, inventory, and pricing.</p>
        </div>
        <Button asChild className="bg-foreground text-background">
          <Link href="/admin/products/new">
            <Plus className="size-4 mr-2" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search products..."
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
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-center">Variants</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const primaryImage = product.images?.find((img: any) => img.is_primary)?.image_url 
                                       || product.images?.[0]?.image_url 
                                       || "/placeholder.svg"
                  
                  const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0
                  
                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative size-12 rounded overflow-hidden bg-muted flex-shrink-0">
                            <Image src={primaryImage} alt={product.name} fill className="object-cover" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{product.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">ID: {product.id.split('-')[0]}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>₹{product.price}</div>
                        {product.compare_at_price && (
                          <div className="text-xs text-muted-foreground line-through">₹{product.compare_at_price}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${totalStock > 10 ? 'bg-green-100 text-green-800' : totalStock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {totalStock} in stock
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-muted-foreground">{product.variants?.length || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {product.is_active ? 
                            <span title="Active" className="text-green-600"><CheckCircle className="size-4" /></span> : 
                            <span title="Inactive" className="text-muted-foreground"><XCircle className="size-4" /></span>
                          }
                          {product.is_featured && (
                            <span title="Featured" className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-amber-100 text-amber-800">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/products/${product.id}`} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                            <Edit className="size-4" />
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
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
