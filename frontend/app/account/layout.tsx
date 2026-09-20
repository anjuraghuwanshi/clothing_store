'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { cn } from '@/lib/utils'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, login, signup, logout } = useAuth()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)
  const [isLogin, setIsLogin] = React.useState(true)
  
  // Auth Form State
  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [phone, setPhone] = React.useState('')

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1" />
        <Footer />
      </div>
    )
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (isLogin) {
      login(email, password)
    } else {
      signup(name, email,phone, password)
    }
  }

  // Not logged in -> Show Auth Screen
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 py-20">
          <div className="w-full max-w-sm">
            <h1 className="font-serif text-3xl md:text-4xl mb-2 text-center">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground text-center mb-8 text-sm">
              {isLogin 
                ? 'Sign in to access your account, orders and wishlist.' 
                : 'Join us to track orders, save addresses and more.'}
            </p>
            
            <form onSubmit={handleAuth} className="flex flex-col gap-4">
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 border border-border px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                  />
                </div>
              )}
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border border-border px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              
              {!isLogin && (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
      Phone Number
    </label>

    <input
      type="tel"
      required
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
      className="h-12 border border-border px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
      placeholder="Enter your phone number"
    />
  </div>
)}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border border-border px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                />
              </div>
              
              <Button type="submit" className="h-12 w-full uppercase tracking-widest text-xs mt-2 bg-foreground hover:bg-primary">
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Logged in -> Show Account Dashboard
  const navItems = [
    { label: 'Profile', href: '/account' },
    { label: 'Orders', href: '/account/orders' },
    { label: 'Addresses', href: '/account/addresses' },
    { label: 'Wishlist', href: '/wishlist' },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 bg-[#faf7f2]">
        <div className="mx-auto max-w-[1400px] px-4 py-12 md:px-8 md:py-16">
          <div className="mb-10 flex flex-col gap-2">
            <h1 className="font-serif text-3xl md:text-4xl text-foreground">My Account</h1>
            <p className="text-muted-foreground text-sm">Welcome back, {user.fullname}.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 lg:gap-16">
            {/* Sidebar Navigation */}
            <aside className="w-full md:w-64 shrink-0">
              <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "whitespace-nowrap px-4 py-3 text-sm transition-colors",
                        isActive 
                          ? "bg-foreground text-background font-medium" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}
                <button
                  onClick={logout}
                  className="whitespace-nowrap px-4 py-3 text-sm text-left text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent transition-colors mt-2"
                >
                  Logout
                </button>
              </nav>
            </aside>
            
            {/* Main Content Area */}
            <div className="flex-1 max-w-4xl min-w-0">
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
