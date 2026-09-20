'use client'

import * as React from 'react'
import Link from 'next/link'
import { Search, Eye, ArrowUpDown } from 'lucide-react'

import { apiFetch } from '@/lib/apis/client'
import { getToken } from '@/lib/auth/storage'
import { Button } from '@/components/ui/button'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [sortField, setSortField] = React.useState<'created_at' | 'total_spent' | 'total_orders'>('created_at')
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc')

  const fetchCustomers = React.useCallback(async () => {
    setLoading(true)
    try {
      const token = getToken()
      let url = `/admin/customers?limit=100`
      if (search) {
        url += `&search=${encodeURIComponent(search)}`
      }
      const data = await apiFetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCustomers(data)
    } catch (error) {
      console.error("Failed to fetch customers", error)
    } finally {
      setLoading(false)
    }
  }, [search])

  React.useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchCustomers()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchCustomers])

  const handleSort = (field: 'created_at' | 'total_spent' | 'total_orders') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const sortedCustomers = [...customers].sort((a, b) => {
    let valA = a[sortField]
    let valB = b[sortField]
    
    if (sortField === 'created_at') {
      valA = new Date(valA).getTime()
      valB = new Date(valB).getTime()
    }
    
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif">Customers</h1>
          <p className="text-muted-foreground mt-1 text-sm">View and manage your store's customer base.</p>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4 bg-muted/10">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search by Name, Email, or Phone..."
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
                <th className="px-6 py-4 font-medium">Customer Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">
                  <button onClick={() => handleSort('created_at')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                    Joined Date
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium text-center">
                  <button onClick={() => handleSort('total_orders')} className="flex items-center justify-center gap-1 hover:text-foreground transition-colors mx-auto">
                    Total Orders
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium text-right">
                  <button onClick={() => handleSort('total_spent')} className="flex items-center justify-end gap-1 hover:text-foreground transition-colors ml-auto">
                    Total Spent
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Loading customers...
                  </td>
                </tr>
              ) : sortedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No customers found.
                  </td>
                </tr>
              ) : (
                sortedCustomers.map((customer) => {
                  return (
                    <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{customer.fullname}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-foreground">{customer.email}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{customer.phone || 'No phone'}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {customer.total_orders}
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        ${customer.total_spent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                          <Link href={`/admin/customers/${customer.id}`}>
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
