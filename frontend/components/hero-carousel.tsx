'use client'

import * as React from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

type TextPosition = 'left' | 'right' | 'bottom-left' | 'bottom-right' | 'center'

interface SlideData {
  id: number
  eyebrow: string
  title: string
  description: string
  image: string
  cta: string
  href: string
  textPosition: TextPosition
  theme: 'light' | 'dark' // Determines text color (dark text on light bg, or light text on dark bg)
}

const slides: SlideData[] = [
  {
    id: 1,
    eyebrow: 'LIMITED TIME',
    title: 'FESTIVE\nSPECIAL',
    description: 'Up to 40% Off selected styles',
    image: '/hero_festive_special.jpg',
    cta: 'SHOP THE SALE',
    href: '#sale',
    textPosition: 'right',
    theme: 'light', 
  },
  {
    id: 2,
    eyebrow: 'NEW ARRIVALS',
    title: 'WINTER\nEDIT',
    description: 'Quiet luxury, made to be lived in.',
    image: '/hero_season_sale.jpg',
    cta: 'EXPLORE',
    href: '#winter',
    textPosition: 'bottom-left',
    theme: 'light',
  },
  {
    id: 3,
    eyebrow: 'THE COLLECTION',
    title: 'MODERN\nTAILORING',
    description: 'Sharp lines and premium fabrics.',
    image: '/hero_men_fashion.jpg',
    cta: 'SHOP MEN',
    href: '#men',
    textPosition: 'bottom-right',
    theme: 'light',
  },
  {
    id: 4,
    eyebrow: 'LITTLE ONES',
    title: 'PLAYFUL\nESSENTIALS',
    description: 'Comfort meets style for every adventure.',
    image: '/hero_kids.jpg',
    cta: 'SHOP KIDS',
    href: '#kids',
    textPosition: 'bottom-left',
    theme: 'light',
  },
]

// Adjust last slide to bottom-left
slides[3].textPosition = 'left'

const positionClasses: Record<TextPosition, string> = {
  'left': 'justify-center items-start text-left pt-24 md:pt-0',
  'right': 'justify-center items-end text-left pt-24 md:pt-0',
  'bottom-left': 'justify-end items-start text-left pb-32 md:pb-24',
  'bottom-right': 'justify-end items-end text-left pb-32 md:pb-24',
  'center': 'justify-center items-center text-center',
}

const contentAlignment: Record<TextPosition, string> = {
  'left': 'items-start text-left',
  'right': 'items-start text-left', // Even on right side, text block aligns left internally
  'bottom-left': 'items-start text-left',
  'bottom-right': 'items-start text-left',
  'center': 'items-center text-center',
}

export function HeroCarousel() {
  const [current, setCurrent] = React.useState(0)
  const [isPaused, setIsPaused] = React.useState(false)

  React.useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
    }, 6000)
    return () => clearInterval(timer)
  }, [isPaused])

  const next = () => setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
  const prev = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1))

  const controlColorClass = 'text-white border-white/30 hover:bg-white/20 bg-black/20';
  const dotActiveColor = 'bg-white';
  const dotInactiveColor = 'bg-white/40 hover:bg-white/60';

  return (
    <section 
      className="relative w-full h-[80svh] md:h-[85vh] overflow-hidden bg-[#f4f4f4]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === current;
        const textColorClass = slide.theme === 'light' ? 'text-black' : 'text-white';
        const borderColorClass = slide.theme === 'light' ? 'border-black' : 'border-white';
        
        return (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-1000 ease-in-out',
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            )}
          >
            {/* Image with subtle continuous zoom */}
            <div className={cn("absolute inset-0 transition-transform duration-[10000ms] ease-out", isActive ? "scale-105" : "scale-100")}>
              <Image
                src={slide.image}
                alt={slide.title.replace('\n', ' ')}
                fill
                priority={index === 0}
                className="object-cover"
                sizes="100vw"
                quality={90}
              />
            </div>
            
            {/* 
              Subtle gradient overlay only at the edges to ensure nav visibility, 
              but avoiding the heavy generic center overlay 
            */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20" aria-hidden="true" />
            
            {/* Content Container mapped to position */}
            <div className={cn(
              "absolute inset-0 flex flex-col p-8 md:px-24",
              positionClasses[slide.textPosition]
            )}>
              <div className={cn(
                "flex flex-col max-w-lg transition-all duration-1000 delay-300",
                contentAlignment[slide.textPosition],
                isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                textColorClass
              )}>
                <span className="text-xs md:text-sm font-semibold tracking-[0.2em] uppercase mb-4 opacity-80">
                  {slide.eyebrow}
                </span>
                
                <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6 whitespace-pre-line text-balance drop-shadow-sm">
                  {slide.title}
                </h1>
                
                <p className="text-sm md:text-base font-light tracking-wide opacity-90 mb-8 max-w-sm drop-shadow-sm">
                  {slide.description}
                </p>
                
                <a 
                  href={slide.href}
                  className={cn(
                    "group flex items-center gap-4 text-xs md:text-sm font-medium tracking-[0.15em] uppercase border-b pb-2 transition-all hover:gap-6",
                    borderColorClass
                  )}
                >
                  {slide.cta}
                  <ArrowRight className="size-4" strokeWidth={1.5} />
                </a>
              </div>
            </div>
          </div>
        )
      })}

      {/* Elegant Minimal Controls */}
      <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={prev}
          className={cn("flex size-12 md:size-12 items-center justify-center rounded-full border transition-opacity active:opacity-60", controlColorClass)}
          aria-label="Previous slide"
        >
          <ArrowLeft className="size-5 md:size-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={next}
          className={cn("flex size-12 md:size-12 items-center justify-center rounded-full border transition-opacity active:opacity-60", controlColorClass)}
          aria-label="Next slide"
        >
          <ArrowRight className="size-5 md:size-4" strokeWidth={1.5} />
        </button>
      </div>

      {/* Elegant Pagination */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={cn(
              'h-0.5 transition-all duration-500 rounded-full',
              index === current ? cn('w-8', dotActiveColor) : cn('w-3', dotInactiveColor)
            )}
          />
        ))}
      </div>
    </section>
  )
}
