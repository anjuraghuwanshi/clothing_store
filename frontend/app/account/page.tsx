'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { toast } from 'sonner'

export default function AccountProfilePage() {
  const { user, updateProfile } = useAuth()
  
  const [name, setName] = React.useState(user?.fullname || '')
  const [email, setEmail] = React.useState(user?.email || '')
  const [phone, setPhone] = React.useState(user?.phone || '')

  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')

  if (!user) return null

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ fullname: name, email, phone })
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword || !newPassword) return
    toast("Password updated successfully")
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <div className="flex flex-col gap-12">
      
      {/* Profile Info */}
      <section>
        <h2 className="font-serif text-2xl mb-6 border-b border-border pb-4">Profile Information</h2>
        <div className="flex items-center gap-6 mb-8">
          <div className="size-20 rounded-full bg-secondary flex items-center justify-center text-2xl font-serif text-muted-foreground border border-border">
            {user.fullname.charAt(0).toUpperCase()}
          </div>
          <div>
            <Button variant="outline" className="text-xs uppercase tracking-widest h-9 px-4">
              Change Avatar
            </Button>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="flex flex-col gap-6 max-w-lg">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <Button type="submit" className="w-fit h-12 px-8 uppercase tracking-widest text-xs bg-foreground hover:bg-primary">
            Save Changes
          </Button>
        </form>
      </section>

      {/* Change Password */}
      <section>
        <h2 className="font-serif text-2xl mb-6 border-b border-border pb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-6 max-w-lg">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <Button type="submit" variant="outline" className="w-fit h-12 px-8 uppercase tracking-widest text-xs border-foreground hover:bg-foreground hover:text-background">
            Update Password
          </Button>
        </form>
      </section>
      
    </div>
  )
}
