'use client'

import * as React from 'react'

import { Button } from '@/components/ui/button'
import { ProductBadge } from '@/components/ui/product-badge'
import { Rating } from '@/components/ui/rating'
import { Price } from '@/components/ui/price'
import { QuantitySelector } from '@/components/ui/quantity-selector'
import { SearchBar } from '@/components/ui/search-bar'
import { Modal, DialogClose } from '@/components/ui/modal'
import { toast } from '@/components/ui/sonner'

function Panel({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-5 border border-border bg-card p-6">
      <span className="text-[0.625rem] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-4">{children}</div>
    </div>
  )
}

export function ComponentGallery() {
  const [rating, setRating] = React.useState(4)

  return (
    <section id="system" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
            The Design System
          </span>
          <h2 className="max-w-2xl font-serif text-4xl leading-tight text-balance md:text-5xl">
            Reusable, considered components.
          </h2>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Every element shares the same restrained language — sharp corners,
            generous space and a single caramel accent.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Panel label="Buttons">
            <Button>Add to bag</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </Panel>

          <Panel label="Product Badges">
            <ProductBadge variant="accent">New</ProductBadge>
            <ProductBadge variant="solid">Bestseller</ProductBadge>
            <ProductBadge variant="sale">-30%</ProductBadge>
            <ProductBadge variant="outline">Organic</ProductBadge>
            <ProductBadge variant="soldout">Sold out</ProductBadge>
          </Panel>

          <Panel label="Rating (interactive)">
            <Rating value={rating} onRatingChange={setRating} />
            <Rating value={4.5} count={128} size="sm" />
          </Panel>

          <Panel label="Price">
            <Price amount={129} size="lg" />
            <Price amount={89} compareAt={129} />
          </Panel>

          <Panel label="Quantity Selector">
            <QuantitySelector defaultValue={1} />
            <QuantitySelector defaultValue={2} size="sm" />
          </Panel>

          <Panel label="Search Bar">
            <SearchBar
              containerClassName="w-full"
              onSubmit={(v) => toast(v ? `Searching “${v}”` : 'Type something first')}
            />
          </Panel>

          <Panel label="Toast Notifications">
            <Button
              variant="outline"
              onClick={() =>
                toast.success('Added to your bag', {
                  description: 'Cashmere Overcoat — Size M',
                })
              }
            >
              Success
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                toast('Added to wishlist', { description: 'We saved this for you.' })
              }
            >
              Default
            </Button>
            <Button
              variant="ghost"
              onClick={() => toast.error('Item is out of stock')}
            >
              Error
            </Button>
          </Panel>

          <Panel label="Modal">
            <Modal
              trigger={<Button variant="outline">Open dialog</Button>}
              title="Size Guide"
              description="Our pieces run true to size. Between sizes? Size down for a tailored fit."
              footer={
                <>
                  <DialogClose render={<Button variant="ghost">Close</Button>} />
                  <DialogClose
                    render={
                      <Button onClick={() => toast.success('Got it')}>Understood</Button>
                    }
                  />
                </>
              }
            >
              <div className="grid grid-cols-3 gap-px bg-border text-center text-xs">
                {[
                  ['Size', 'Chest', 'Waist'],
                  ['S', '36"', '30"'],
                  ['M', '40"', '34"'],
                  ['L', '44"', '38"'],
                ].map((row, i) => (
                  <React.Fragment key={i}>
                    {row.map((cell, j) => (
                      <div
                        key={j}
                        className={
                          'bg-card px-3 py-2.5 ' +
                          (i === 0
                            ? 'font-medium uppercase tracking-[0.1em] text-foreground'
                            : 'text-muted-foreground')
                        }
                      >
                        {cell}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </Modal>
          </Panel>
        </div>
      </div>
    </section>
  )
}
