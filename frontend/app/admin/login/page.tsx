'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-provider'

export default function AdminLoginPage() {
  const { login, user, isLoading } = useAuth()
  const router = useRouter()
  
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (!isLoading) {
      if (user && user.role === 'admin') {
        router.push('/admin/dashboard')
      } else if (user && user.role !== 'admin') {
        router.push('/')
      }
    }
  }, [user, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await login(email, password)
      // The useEffect will handle redirection once user is populated
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-md bg-background border border-border p-8 rounded-lg shadow-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl tracking-widest uppercase font-bold text-foreground">AGY ADMIN</h1>
          <p className="text-muted-foreground mt-2 text-sm">Sign in to the administration panel</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-foreground mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-10 px-3 border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-wider font-medium text-foreground mb-2">
              Password
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-10 px-3 border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 mt-4 bg-foreground text-background text-xs tracking-widest uppercase hover:bg-primary transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
