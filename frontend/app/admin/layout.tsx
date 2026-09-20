'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Tags, ShoppingCart, Users, Package, Ticket, LogOut } from 'lucide-react'

import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

const sidebarNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Products", href: "/admin/products", icon: ShoppingBag },
  { title: "Categories", href: "/admin/categories", icon: Tags },
  { title: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { title: "Customers", href: "/admin/customers", icon: Users },
  { title: "Inventory", href: "/admin/inventory", icon: Package },
  { title: "Coupons", href: "/admin/coupons", icon: Ticket },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (mounted && !isLoading) {
      if (!user && pathname !== '/admin/login') {
        router.push('/admin/login')
      } else if (user && user.role !== 'admin' && pathname !== '/admin/login') {
        router.push('/')
      }
    }
  }, [user, isLoading, mounted, router, pathname])

  if (!mounted) return null

  // If on login page, don't show the sidebar layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Prevent flashing content if redirecting
  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <span className="font-serif text-xl tracking-wider uppercase font-bold text-foreground">AGY ADMIN</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === item.href 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.title}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={() => {
              logout()
              router.push('/admin/login')
            }}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-64">
        <header className="h-16 border-b border-border bg-background flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-medium text-foreground tracking-wide capitalize">
            {pathname.split('/').pop() || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Logged in as <strong className="text-foreground">{user.fullname}</strong></span>
          </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
