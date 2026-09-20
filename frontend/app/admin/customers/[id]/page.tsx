'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft, User, MapPin, ShoppingBag, Calendar, Activity, CheckCircle, Clock, XCircle, Eye } from 'lucide-react'

import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { Button } from '@/components/ui/button'

export default function AdminCustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [customer, setCustomer] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const resolvedParams = React.use(params)

  React.useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = getToken()
        const data = await apiFetch(`/admin/customers/${resolvedParams.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setCustomer(data)
      } catch (error) {
        console.error("Failed to fetch customer details", error)
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
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

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Customer not found</h2>
        <Link href="/admin/customers" className="text-primary mt-4 inline-block hover:underline">
          Return to customers
        </Link>
      </div>
    )
  }

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/customers" className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif flex items-center gap-3">
            {customer.fullname}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <Calendar className="size-4" /> Customer since {new Date(customer.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Customer Profile */}
          <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
            <h3 className="font-serif text-lg font-medium flex items-center gap-2 mb-4 border-b border-border pb-3">
              <User className="size-5 text-muted-foreground" /> Contact Info
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Email</div>
                <div className="font-medium">{customer.email}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Phone</div>
                <div className="font-medium">{customer.phone || 'Not provided'}</div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background border border-border p-4 rounded-lg shadow-sm">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><ShoppingBag className="size-3" /> Total Orders</div>
              <div className="text-2xl font-serif">{customer.stats.total_orders}</div>
            </div>
            <div className="bg-background border border-border p-4 rounded-lg shadow-sm">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1"><Activity className="size-3" /> Total Spent</div>
              <div className="text-2xl font-serif text-primary">${customer.stats.total_spent.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
             <h3 className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Order Summary</h3>
             <div className="space-y-3">
               <div className="flex justify-between items-center text-sm">
                 <span className="flex items-center gap-2"><Clock className="size-4 text-yellow-500" /> Pending</span>
                 <span className="font-medium">{customer.stats.pending_orders}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="flex items-center gap-2"><CheckCircle className="size-4 text-green-500" /> Delivered</span>
                 <span className="font-medium">{customer.stats.delivered_orders}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                 <span className="flex items-center gap-2"><XCircle className="size-4 text-red-500" /> Cancelled</span>
                 <span className="font-medium">{customer.stats.cancelled_orders}</span>
               </div>
             </div>
          </div>

          {/* Saved Addresses */}
          <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
            <h3 className="font-serif text-lg font-medium flex items-center gap-2 mb-4 border-b border-border pb-3">
              <MapPin className="size-5 text-muted-foreground" /> Saved Addresses ({customer.addresses.length})
            </h3>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved addresses.</p>
            ) : (
              <div className="space-y-4">
                {customer.addresses.map((address: any) => (
                  <div key={address.id} className="p-3 border border-border rounded-md bg-secondary/50 text-sm">
                    {address.is_default && <span className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1 block">Default</span>}
                    <p className="font-medium">{address.address_line1}</p>
                    <p className="text-muted-foreground">{address.city}, {address.state} {address.pincode}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Order History) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/10 flex justify-between items-center">
              <h3 className="font-serif text-lg font-medium flex items-center gap-2">
                <ShoppingBag className="size-5 text-muted-foreground" /> Order History
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4 font-medium">Order ID / Date</th>
                    <th className="px-6 py-4 font-medium text-center">Items</th>
                    <th className="px-6 py-4 font-medium text-right">Total</th>
                    <th className="px-6 py-4 font-medium text-center">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customer.orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                        This customer hasn't placed any orders yet.
                      </td>
                    </tr>
                  ) : (
                    customer.orders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{order.id.split('-')[0].toUpperCase()}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-muted-foreground">
                          {order.items?.length || 0}
                        </td>
                        <td className="px-6 py-4 text-right font-medium">
                          ${order.total_amount.toFixed(2)}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
