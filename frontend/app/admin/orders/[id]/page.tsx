'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Truck, CreditCard, User, MapPin, Clock } from 'lucide-react'

import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { Button } from '@/components/ui/button'

export default function AdminOrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)
  const [statusUpdating, setStatusUpdating] = React.useState(false)
  const resolvedParams = React.use(params)
  
  // Shipment form state
  const [deliveryPartner, setDeliveryPartner] = React.useState('')
  const [trackingNumber, setTrackingNumber] = React.useState('')
  const [trackingUrl, setTrackingUrl] = React.useState('')
  const [shipmentLoading, setShipmentLoading] = React.useState(false)

  const fetchOrder = React.useCallback(async () => {
    try {
      const token = getToken()
      const data = await apiFetch(`/admin/orders/${resolvedParams.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setOrder(data)
      if (data.shipment) {
        setDeliveryPartner(data.shipment.delivery_partner)
        setTrackingNumber(data.shipment.tracking_number)
        setTrackingUrl(data.shipment.tracking_url || '')
      }
    } catch (error) {
      console.error("Failed to fetch order", error)
    } finally {
      setLoading(false)
    }
  }, [resolvedParams.id])

  React.useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const updateStatus = async (newStatus: string) => {
    setStatusUpdating(true)
    try {
      const token = getToken()
      await apiFetch(`/admin/orders/${order.id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order_status: newStatus })
      })
      await fetchOrder()
    } catch (error: any) {
      alert(`Failed to update status: ${error.message}`)
    } finally {
      setStatusUpdating(false)
    }
  }

  const updatePaymentStatus = async (newStatus: string) => {
    try {
      const token = getToken()
      await apiFetch(`/admin/orders/${order.id}/payment`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ payment_status: newStatus })
      })
      await fetchOrder()
    } catch (error: any) {
      alert(`Failed to update payment status: ${error.message}`)
    }
  }

  const saveShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    setShipmentLoading(true)
    try {
      const token = getToken()
      await apiFetch(`/admin/orders/${order.id}/shipment`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          delivery_partner: deliveryPartner,
          tracking_number: trackingNumber,
          tracking_url: trackingUrl || null
        })
      })
      await fetchOrder()
    } catch (error: any) {
      alert(`Failed to save shipment: ${error.message}`)
    } finally {
      setShipmentLoading(false)
    }
  }

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

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium">Order not found</h2>
        <Link href="/admin/orders" className="text-primary mt-4 inline-block hover:underline">
          Return to orders
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
  
  const timelineStages = ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders" className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif flex items-center gap-3">
              Order #{order.id.split('-')[0].toUpperCase()}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusColors[order.order_status] || 'bg-gray-100'}`}>
                {order.order_status}
              </span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>Print Invoice</Button>
          {order.order_status !== 'Cancelled' && order.order_status !== 'Delivered' && (
            <Button variant="destructive" onClick={() => updateStatus('Cancelled')} disabled={statusUpdating}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline */}
          <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
            <h3 className="font-serif text-lg font-medium mb-6">Order Timeline</h3>
            <div className="flex flex-col md:flex-row justify-between gap-4 relative">
              {timelineStages.map((stage, idx) => {
                const history = order.status_history?.find((h: any) => h.status === stage)
                const isCurrent = order.order_status === stage
                const isPast = timelineStages.indexOf(order.order_status) >= idx && order.order_status !== 'Cancelled'
                const isCancelled = order.order_status === 'Cancelled'
                
                return (
                  <div key={stage} className="flex-1 flex flex-col items-center relative z-10">
                    <div className={`size-8 rounded-full flex items-center justify-center border-2 mb-2 bg-background
                      ${isPast || (isCurrent && !isCancelled) ? 'border-primary text-primary' : 'border-muted-foreground/30 text-muted-foreground/30'}
                      ${isCurrent ? 'ring-4 ring-primary/20' : ''}
                    `}>
                      {isPast ? <div className="size-3 bg-primary rounded-full" /> : <div className="size-2 bg-muted-foreground/30 rounded-full" />}
                    </div>
                    <div className={`text-xs font-medium text-center uppercase tracking-wider ${isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stage}
                    </div>
                    {history && (
                      <div className="text-[10px] text-muted-foreground mt-1 text-center">
                        {new Date(history.changed_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )
              })}
              {/* Connector line */}
              <div className="hidden md:block absolute top-4 left-6 right-6 h-[2px] bg-border -z-0"></div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-border flex flex-wrap gap-2 justify-center">
              {['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].map(status => (
                <Button
                  key={status}
                  variant={order.order_status === status ? "primary" : "outline"}
                  size="sm"
                  onClick={() => updateStatus(status)}
                  disabled={statusUpdating || order.order_status === status}
                  className="text-xs uppercase tracking-widest"
                >
                  Mark {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/10">
              <h3 className="font-serif text-lg font-medium">Order Items ({order.items?.length || 0})</h3>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Product</th>
                    <th className="px-6 py-3 font-medium text-center">Price</th>
                    <th className="px-6 py-3 font-medium text-center">Qty</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative size-12 bg-secondary rounded overflow-hidden shrink-0">
                            {item.product_image_url && <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" />}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{item.product_name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {item.color} • {item.size}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Totals */}
            <div className="p-6 bg-muted/10 border-t border-border flex justify-end">
              <div className="w-full max-w-xs space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping_charge === 0 ? 'Free' : `$${order.shipping_charge.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-destructive">-${order.discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border font-medium text-lg">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Customer & Address */}
          <div className="bg-background border border-border p-6 rounded-lg shadow-sm space-y-6">
            <div>
              <h3 className="font-serif text-lg font-medium flex items-center gap-2 mb-4">
                <User className="size-5 text-muted-foreground" /> Customer Details
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-muted-foreground">{order.customer_email}</p>
                <p className="text-muted-foreground">{order.customer_phone}</p>
              </div>
            </div>
            
            <hr className="border-border" />
            
            <div>
              <h3 className="font-serif text-lg font-medium flex items-center gap-2 mb-4">
                <MapPin className="size-5 text-muted-foreground" /> Shipping Address
              </h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="text-foreground font-medium">{order.customer_name}</p>
                <p>{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} {order.shipping_pincode}</p>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
            <h3 className="font-serif text-lg font-medium flex items-center gap-2 mb-4">
              <CreditCard className="size-5 text-muted-foreground" /> Payment Info
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Status</span>
                <select 
                  value={order.payment_status}
                  onChange={(e) => updatePaymentStatus(e.target.value)}
                  className="h-8 px-2 text-xs border border-border rounded bg-background uppercase font-medium tracking-wider"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipment & Tracking */}
          <div className="bg-background border border-border p-6 rounded-lg shadow-sm">
            <h3 className="font-serif text-lg font-medium flex items-center gap-2 mb-4">
              <Truck className="size-5 text-muted-foreground" /> Shipment Tracking
            </h3>
            <form onSubmit={saveShipment} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Delivery Partner</label>
                <input 
                  required 
                  placeholder="e.g. FedEx, Delhivery" 
                  value={deliveryPartner} 
                  onChange={e => setDeliveryPartner(e.target.value)} 
                  className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none focus:border-foreground bg-background" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Tracking Number</label>
                <input 
                  required 
                  value={trackingNumber} 
                  onChange={e => setTrackingNumber(e.target.value)} 
                  className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none focus:border-foreground bg-background" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Tracking URL (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://" 
                  value={trackingUrl} 
                  onChange={e => setTrackingUrl(e.target.value)} 
                  className="w-full h-9 px-3 text-sm border border-border rounded focus:outline-none focus:border-foreground bg-background" 
                />
              </div>
              <Button type="submit" disabled={shipmentLoading} className="w-full bg-foreground text-background">
                {shipmentLoading ? 'Saving...' : order.shipment ? 'Update Tracking' : 'Create Shipment'}
              </Button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
