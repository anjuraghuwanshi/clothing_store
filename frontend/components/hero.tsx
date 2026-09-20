import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto grid max-w-[1400px] items-stretch gap-0 md:grid-cols-2">
        {/* Copy */}
        <div className="order-2 flex flex-col justify-center gap-6 px-4 py-14 md:order-1 md:px-8 md:py-24 lg:px-16">
          <span className="text-[0.6875rem] uppercase tracking-[0.24em] text-muted-foreground">
            Autumn / Winter 2026
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] text-balance text-foreground md:text-6xl lg:text-7xl">
            Quiet luxury, made to be lived in.
          </h1>
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            A considered wardrobe for the whole family. Timeless silhouettes in
            natural fibres — for women, men and the little ones.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href="#women">
                Shop the collection
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="#journal">Read the journal</a>
            </Button>
          </div>
        </div>

        {/* Image */}
        <div className="relative order-1 min-h-[52vh] md:order-2 md:min-h-[80vh]">
          <Image
            src="/hero-editorial.png"
            alt="Two models wearing the Maison autumn winter collection in neutral tones"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
