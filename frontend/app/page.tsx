'use client'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { HeroCarousel } from '@/components/hero-carousel'
import { FeaturedCarousel } from '@/components/featured-carousel'
import { CategoryCard } from '@/components/ui/category-card'
import { ProductCard } from '@/components/ui/product-card'
import { Button } from '@/components/ui/button'
import { Rating } from '@/components/ui/rating'

import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

const mainCollections = [
  {
    title: "Women",
    image: "/cat_women_western.png",
    cta: "Shop Women",
    href: "/category/women",
    categories: [
      { name: "Party Wear", href: "/category/women/party-wear" },
      { name: "Ethnic Wear", href: "/category/women/ethnic-wear" },
      { name: "Casual Wear", href: "/category/women/casual-wear" },
      { name: "Sports Wear", href: "/category/women/sports-wear" },
    ]
  },
  {
    title: "Men",
    image: "/cat_man_ethnic.webp",
    cta: "Shop Men",
    href: "/category/men",
    categories: [
      { name: "Party Wear", href: "/category/men/party-wear" },
      { name: "Ethnic Wear", href: "/category/men/ethnic-wear" },
      { name: "Casual Wear", href: "/category/men/casual-wear" },
      { name: "Sports Wear", href: "/category/men/sports-wear" },
    ]
  },
  {
    title: "Kids",
    image: "/cat_kids_casual.png",
    cta: "Shop Kids",
    href: "/category/kids",
    categories: [
      { name: "Party Wear", href: "/category/kids/party-wear" },
      { name: "Ethnic Wear", href: "/category/kids/ethnic-wear" },
      { name: "Casual Wear", href: "/category/kids/casual-wear" },
      { name: "Sports Wear", href: "/category/kids/sports-wear" },
    ]
  }
]

const reviews = [
  { name: 'Sarah J.', rating: 5, text: "The quality of the cashmere overcoat is absolutely exceptional. It's become a staple in my winter wardrobe." },
  { name: 'Michael T.', rating: 5, text: "Excellent fit and finish on the trousers. Customer service was also incredibly helpful with sizing." },
  { name: 'Emma W.', rating: 4.5, text: "Beautiful designs that feel timeless. I always get compliments when I wear their knitwear." },
]

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* 1. Hero Offer Carousel */}
        <HeroCarousel />

        {/* 2. Shop by Collection */}
        <section id="collections" className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div className="flex flex-col gap-3">
              <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                Shop by Collection
              </span>
              <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                Curated for you.
              </h2>
            </div>
            <Button asChild variant="link" className="hidden sm:inline-flex">
              <a href="#">View all collections</a>
            </Button>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
            {mainCollections.map((collection, i) => (
              <div key={i} className="group relative overflow-hidden aspect-[3/4] bg-secondary flex flex-col items-center justify-center text-center">
                <Image
                  src={collection.image}
                  alt={collection.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30 transition-opacity duration-300 group-hover:bg-black/50" />
                
                <div className="relative z-10 flex flex-col items-center w-full px-6 h-full justify-between py-16">
                  <h3 className="font-serif text-5xl md:text-6xl text-white tracking-widest uppercase mt-4">{collection.title}</h3>
                  
                  <div className="flex flex-col items-center gap-10 w-full mt-auto">
                    <div className="grid grid-cols-2 gap-3 w-full max-w-[280px]">
                      {collection.categories.map((cat, idx) => (
                        <a 
                          key={idx} 
                          href={cat.href}
                          className="text-white hover:text-black hover:bg-white transition-all text-[0.6875rem] font-bold uppercase tracking-widest px-2 py-3 border border-white/40 backdrop-blur-sm rounded-sm"
                        >
                          {cat.name}
                        </a>
                      ))}
                    </div>

                    <a 
                      href={collection.href}
                      className="flex items-center gap-2 text-white text-xs font-bold tracking-[0.2em] uppercase hover:opacity-70 transition-opacity group/cta"
                    >
                      <span>{collection.cta}</span>
                      <ArrowRight className="size-4 transform transition-transform group-hover/cta:translate-x-1" strokeWidth={2} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Featured / Trending Products */}
        <section id="trending" className="border-t border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
            <div className="mb-10 flex items-end justify-between gap-4">
              <div className="flex flex-col gap-3">
                <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                  Trending Now
                </span>
                <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                  Featured Products.
                </h2>
              </div>
              <Button asChild variant="link" className="hidden sm:inline-flex">
                <a href="#">Shop all</a>
              </Button>
            </div>
            
            <FeaturedCarousel />
          </div>
        </section>

        {/* 4. Promotional Banner */}
        <section className="border-t border-border bg-foreground text-background">
          <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-6 px-4 py-20 text-center md:px-8 md:py-28">
            <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-background/70">
              The Maison Promise
            </span>
            <h2 className="max-w-3xl font-serif text-4xl leading-tight text-balance text-background md:text-6xl">
              Fewer, better things — crafted to outlast the season.
            </h2>
            <Button asChild variant="outline" size="lg" className="border-background text-background hover:bg-background hover:text-foreground mt-2">
              <a href="#collections">Discover the story</a>
            </Button>
          </div>
        </section>

        

        {/* 6. Customer Reviews */}
        <section id="reviews" className="border-t border-border">
          <div className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
            <div className="mb-12 text-center flex flex-col items-center gap-3">
              <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
                Community
              </span>
              <h2 className="font-serif text-4xl leading-tight md:text-5xl">
                What our customers say.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((r, i) => (
                <div key={i} className="flex flex-col gap-4 bg-secondary p-8 rounded-sm">
                  <Rating value={r.rating} />
                  <p className="text-base leading-relaxed text-foreground flex-1">"{r.text}"</p>
                  <span className="text-sm font-medium tracking-wide uppercase text-muted-foreground">— {r.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Newsletter */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-2xl px-4 py-20 text-center md:py-24 flex flex-col items-center gap-6">
            <h2 className="font-serif text-3xl md:text-4xl">Join the Maison Family</h2>
            <p className="text-muted-foreground">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form className="mt-4 flex w-full max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 border-b border-border bg-transparent px-2 py-3 outline-none focus:border-foreground transition-colors"
                required
              />
              <Button type="submit" className="rounded-none px-6">Subscribe</Button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
