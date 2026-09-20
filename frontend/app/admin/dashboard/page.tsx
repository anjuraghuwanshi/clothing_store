'use client'

import * as React from 'react'
import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { ShoppingBag, ShoppingCart, Users, Package } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState({
    total_products: 0,
    total_orders: 0,
    total_customers: 0,
    low_stock_products: 0
  })
  
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = getToken()
        const data = await apiFetch('/admin/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch admin stats", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
  }, [])

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

  const statCards = [
    { title: "Total Products", value: stats.total_products, icon: ShoppingBag },
    { title: "Total Orders", value: stats.total_orders, icon: ShoppingCart },
    { title: "Total Customers", value: stats.total_customers, icon: Users },
    { title: "Low Stock Items", value: stats.low_stock_products, icon: Package, alert: stats.low_stock_products > 0 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif">Overview</h1>
        <p className="text-muted-foreground mt-2">Welcome to the admin dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div key={i} className="bg-background border border-border p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <h3 className={`text-3xl font-bold ${card.alert ? 'text-destructive' : 'text-foreground'}`}>
                  {card.value}
                </h3>
              </div>
              <div className="p-3 bg-muted/50 rounded-md text-foreground">
                <card.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
