"use client"

import { Button } from "@/components/ui/button"
import { HoodieCard } from "@/components/hoodie-card"
import { AutoSliderBanner } from "@/components/auto-slider-banner"
import { CartWrapper } from "@/components/cart-wrapper"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/printify-products")
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        setProducts(data)
      } catch (e: any) {
        setError(e.message || "Failed to load products")
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Helper: Categorize products by title or tags
  function categorizeProducts(products: any[]) {
    const categories = {
      Hoodies: [] as any[],
      "T-shirts": [] as any[],
      Caps: [] as any[],
      Other: [] as any[],
    };
    products.forEach((product) => {
      const title = product.name?.toLowerCase() || "";
      const tags = (product.tags || []).map((t: string) => t.toLowerCase());
      
      // More comprehensive hoodie detection
      if (title.includes("hoodie") || title.includes("hoody") || title.includes("sweatshirt") || 
          tags.includes("hoodie") || tags.includes("hoody") || tags.includes("sweatshirt") ||
          title.includes("pullover") || tags.includes("pullover")) {
        categories.Hoodies.push(product);
      } else if (title.includes("t-shirt") || title.includes("tee") || title.includes("tshirt") || 
                 tags.includes("t-shirt") || tags.includes("tee") || tags.includes("tshirt")) {
        categories["T-shirts"].push(product);
      } else if (title.includes("cap") || title.includes("hat") || title.includes("baseball") || 
                 tags.includes("cap") || tags.includes("hat") || tags.includes("baseball")) {
        categories.Caps.push(product);
      } else {
        // If we can't categorize it, let's check if it might be a hoodie by looking at the blueprint or other indicators
        // Many hoodies might not have "hoodie" in the name but are still hoodies
        if (product.blueprint_id && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(product.blueprint_id)) {
          // Common hoodie blueprint IDs - adjust these based on your actual Printify blueprints
          categories.Hoodies.push(product);
        } else {
          categories.Other.push(product);
        }
      }
    });
    return categories;
  }

  const categorized = categorizeProducts(products);

  return (
    <CartWrapper>
      <main id="main-content" className="flex min-h-screen flex-col items-center justify-between">
        <AutoSliderBanner />

        {/* Product Section */}
        <section id="product-section" className="w-full py-12 md:py-24 bg-dark-900">
          <div className="container mx-auto px-4">
            <h2 className="mb-8 text-3xl font-bold text-center text-gray-100 relative z-20">Metaverse Collection</h2>
            {loading ? (
              <div className="text-center text-gray-300">Loading products...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <>
                {Object.entries(categorized).map(([category, items]) =>
                  items.length > 0 ? (
                    <div key={category} className="mb-12">
                      <h3 className="text-2xl font-semibold text-yellow-400 mb-4 text-left pl-2">{category}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {items.map((product) => (
                          <HoodieCard key={product.id} {...product} />
                        ))}
                      </div>
                    </div>
                  ) : null
                )}
              </>
            )}
          </div>
        </section>

        {/* Brand Accent Section */}
        <section className="w-full py-16 bg-dark-800 relative z-20">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-block p-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg mb-8">
              <h3 className="text-2xl font-bold bg-dark-900 px-6 py-3 rounded-md">Metaverse to Reality</h3>
            </div>
            <p className="max-w-2xl mx-auto text-gray-300 mb-8">
              Bring your Faberland identity into the real world with our premium merchandise. Each piece connects to
              your digital assets in the metaverse.
            </p>
            <div className="flex justify-center gap-4">
              <div className="w-16 h-1 bg-yellow-500 rounded-full"></div>
              <div className="w-4 h-1 bg-yellow-500/50 rounded-full"></div>
              <div className="w-2 h-1 bg-yellow-500/30 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Second Banner Section - Fixed */}
        <section className="w-full bg-dark-900 relative">
          <div className="h-[500px] w-full relative overflow-hidden">
            {/* Video Background */}
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
              <source
                src="https://cdn.pixabay.com/vimeo/328218457/digital-20048.mp4?width=1280&hash=e9a5a1d7c72e0c2a9f4c5e4c1b9e3c0c0c0c0c0c"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>

            {/* Fallback Image (in case video doesn't load) */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://i.pinimg.com/originals/14/f4/35/14f435eaaf8d107cca5055ce150eaf47.gif"
                alt="Metaverse Banner"
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center p-6 z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
                Connect Your Digital Identity
              </h2>
              <p className="text-lg text-gray-300 mb-6 text-center max-w-2xl">
                Unlock exclusive in-game items and experiences with every purchase
              </p>
              <Link href="https://faberland.vercel.app/">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-dark-900">Explore Faberland</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Metaverse Connection Section */}
        <section className="w-full py-16 bg-dark-800 relative z-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h3 className="text-2xl font-bold mb-4 text-yellow-500">Connect Your Digital Identity</h3>
                <p className="text-gray-300 mb-6">
                  Each Faberstore item comes with a unique QR code that connects to your Faberland avatar. Unlock
                  exclusive in-game items and experiences with your purchase.
                </p>
                <Link href="https://faberland.vercel.app/">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-dark-900">Learn More</Button>
                </Link>
              </div>
              <div className="md:w-1/2 bg-dark-700 p-6 rounded-lg border border-yellow-500/20">
                <div className="aspect-video relative overflow-hidden rounded-md flex items-center justify-center">
                  <Image
                    src="/gpt.PNG"
                    alt="Metastore GPT"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </CartWrapper>
  )
}
