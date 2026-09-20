import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/ui/product-card'
import { apiFetch } from '@/lib/apis/client'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const q = typeof params.q === 'string' ? params.q : ''

  let results: any[] = []
  
  try {
    // Fetch products from the backend with the search query
    // Since the API accepts 'search', we pass 'q' as 'search'
    const endpoint = q ? `/products/?search=${encodeURIComponent(q)}` : '/products/'
    results = await apiFetch(endpoint, {
      // Use next.js caching strategies as needed. We can use no-store for real-time search
      cache: 'no-store'
    })
  } catch (error) {
    console.error("Failed to fetch products:", error)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto max-w-[1400px] px-4 py-16 md:px-8 md:py-24">
          <div className="mb-10 flex flex-col gap-4">
            <h1 className="font-serif text-4xl leading-tight md:text-5xl">
              {q ? `Search results for "${q}"` : "All Products"}
            </h1>
            <p className="text-muted-foreground">
              {results.length} {results.length === 1 ? 'result' : 'results'} found.
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {results.map((p) => {
                // Get primary image or fallback
                const primaryImage = p.images?.find((img: any) => img.is_primary)?.image_url 
                                     || p.images?.[0]?.image_url 
                                     || "/placeholder.svg"

                const badges: Array<{ label: string; variant: any }> = []
                if (p.is_new_arrival) badges.push({ label: 'NEW', variant: 'accent' })
                if (p.is_best_seller) badges.push({ label: 'BEST SELLER', variant: 'solid' })
                if (p.compare_at_price > p.price) {
                  badges.push({ label: `-${Math.round((1 - p.price / p.compare_at_price) * 100)}%`, variant: 'sale' })
                }

                return (
                  <ProductCard 
                    key={p.id} 
                    id={p.id}
                    name={p.name}
                    price={p.price}
                    compareAt={p.compare_at_price}
                    image={primaryImage}
                    rating={p.rating}
                    reviewCount={p.review_count}
                    badge={badges}
                    href={`/products/${p.id}`}
                  />
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h3 className="text-2xl font-serif mb-4">No results found</h3>
              <p className="text-muted-foreground">Try adjusting your search or explore our popular collections.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
