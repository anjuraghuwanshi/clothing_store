'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { CategoryForm } from '@/components/admin/category-form'
import { apiFetch } from '@/lib/apis/client'

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const [category, setCategory] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const resolvedParams = React.use(params)

  React.useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await apiFetch(`/categories/${resolvedParams.id}`)
        setCategory(data)
      } catch (error) {
        console.error("Failed to fetch category", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCategory()
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

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Category not found</h2>
        <Link href="/admin/categories" className="text-primary mt-4 inline-block hover:underline">
          Return to categories
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/categories" className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif">Edit Category</h1>
          <p className="text-muted-foreground mt-1 text-sm">Update {category.name}</p>
        </div>
      </div>

      <CategoryForm isEdit={true} initialData={category} />
    </div>
  )
}
