'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, Eye, Filter } from 'lucide-react'

import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { Button } from '@/components/ui/button'

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState('All')
  const [dateFilter, setDateFilter] = React.useState('All')

  const fetchOrders = React.useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      const data = await apiFetch(`/admin/orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrders(data)
    } catch (error) {
      console.error("Failed to fetch orders", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(search.toLowerCase()) ||
      order.customer_phone.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = statusFilter === 'All' || order.order_status === statusFilter
    
    let matchesDate = true
    if (dateFilter !== 'All') {
      const orderDate = new Date(order.created_at)
      const now = new Date()
      if (dateFilter === 'Today') {
        matchesDate = orderDate.toDateString() === now.toDateString()
      } else if (dateFilter === '7Days') {
        const sevenDaysAgo = new Date(now.setDate(now.getDate() - 7))
        matchesDate = orderDate >= sevenDaysAgo
      } else if (dateFilter === '30Days') {
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30))
        matchesDate = orderDate >= thirtyDaysAgo
      }
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const statusColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Confirmed': 'bg-blue-100 text-blue-800',
    'Packed': 'bg-purple-100 text-purple-800',
    'Shipped': 'bg-indigo-100 text-indigo-800',
    'Out for Delivery': 'bg-orange-100 text-orange-800',
    'Delivered': 'bg-green-100 text-green-800',
    'Cancelled': 'bg-red-100 text-red-800',
    'Returned': 'bg-gray-100 text-gray-800',
    'Refunded': 'bg-gray-200 text-gray-900',
  }

  const paymentColors: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Paid': 'bg-green-100 text-green-800',
    'Failed': 'bg-red-100 text-red-800',
    'Refunded': 'bg-gray-200 text-gray-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage customer orders and shipments.</p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row items-center gap-4 bg-muted/10">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search by Order ID, Customer Name, Email, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 text-sm border border-border rounded-md bg-background focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="size-4 text-muted-foreground" />
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-3 text-sm border border-border rounded-md bg-background focus:outline-none focus:border-foreground"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Returned">Returned</option>
              <option value="Refunded">Refunded</option>
            </select>
            <select 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)}
              className="h-10 px-3 text-sm border border-border rounded-md bg-background focus:outline-none focus:border-foreground"
            >
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="7Days">Last 7 Days</option>
              <option value="30Days">Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs uppercase bg-muted/50 border-b border-border text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID / Date</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium text-center">Items</th>
                <th className="px-6 py-4 font-medium text-right">Total</th>
                <th className="px-6 py-4 font-medium text-center">Payment</th>
                <th className="px-6 py-4 font-medium text-center">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{order.id.split('-')[0].toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{order.customer_email}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${paymentColors[order.payment_status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.payment_status}
                        </span>
                        <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{order.payment_method}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColors[order.order_status] || 'bg-gray-100 text-gray-800'}`}>
                          {order.order_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Eye className="size-3 mr-2" /> View
                          </Link>
                        </Button>
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
