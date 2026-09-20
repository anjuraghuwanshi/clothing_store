'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'

export interface WishlistItem {
  id: string
  name: string
  price: number
  compareAt?: number
  image: string
  category?: string
  rating?: number
  reviewCount?: number
  badge?: { label: string; variant?: "outline" | "accent" | "sale" | "solid" | "muted" | "soldout" | null }
  href: string
}

interface WishlistContextType {
  items: WishlistItem[]
  toggleWishlist: (item: WishlistItem) => Promise<void>
  isInWishlist: (id: string) => boolean
}

const WishlistContext = React.createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WishlistItem[]>([])
  const { user } = useAuth()

  // Load from database when user changes
  React.useEffect(() => {
    if (!user) {
      setItems([])
      return
    }

    const fetchWishlist = async () => {
      const token = getToken()
      if (!token) return

      try {
        const wishlist = await apiFetch('/wishlist/', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Map backend wishlist items to the frontend format
        if (wishlist.items) {
          const frontendItems = wishlist.items.map((wi: any) => {
            const p = wi.product
            const primaryImage = p.images?.find((img: any) => img.is_primary)?.image_url 
                                 || p.images?.[0]?.image_url 
                                 || "/placeholder.svg"
            
            return {
              id: p.id,
              name: p.name,
              price: p.price,
              compareAt: p.compare_at_price,
              image: primaryImage,
              rating: p.rating,
              reviewCount: p.review_count,
              href: `/products/${p.id}`,
            }
          })
          setItems(frontendItems)
        }
      } catch (error) {
        console.error('Failed to fetch wishlist from database', error)
      }
    }

    fetchWishlist()
  }, [user])

  const toggleWishlist = React.useCallback(async (item: WishlistItem) => {
    const token = getToken()
    
    if (!token) {
      toast.error("Please login to use wishlist")
      return
    }

    const exists = items.some((i) => i.id === item.id)

    try {
      if (exists) {
        // Optimistic UI update
        setItems((prev) => prev.filter((i) => i.id !== item.id))
        
        await apiFetch(`/wishlist/items/${item.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        toast("Removed from wishlist")
      } else {
        // Optimistic UI update
        setItems((prev) => [...prev, item])
        
        await apiFetch('/wishlist/items/', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ product_id: item.id })
        })
        toast("Added to wishlist")
      }
    } catch (error) {
      console.error('Failed to update wishlist:', error)
      toast.error("Failed to update wishlist")
      // Revert optimistic update on failure
      if (exists) {
        setItems((prev) => [...prev, item])
      } else {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }
    }
  }, [items])

  const isInWishlist = React.useCallback((id: string) => {
    return items.some((i) => i.id === id)
  }, [items])

  return (
    <WishlistContext.Provider value={{ items, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = React.useContext(WishlistContext)
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
