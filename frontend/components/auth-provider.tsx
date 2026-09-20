
'use client'

import * as React from 'react'
import { toast } from 'sonner'

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from '@/lib/apis/auth'

import {
  saveToken,
  getToken,
  removeToken,
} from '@/lib/auth/storage'


// =========================
// Address
// =========================

export interface Address {
  id: string
  fullName: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}


// =========================
// Order
// =========================

export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  image: string
}

export interface Order {
  id: string
  date: string
  items: OrderItem[]
  amount: number
  paymentMethod: string
  status:
    | 'Placed'
    | 'Confirmed'
    | 'Shipped'
    | 'Delivered'
    | 'Cancelled'
}


// =========================
// User
// =========================

// Backend fields + temporary frontend fields
export interface User {
  id: string
  email: string
  fullname: string
  created_at: string
  role: string

  // Temporary frontend-only data
  phone: string
  avatar?: string
  addresses: Address[]
  orders: Order[]
}


// =========================
// Auth Context
// =========================

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<void>
  signup: (fullName: string, email: string, phone: string, pass: string, role?: string) => Promise<void>

  logout: () => void

  // These remain fake for now
  updateProfile: (data: Partial<User>) => void
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (
    id: string,
    address: Omit<Address, 'id'>
  ) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  cancelOrder: (id: string) => void
}


const AuthContext =
  React.createContext<AuthContextType | undefined>(
    undefined
  )


// =========================
// Temporary Mock Orders
// =========================

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-89302',
    date: '2026-09-08T10:30:00Z',
    items: [
      {
        id: '1',
        name: 'Cashmere Blend Overcoat',
        quantity: 1,
        price: 690,
        image: '/product-coat.png',
      },
    ],
    amount: 690,
    paymentMethod: 'Credit Card',
    status: 'Shipped',
  },

  {
    id: 'ORD-75211',
    date: '2026-08-20T14:15:00Z',
    items: [
      {
        id: '2',
        name: 'Signature Silk Shirt',
        quantity: 2,
        price: 185,
        image: '/placeholder.svg',
      },
    ],
    amount: 370,
    paymentMethod: 'UPI',
    status: 'Delivered',
  },
]


// =========================
// Auth Provider
// =========================

