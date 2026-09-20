'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/auth-provider'
import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'

export interface CartItem {
  id: string // DB cart item ID
  productId: string
  name: string
  price: number
  image: string
  color: string
  size: string
  quantity: number
  compareAt?: number
  variantId?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'id'> & { id?: string }) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  cartCount: number
  cartTotal: number
}

const CartContext = React.createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const { user } = useAuth()

  // Load from API when user changes
  React.useEffect(() => {
    if (!user) {
      setItems([])
      return
    }

    const fetchCart = async () => {
      const token = getToken()
      if (!token) return

      try {
        const cart = await apiFetch('/cart/', {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        if (cart.items) {
          const frontendItems = cart.items.map((ci: any) => {
            const v = ci.variant
            const p = v.product
            const primaryImage = p.images?.find((img: any) => img.is_primary)?.image_url 
                                 || p.images?.[0]?.image_url 
                                 || "/placeholder.svg"
            
            return {
              id: ci.id,
              variantId: v.id,
              productId: p.id,
              name: p.name,
              price: p.price,
              compareAt: p.compare_at_price,
              image: primaryImage,
              color: v.color,
              size: v.size,
              quantity: ci.quantity
            }
          })
          setItems(frontendItems)
        }
      } catch (error) {
        console.error('Failed to fetch cart from database', error)
      }
    }

    fetchCart()
  }, [user])

  const addToCart = React.useCallback(async (item: Omit<CartItem, 'id'> & { id?: string }) => {
    const token = getToken()
    
    if (!token) {
      toast.error("Please login to add to cart")
      return
    }

    // item.id passed from ProductDetails is the variantId
    const productVariantId = item.variantId || item.id

    const payload = {
      product_variant_id: productVariantId,
      quantity: item.quantity
    }
    
    console.log("Sending POST /cart/items/ with payload:", payload)

    try {
      const response = await apiFetch('/cart/items/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })

      // The API returns the updated/inserted CartItem
      // Update the frontend state to reflect this item (or update its quantity if it already existed)
      setItems((prev) => {
        const existingItemIndex = prev.findIndex((i) => i.variantId === productVariantId)
        
        const ci = response
        const v = ci.variant
        const p = v.product
        const primaryImage = p.images?.find((img: any) => img.is_primary)?.image_url 
                             || p.images?.[0]?.image_url 
                             || "/placeholder.svg"
                             
        const updatedItem = {
          id: ci.id,
          variantId: v.id,
          productId: p.id,
          name: p.name,
          price: p.price,
          compareAt: p.compare_at_price,
          image: primaryImage,
          color: v.color,
          size: v.size,
          quantity: ci.quantity
        }

        if (existingItemIndex > -1) {
          const newItems = [...prev]
          newItems[existingItemIndex] = updatedItem
          toast("Cart updated")
          return newItems
        } else {
          toast("Added to cart")
          return [...prev, updatedItem]
        }
      })
    } catch (error: any) {
      console.error('Failed to add to cart:', error)
      toast.error(error.message || "Failed to add to cart")
    }
  }, [])

  const updateQuantity = React.useCallback(async (id: string, quantity: number) => {
    const token = getToken()
    if (!token) return

    if (quantity <= 0) {
      // Just remove it if quantity is 0 or less
      try {
        await apiFetch(`/cart/items/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
        setItems((prev) => prev.filter((i) => i.id !== id))
      } catch (error: any) {
        toast.error(error.message || "Failed to remove item")
      }
      return
    }

    try {
      const response = await apiFetch(`/cart/items/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity })
      })

      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: response.quantity } : i)))
    } catch (error: any) {
      console.error('Failed to update quantity:', error)
      toast.error(error.message || "Failed to update quantity")
    }
  }, [])

  const removeFromCart = React.useCallback(async (id: string) => {
    const token = getToken()
    if (!token) return

    try {
      await apiFetch(`/cart/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      setItems((prev) => prev.filter((i) => i.id !== id))
      toast("Removed from cart")
    } catch (error: any) {
      console.error('Failed to remove from cart:', error)
      toast.error(error.message || "Failed to remove from cart")
    }
  }, [])

  const cartCount = React.useMemo(() => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }, [items])

  const cartTotal = React.useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [items])

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      updateQuantity, 
      removeFromCart,
      cartCount,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
