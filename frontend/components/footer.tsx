'use client'

import { Button } from '@/components/ui/button'

const socials = ['Instagram', 'Twitter', 'YouTube']

const columns = [
  {
    title: 'Shop',
    links: ['Women', 'Men', 'Kids', 'New Arrivals', 'Sale'],
  },
  {
    title: 'Client Care',
    links: ['Contact', 'Shipping & Returns', 'Size Guide', 'Track Order', 'FAQ'],
  },
  {
    title: 'The House',
    links: ['Our Story', 'Sustainability', 'Careers', 'Stores', 'Press'],
  },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-14 md:grid-cols-2 md:items-center md:px-8">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-2xl md:text-3xl">Join the Maison</h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Receive early access to collections, private events and considered
              stories — direct to your inbox.
            </p>
          </div>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              placeholder="Email address"
              className="h-11 flex-1 border border-border bg-card px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-foreground"
            />
            <Button type="submit" size="default">
              Subscribe
            </Button>
          </form>
        </div>
      </div>

      {/* Links */}
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)] md:px-8">
        <div className="flex flex-col gap-4">
          <span className="font-serif text-2xl tracking-[0.2em]">MAISON</span>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Considered essentials and editorial pieces for men, women and kids —
            made to last, designed to be lived in.
          </p>
          <div className="mt-2 flex items-center gap-5">
            {socials.map((name) => (
              <a
                key={name}
                href="#"
                className="text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                {name}
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="flex flex-col gap-4">
            <h3 className="font-sans text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-foreground">
              {col.title}
            </h3>
            <ul className="flex flex-col gap-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground md:flex-row md:px-8">
          <p>© {new Date().getFullYear()} Maison. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy Policy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
