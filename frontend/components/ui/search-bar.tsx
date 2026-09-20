'use client'

import * as React from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import Image from 'next/image'

import { cn } from '@/lib/utils'

export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSubmit'> {
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  containerClassName?: string
}

const popularSearches = [
  "Kurta Set",
  "Lehenga",
  "Men's Shirts",
  "Kids Party Wear"
]

import { apiFetch } from '@/lib/apis/client'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      className,
      containerClassName,
      placeholder = 'Search for pieces, collections…',
      defaultValue = '',
      onValueChange,
      onSubmit,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState(String(defaultValue))
    const debouncedValue = useDebounce(value, 400)
    const [isSearching, setIsSearching] = React.useState(false)
    const [results, setResults] = React.useState<any[]>([])

    const update = (v: string) => {
      setValue(v)
      onValueChange?.(v)
    }

    React.useEffect(() => {
      if (!debouncedValue.trim()) {
        setResults([])
        setIsSearching(false)
        return
      }

      setIsSearching(true)
      
      const fetchResults = async () => {
        try {
          const endpoint = `/products/?search=${encodeURIComponent(debouncedValue)}`
          const response = await apiFetch(endpoint)
          
          const mapped = response.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: `$${p.price}`,
            category: "Product",
            image: p.images?.find((img: any) => img.is_primary)?.image_url 
                   || p.images?.[0]?.image_url 
                   || "/placeholder.svg"
          }))
          
          setResults(mapped)
        } catch (error) {
          console.error("Search failed", error)
          setResults([])
        } finally {
          setIsSearching(false)
        }
      }
      
      fetchResults()
    }, [debouncedValue])

    return (
      <div className={cn('w-full max-w-2xl mx-auto flex flex-col gap-6', containerClassName)}>
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit?.(value)
          }}
          className={cn(
            'group flex h-12 items-center gap-3 border-b-2 border-border bg-transparent transition-colors focus-within:border-foreground',
          )}
        >
          <Search
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <input
            ref={ref}
            type="search"
            value={value}
            onChange={(e) => update(e.target.value)}
            placeholder={placeholder}
            className={cn(
              'w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none',
              className,
            )}
            {...props}
          />
          {isSearching ? (
             <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : value ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => update('')}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground p-1"
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          ) : null}
        </form>

        {value.trim() ? (
          <div className="flex flex-col gap-4 max-h-[22rem] overflow-y-auto pr-2 custom-scrollbar">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {isSearching ? 'Searching...' : `Results for "${debouncedValue}"`}
            </span>
            {!isSearching && results.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">No products found matching your search.</p>
            )}
            {!isSearching && results.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-4">
                {results.map((product) => (
                  <div key={product.id} className="group flex cursor-pointer flex-col gap-2">
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary rounded-sm">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">{product.category}</span>
                      <span className="text-sm font-medium text-foreground">{product.name}</span>
                      <span className="text-sm text-muted-foreground">{product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => update(term)}
                  className="rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-foreground transition-colors hover:border-foreground hover:bg-background"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  },
)
SearchBar.displayName = 'SearchBar'

export { SearchBar }
