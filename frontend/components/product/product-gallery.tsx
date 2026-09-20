'use client'

import * as React from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export interface ProductGalleryProps {
  images: string[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isZoomed, setIsZoomed] = React.useState(false)
  const [mousePos, setMousePos] = React.useState({ x: 50, y: 50 })

  React.useEffect(() => {
    setCurrentIndex(0)
  }, [images])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setMousePos({ x, y })
  }

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:gap-6">
      {/* Thumbnails */}
      <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 scrollbar-hide lg:w-20 xl:w-24 shrink-0">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "relative aspect-[3/4] w-16 lg:w-full shrink-0 overflow-hidden bg-secondary transition-all",
              currentIndex === index ? "ring-1 ring-primary ring-offset-1" : "opacity-70 hover:opacity-100"
            )}
            aria-label={`View image ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 64px, 96px"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div 
        className={cn(
          "relative aspect-[3/4] w-full overflow-hidden bg-secondary cursor-zoom-in group",
          isZoomed && "cursor-zoom-out"
        )}
        onClick={() => setIsZoomed(!isZoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={images[currentIndex]}
          alt={`${title} image ${currentIndex + 1}`}
          fill
          priority
          className={cn(
            "object-cover transition-transform duration-300 ease-out",
            isZoomed ? "scale-[2]" : "scale-100"
          )}
          style={{
            transformOrigin: isZoomed ? `${mousePos.x}% ${mousePos.y}%` : 'center',
          }}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    </div>
  )
}
