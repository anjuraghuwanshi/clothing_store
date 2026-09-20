'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AddressesPage() {
  const { user, addAddress, updateAddress, removeAddress, setDefaultAddress } = useAuth()
  
  const [isEditing, setIsEditing] = React.useState(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  
  // Form state
  const [fullName, setFullName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [addressLine, setAddressLine] = React.useState('')
  const [city, setCity] = React.useState('')
  const [state, setState] = React.useState('')
  const [pincode, setPincode] = React.useState('')
  const [isDefault, setIsDefault] = React.useState(false)

  if (!user) return null
  const addresses = user.addresses || []

  const handleAddNew = () => {
    setEditingId(null)
    setFullName('')
    setPhone('')
    setAddressLine('')
    setCity('')
    setState('')
    setPincode('')
    setIsDefault(addresses.length === 0)
    setIsEditing(true)
  }

  const handleEdit = (addr: any) => {
    setEditingId(addr.id)
    setFullName(addr.fullName)
    setPhone(addr.phone)
    setAddressLine(addr.address)
    setCity(addr.city)
    setState(addr.state)
    setPincode(addr.pincode)
    setIsDefault(addr.isDefault)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingId(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { fullName, phone, address: addressLine, city, state, pincode, isDefault }
    if (editingId) {
      updateAddress(editingId, payload)
    } else {
      addAddress(payload)
    }
    setIsEditing(false)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="font-serif text-2xl">Saved Addresses</h2>
        {!isEditing && (
          <Button onClick={handleAddNew} variant="outline" className="h-9 px-4 text-xs uppercase tracking-widest gap-2">
            <Plus className="size-3" /> Add New
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-secondary/30 p-6 sm:p-8 border border-border">
          <h3 className="font-serif text-xl mb-6">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Full Name</label>
                <input required type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Phone Number</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground" />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Address</label>
              <textarea required value={addressLine} onChange={e => setAddressLine(e.target.value)} className="min-h-[80px] border border-border bg-background p-3 text-sm focus:outline-none focus:border-foreground resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">City</label>
                <input required type="text" value={city} onChange={e => setCity(e.target.value)} className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">State</label>
                <input required type="text" value={state} onChange={e => setState(e.target.value)} className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Pincode</label>
                <input required type="text" value={pincode} onChange={e => setPincode(e.target.value)} className="h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-foreground" />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="default-addr" checked={isDefault} onChange={e => setIsDefault(e.target.checked)} className="size-4 accent-foreground" />
              <label htmlFor="default-addr" className="text-sm font-medium">Set as default address</label>
            </div>

            <div className="flex gap-4 mt-4">
              <Button type="submit" className="h-12 px-8 uppercase tracking-widest text-xs bg-foreground hover:bg-primary flex-1 sm:flex-none">
                Save Address
              </Button>
              <Button type="button" onClick={handleCancel} variant="outline" className="h-12 px-8 uppercase tracking-widest text-xs flex-1 sm:flex-none">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {addresses.length === 0 ? (
            <div className="text-center py-12 bg-secondary/30">
              <MapPin className="size-12 mx-auto text-muted-foreground mb-4 opacity-50" strokeWidth={1} />
              <h3 className="text-lg font-medium mb-2">No addresses saved</h3>
              <p className="text-muted-foreground mb-6 text-sm">Add an address so you can checkout faster.</p>
              <Button onClick={handleAddNew} className="uppercase tracking-widest text-xs h-10 px-8">
                Add New Address
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {addresses.map((addr) => (
                <div key={addr.id} className={cn(
                  "p-6 border flex flex-col h-full bg-background relative",
                  addr.isDefault ? "border-foreground" : "border-border"
                )}>
                  {addr.isDefault && (
                    <div className="absolute top-0 right-0 bg-foreground text-background text-[0.625rem] font-medium uppercase tracking-widest px-3 py-1 flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Default
                    </div>
                  )}
                  <h3 className="font-medium mb-1">{addr.fullName}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{addr.phone}</p>
                  
                  <div className="text-sm text-foreground/80 leading-relaxed mb-6 flex-1">
                    <p>{addr.address}</p>
                    <p>{addr.city}, {addr.state} {addr.pincode}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 border-t border-border pt-4 mt-auto">
                    <button onClick={() => handleEdit(addr)} className="text-xs uppercase tracking-widest font-medium text-foreground hover:text-primary flex items-center gap-1.5 transition-colors">
                      <Edit2 className="size-3.5" /> Edit
                    </button>
                    <span className="w-px h-3 bg-border" />
                    <button onClick={() => removeAddress(addr.id)} className="text-xs uppercase tracking-widest font-medium text-destructive hover:opacity-80 flex items-center gap-1.5 transition-opacity">
                      <Trash2 className="size-3.5" /> Delete
                    </button>
                    
                    {!addr.isDefault && (
                      <>
                        <span className="w-px h-3 bg-border" />
                        <button onClick={() => setDefaultAddress(addr.id)} className="text-xs uppercase tracking-widest font-medium text-muted-foreground hover:text-foreground transition-colors ml-auto">
                          Set Default
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