export function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {

  const [user, setUser] =
    React.useState<User | null>(null)

  const [isLoading, setIsLoading] =
    React.useState(true)


  // =========================
  // Convert backend user
  // into frontend user
  // =========================

  const createFrontendUser = React.useCallback(
    (backendUser: {
      id: string
      email: string
      fullname: string
      phone: string
      created_at: string
      role: string
    }): User => {

      return {
        id: backendUser.id,
        email: backendUser.email,
        fullname: backendUser.fullname,
        role: backendUser.role,
        
        created_at: backendUser.created_at,

        // Temporary fake data
        phone: backendUser.phone,
        addresses: [],
        orders: MOCK_ORDERS,
      }
    },
    []
  )


  // =========================
  // Restore user on refresh
  // =========================

  React.useEffect(() => {

    const restoreUser = async () => {

      const token = getToken()

      if (!token) {
        setIsLoading(false)
        return
      }

      try {

        const backendUser =
          await getCurrentUser(token)

        const frontendUser =
          createFrontendUser(backendUser)

        setUser(frontendUser)

      } catch (error) {

        console.error(
          'Failed to restore user:',
          error
        )

        removeToken()
        setUser(null)

      } finally {

        setIsLoading(false)

      }
    }

    restoreUser()

  }, [createFrontendUser])


  // =========================
  // LOGIN
  // =========================

  const login = React.useCallback(
    async (
      email: string,
      pass: string
    ) => {

      try {

        // Login → backend
        const result =
          await loginUser({
            email,
            password: pass,
          })


        // Save JWT
        saveToken(result.access_token)


        // Get logged-in user
        const backendUser =
          await getCurrentUser(
            result.access_token
          )


        // Convert backend user
        const frontendUser =
          createFrontendUser(backendUser)


        setUser(frontendUser)


        toast.success(
          'Successfully logged in'
        )

      } catch (error) {

        console.error(
          'Login failed:',
          error
        )

        toast.error(
          error instanceof Error
            ? error.message
            : 'Login failed'
        )

        throw error
      }

    },
    [createFrontendUser]
  )


  // =========================
  // SIGNUP
  // =========================

  const signup = React.useCallback(
    async (
      fullName: string,
      email: string,
      phone: string,
      pass: string,
      role?: string
    ) => {

      try {

        await registerUser({
          fullname: fullName,
          email,
          phone: phone,
          password: pass,
          role: role || 'customer',
        } as any)


        toast.success(
          'Account created successfully'
        )

        // We are NOT automatically logging in.
        // User will login after registration.

      } catch (error) {

        console.error(
          'Signup failed:',
          error
        )

        toast.error(
          error instanceof Error
            ? error.message
            : 'Signup failed'
        )

        throw error
      }

    },
    []
  )


  // =========================
  // LOGOUT
  // =========================

  const logout = React.useCallback(() => {

    removeToken()

    setUser(null)

    toast.success(
      'Logged out successfully'
    )

  }, [])


  // =====================================================
  // EVERYTHING BELOW IS TEMPORARY / FAKE
  // We'll connect these to backend later.
  // =====================================================


  // =========================
  // Fake profile update
  // =========================

  const updateProfile =
    React.useCallback(
      (data: Partial<User>) => {

        setUser(prev =>
          prev
            ? {
                ...prev,
                ...data,
              }
            : null
        )

        toast.success(
          'Profile updated'
        )
      },
      []
    )


  // =========================
  // Fake add address
  // =========================

  const addAddress =
    React.useCallback(
      (
        address: Omit<Address, 'id'>
      ) => {

        setUser(prev => {

          if (!prev) {
            return prev
          }

          const newAddress = {
            ...address,
            id: 'addr_' + Date.now(),
          }

          if (
            prev.addresses.length === 0
          ) {
            newAddress.isDefault = true
          }

          const updatedAddresses =
            newAddress.isDefault
              ? prev.addresses.map(a => ({
                  ...a,
                  isDefault: false,
                }))
              : prev.addresses

          return {
            ...prev,

            addresses: [
              ...updatedAddresses,
              newAddress,
            ],
          }

        })

        toast.success(
          'Address added'
        )
      },
      []
    )


  // =========================
  // Fake update address
  // =========================

  const updateAddress =
    React.useCallback(
      (
        id: string,
        address: Omit<Address, 'id'>
      ) => {

        setUser(prev => {

          if (!prev) {
            return prev
          }

          const updatedAddresses =
            prev.addresses.map(a => {

              if (a.id === id) {

                return {
                  ...a,
                  ...address,
                }

              }

              if (
                address.isDefault &&
                a.id !== id
              ) {

                return {
                  ...a,
                  isDefault: false,
                }

              }

              return a
            })

          return {
            ...prev,
            addresses:
              updatedAddresses,
          }

        })

        toast.success(
          'Address updated'
        )
      },
      []
    )


  // =========================
  // Fake remove address
  // =========================

  const removeAddress =
    React.useCallback(
      (id: string) => {

        setUser(prev => {

          if (!prev) {
            return prev
          }

          return {
            ...prev,

            addresses:
              prev.addresses.filter(
                a => a.id !== id
              ),
          }

        })

        toast.success(
          'Address removed'
        )
      },
      []
    )


  // =========================
  // Fake default address
  // =========================

  const setDefaultAddress =
    React.useCallback(
      (id: string) => {

        setUser(prev => {

          if (!prev) {
            return prev
          }

          return {
            ...prev,

            addresses:
              prev.addresses.map(a => ({
                ...a,
                isDefault:
                  a.id === id,
              })),
          }

        })

        toast.success(
          'Default address updated'
        )
      },
      []
    )


  // =========================
  // Fake cancel order
  // =========================

  const cancelOrder =
    React.useCallback(
      (id: string) => {

        setUser(prev => {

          if (!prev) {
            return prev
          }

          return {
            ...prev,

            orders:
              prev.orders.map(o =>
                o.id === id
                  ? {
                      ...o,
                      status:
                        'Cancelled',
                    }
                  : o
              ),
          }

        })

        toast.success(
          'Order cancelled'
        )
      },
      []
    )


  // =========================
  // Provider
  // =========================

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        user,

        login,
        signup,
        logout,

        updateProfile,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        cancelOrder,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}


// =========================
// useAuth Hook
// =========================

export function useAuth() {

  const context =
    React.useContext(
      AuthContext
    )

  if (context === undefined) {

    throw new Error(
      'useAuth must be used within a AuthProvider'
    )

  }

  return context
}

