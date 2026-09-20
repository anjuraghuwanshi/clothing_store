"use client"

import * as React from "react"
import {
  Menu,
  X,
  Search as SearchIcon,
  ShoppingBag,
  User,
  Heart,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { SearchBar } from "@/components/ui/search-bar"
import { useWishlist } from "@/components/wishlist-provider"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"

const links = [
  { label: "Women", href: "/category/women" },
  { label: "Men", href: "/category/men" },
  { label: "Kids", href: "/category/kids" },
  { label: "Collections", href: "/#collections" },
  { label: "Journal", href: "#journal" },
]

export interface NavbarProps {
  // no longer needed
}

export function Navbar({}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)

  const router = useRouter()
  
  // Safely use context
  let wishlistItems = []
  try {
    const ctx = useWishlist()
    wishlistItems = ctx.items
  } catch (e) {
    // Fallback
  }
  const wishlistCount = wishlistItems.length

  let cartCount = 0
  try {
    const ctx = useCart()
    cartCount = ctx.cartCount
  } catch (e) {
    // Fallback
  }

  let user = null
  try {
    const ctx = useAuth()
    user = ctx.user
  } catch (e) {
    // Fallback
  }

  const handleSearchSubmit = (value: string) => {
    const trimmedValue = value.trim()

    if (!trimmedValue) return

    setSearchOpen(false)

    router.push(`/search?q=${encodeURIComponent(trimmedValue)}`)
  }

  // Prevent body scrolling when mobile menu is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [mobileOpen])

  return (
    <>
      {/* =========================================================
          DESKTOP + MOBILE NAVBAR
      ========================================================== */}

      <header className="sticky top-0 z-[100] w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="relative z-[101]">

          {/* =====================================================
              ANNOUNCEMENT BAR
          ====================================================== */}

          <div className="bg-foreground text-background">
            <p className="mx-auto flex h-9 max-w-[1400px] items-center justify-center px-4 text-center text-[0.6875rem] uppercase tracking-[0.16em]">
              Complimentary shipping on orders over $150
            </p>
          </div>

          {/* =====================================================
              MAIN NAVBAR
          ====================================================== */}

          <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-4 md:h-20 md:px-8">

            {/* =================================================
                LEFT SIDE
            ================================================== */}

            <div className="flex flex-1 items-center gap-6">

              {/* MOBILE MENU BUTTON */}

              <button
                type="button"
                aria-label="Open menu"
                aria-expanded={mobileOpen}
                className={cn(
                  "relative z-[110]",
                  "flex items-center justify-center",
                  "lg:hidden",
                  "p-3",
                  "-ml-3",
                  "touch-manipulation",
                  "select-none",
                  "transition-opacity",
                  "hover:opacity-80",
                  "active:opacity-60"
                )}
onClick={() => {
 
  setMobileOpen(true)
}}
              >
                <Menu
                  className="size-6 md:size-5"
                  strokeWidth={1.5}
                />
              </button>

              {/* DESKTOP NAVIGATION */}

              <nav
                className="hidden items-center gap-8 lg:flex"
                aria-label="Primary"
              >
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="p-1 text-xs font-medium uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* =================================================
                CENTER LOGO
            ================================================== */}

            <a
              href="/"
              aria-label="MAISON home"
              className="relative z-[110] shrink-0 font-serif text-2xl tracking-[0.2em] text-foreground transition-opacity hover:opacity-80 md:text-3xl"
            >
              MAISON
            </a>

            {/* =================================================
                RIGHT SIDE ACTIONS
            ================================================== */}

            <div className="flex flex-1 items-center justify-end gap-1 md:gap-5">

              {/* SEARCH */}

              <button
                type="button"
                aria-label="Search"
                aria-expanded={searchOpen}
                className={cn(
                  "relative z-[110]",
                  "flex items-center justify-center",
                  "p-3",
                  "touch-manipulation",
                  "select-none",
                  "text-foreground",
                  "transition-opacity",
                  "hover:text-primary",
                  "active:opacity-60"
                )}
                onClick={() => {
                  setSearchOpen((current) => !current)
                }}
              >
                <SearchIcon
                  className="size-6 md:size-5"
                  strokeWidth={1.5}
                />
              </button>

              {/* ACCOUNT */}

              <a
                href="/account"
                aria-label="Account"
                className="hidden items-center justify-center p-2 text-foreground transition-opacity hover:text-primary sm:flex"
              >
                {user ? (
                  <div className="flex size-7 items-center justify-center rounded-full bg-foreground text-xs text-background font-medium">
                    {user.fullname.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User
                    className="size-5"
                    strokeWidth={1.5}
                  />
                )}
              </a>

              {/* WISHLIST */}

              <a
                href="/wishlist"
                aria-label={`Wishlist, ${wishlistCount} items`}
                className="hidden relative items-center justify-center p-2 text-foreground transition-opacity hover:text-primary sm:flex"
              >
                <Heart
                  className="size-5"
                  strokeWidth={1.5}
                />
                {wishlistCount > 0 && (
                  <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[0.5625rem] font-medium text-primary-foreground">
                    {wishlistCount}
                  </span>
                )}
              </a>

              {/* CART */}

              <a
                href="/cart"
                aria-label={`Cart, ${cartCount} items`}
                className={cn(
                  "relative z-[110]",
                  "flex items-center justify-center",
                  "p-3",
                  "-mr-2 md:mr-0",
                  "touch-manipulation",
                  "text-foreground",
                  "transition-opacity",
                  "hover:text-primary",
                  "active:opacity-60"
                )}
              >
                <ShoppingBag
                  className="size-6 md:size-5"
                  strokeWidth={1.5}
                />

                {cartCount > 0 && (
                  <span className="absolute right-0 top-0 flex size-4 items-center justify-center rounded-full bg-primary text-[0.5625rem] font-medium text-primary-foreground md:-right-1 md:top-0">
                    {cartCount}
                  </span>
                )}
              </a>
            </div>
          </div>

          {/* =====================================================
              SEARCH PANEL
          ====================================================== */}

          <div
            className={cn(
              "overflow-hidden border-border",
              "transition-[max-height,opacity]",
              "duration-300",
              searchOpen
                ? "max-h-[28rem] border-t opacity-100"
                : "max-h-0 opacity-0"
            )}
          >
            <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-8">
              <SearchBar
                autoFocus={searchOpen}
                onSubmit={handleSearchSubmit}
              />
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE DRAWER
      ========================================================== */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[200] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >

          {/* =====================================================
              BACKDROP
          ====================================================== */}

          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 z-[200] cursor-default bg-foreground/40 touch-manipulation"
            onClick={() => {
              setMobileOpen(false)
            }}
          />

          {/* =====================================================
              DRAWER
          ====================================================== */}

          <aside
            className={cn(
              "absolute inset-y-0 left-0 z-[210]",
              "flex w-[82%] max-w-sm flex-col",
              "bg-background",
              "shadow-2xl"
            )}
          >

            {/* =================================================
                DRAWER HEADER
            ================================================== */}

            <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">

              <a
                href="/"
                className="font-serif text-xl tracking-[0.2em]"
                onClick={() => {
                  setMobileOpen(false)
                }}
              >
                MAISON
              </a>

              <button
                type="button"
                aria-label="Close menu"
                className="flex items-center justify-center p-3 touch-manipulation active:opacity-60"
                onClick={() => {
                  setMobileOpen(false)
                }}
              >
                <X
                  className="size-6"
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {/* =================================================
                MOBILE NAVIGATION
            ================================================== */}


            

            <nav
              className="flex flex-col overflow-y-auto p-4"
              aria-label="Mobile"
            >
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="border-b border-border py-5 font-serif text-lg text-foreground transition-colors hover:text-primary"
                  onClick={() => {
                    setMobileOpen(false)
                  }}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* =================================================
                BOTTOM ACTIONS
            ================================================== */}

            

            <div className="mt-auto shrink-0 border-t border-border p-4">

              <a
                href="/account"
                className="flex items-center gap-3 py-3 text-xs uppercase tracking-[0.12em]"
                onClick={() => {
                  setMobileOpen(false)
                }}
              >
                {user ? (
                  <div className="flex size-6 items-center justify-center rounded-full bg-foreground text-[0.6rem] text-background font-medium">
                    {user.fullname.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User
                    className="size-4"
                    strokeWidth={1.5}
                  />
                )}
                {user ? 'My Account' : 'Account'}
              </a>

              <a
                href="/wishlist"
                className="flex items-center justify-between py-3 text-xs uppercase tracking-[0.12em]"
                onClick={() => {
                  setMobileOpen(false)
                }}
              >
                <div className="flex items-center gap-3">
                  <Heart
                    className="size-4"
                    strokeWidth={1.5}
                  />
                  Wishlist
                </div>
                {wishlistCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[0.625rem] font-medium text-primary-foreground">
                    {wishlistCount}
                  </span>
                )}
              </a>
            </div>
          </aside>



          
        </div>
      )}
    </>
  )
}