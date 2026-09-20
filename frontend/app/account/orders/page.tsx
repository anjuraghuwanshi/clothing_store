'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { Price } from '@/components/ui/price'
import { Package, ChevronRight, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function OrdersPage() {
  const { user, cancelOrder } = useAuth()

  if (!user) return null
  const orders = user.orders || []

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'text-success'
      case 'Cancelled': return 'text-destructive'
      default: return 'text-primary'
    }
  }

  const getStatusSteps = (currentStatus: string) => {
    const allSteps = ['Placed', 'Confirmed', 'Shipped', 'Delivered']
    if (currentStatus === 'Cancelled') return []
    
    const currentIndex = allSteps.indexOf(currentStatus)
    return allSteps.map((step, index) => ({
      label: step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }))
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="font-serif text-2xl border-b border-border pb-4">My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-secondary/30">
          <Package className="size-12 mx-auto text-muted-foreground mb-4 opacity-50" strokeWidth={1} />
          <h3 className="text-lg font-medium mb-2">No orders yet</h3>
          <p className="text-muted-foreground mb-6 text-sm">When you place an order, it will appear here.</p>
          <Button asChild className="uppercase tracking-widest text-xs h-10 px-8">
            <Link href="/">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {orders.map((order) => {
            const steps = getStatusSteps(order.status)
            return (
              <div key={order.id} className="border border-border bg-background">
                {/* Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6 bg-secondary/50 border-b border-border text-sm">
                  <div className="flex flex-wrap gap-x-8 gap-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="font-medium">{new Date(order.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total</p>
                      <Price amount={order.amount} className="font-medium" size="sm" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Order ID</p>
                      <p className="font-medium text-muted-foreground">#{order.id}</p>
                    </div>
                  </div>
                  <Button variant="link" className="px-0 text-xs uppercase tracking-widest text-foreground hover:text-primary">
                    View Invoice
                  </Button>
                </div>

                {/* Order Status Tracker */}
                {steps.length > 0 && (
                  <div className="p-4 sm:p-6 border-b border-border hidden sm:block">
                    <div className="relative flex justify-between">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-secondary" />
                      {steps.map((step, i) => (
                        <div key={step.label} className="relative flex flex-col items-center gap-2 bg-background px-2">
                          <div className={cn(
                            "size-3 rounded-full z-10 transition-colors",
                            step.completed ? "bg-foreground" : "bg-border"
                          )} />
                          <span className={cn(
                            "text-xs uppercase tracking-widest font-medium absolute top-6",
                            step.current ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-8" /> {/* Spacer for absolute labels */}
                  </div>
                )}

                {/* Order Items */}
                <div className="p-4 sm:p-6 flex flex-col gap-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className={cn("text-base font-medium", getStatusColor(order.status))}>
                      {order.status}
                    </h3>
                  </div>
                  
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-4 sm:gap-6">
                      <div className="relative aspect-[3/4] w-20 sm:w-24 bg-secondary shrink-0 overflow-hidden">
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <Link href={`/products/${item.id}`} className="font-medium text-sm hover:text-primary transition-colors">
                          {item.name}
                        </Link>
                        <p className="text-muted-foreground text-xs mt-1">Qty: {item.quantity}</p>
                        <Price amount={item.price} className="mt-2" size="sm" />
                      </div>
                      <div className="hidden sm:flex flex-col gap-2 justify-center shrink-0">
                        <Button variant="outline" className="text-xs h-9 uppercase tracking-widest w-40">
                          Track Order
                        </Button>
                        <Button variant="outline" className="text-xs h-9 uppercase tracking-widest w-40">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Mobile Actions */}
                  <div className="flex sm:hidden flex-col gap-2 mt-4">
                    <Button variant="outline" className="text-xs h-9 uppercase tracking-widest w-full">
                      Track Order
                    </Button>
                    <Button variant="outline" className="text-xs h-9 uppercase tracking-widest w-full">
                      View Details
                    </Button>
                  </div>
                  
                  {/* Cancel Order */}
                  {(order.status === 'Placed' || order.status === 'Confirmed') && (
                    <div className="mt-2 pt-4 border-t border-border/50">
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="text-xs text-destructive hover:opacity-80 flex items-center gap-1.5 transition-opacity"
                      >
                        <XCircle className="size-4" />
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
