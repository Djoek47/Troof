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
        
        // Randomize the color display for each page load - only use main product images
        const randomizedData = data.map((product: any) => {
          if (product.images && product.images.length > 1) {
            // Filter to only main product images (not folded, reversed, behind, etc.)
            const mainImages = product.images.filter((img: any) => {
              const position = img.position?.toLowerCase() || ''
              // Only include front-facing, main product shots
              return position === 'front' || 
                     position === 'main' || 
                     position === 'default' ||
                     !position || // If no position specified, assume it's main
                     (img.is_default && (position === 'front' || !position))
            })
            
            if (mainImages.length > 0) {
              // Randomly select from main images only
              const randomImageIndex = Math.floor(Math.random() * mainImages.length)
              const randomImage = mainImages[randomImageIndex]
              
              return {
                ...product,
                image: randomImage.src, // Use random main image as default
                defaultImageIndex: randomImageIndex, // Store which image we're showing
                availableMainImages: mainImages // Store for future reference
              }
            }
          }
          return product
        })
        
        setProducts(randomizedData)
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
      <main id="main-content" className="flex min-h-screen flex-col items-center justify-between bg-white">
        <AutoSliderBanner />

        {/* Product Section */}
        <section id="product-section" className="w-full py-16 md:py-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-6 max-w-7xl">
                         <div className="text-center mb-16 relative">
               {/* Left Proof of Concept Logo */}
               <div className="absolute left-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
                 <div className="relative w-24 h-24 opacity-60">
                   <Image 
                     src="/Minimal_-_Artboard_2-removebg-preview.png" 
                     alt="Proof of Concept" 
                     fill 
                     className="object-contain" 
                   />
                 </div>
               </div>
               
               {/* Right Proof of Concept Logo */}
               <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden lg:block">
                 <div className="relative w-24 h-24 opacity-60">
                   <Image 
                     src="/Minimal_-_Artboard_2-removebg-preview.png" 
                     alt="Proof of Concept" 
                     fill 
                     className="object-contain" 
                   />
                 </div>
               </div>
               
               {/* Mobile Proof of Concept Logos */}
               <div className="flex justify-center items-center gap-8 mb-6 lg:hidden">
                 <div className="relative w-16 h-16 opacity-60">
                   <Image 
                     src="/Minimal_-_Artboard_2-removebg-preview.png" 
                     alt="Proof of Concept" 
                     fill 
                     className="object-contain" 
                   />
                 </div>
                 <div className="relative w-16 h-16 opacity-60">
                   <Image 
                     src="/Minimal_-_Artboard_2-removebg-preview.png" 
                     alt="Proof of Concept" 
                     fill 
                     className="object-contain" 
                   />
                 </div>
               </div>
               
               <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
                 Proof of Concept Collection
               </h2>
               <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                 Premium merchandise that bridges the digital and physical worlds
               </p>
             </div>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                <p className="mt-4 text-gray-600 text-lg">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <p className="text-red-500 text-lg">{error}</p>
              </div>
            ) : (
              <>
                {Object.entries(categorized).map(([category, items]) =>
                  items.length > 0 ? (
                    <div key={category} className="mb-20">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-medium text-gray-900">{category}</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-transparent ml-6"></div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
        <section className="w-full py-24 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
          <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
            {/* Left Faberland Logo */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
              <div className="relative w-20 h-20 opacity-40">
                <Image 
                  src="/v1-logo.png" 
                  alt="Faberland" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </div>
            
            {/* Right Faberland Logo */}
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
              <div className="relative w-20 h-20 opacity-40">
                <Image 
                  src="/v1-logo.png" 
                  alt="Faberland" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </div>
            
            {/* Mobile Faberland Logos */}
            <div className="flex justify-center items-center gap-8 mb-6 lg:hidden">
              <div className="relative w-12 h-12 opacity-60">
                <Image 
                  src="/v1-logo.png" 
                  alt="Faberland" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <div className="relative w-12 h-12 opacity-60">
                <Image 
                  src="/v1-logo.png" 
                  alt="Faberland" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </div>
            
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mb-8 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-tight">
              Metaverse to Reality
            </h3>
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto">
              Bring your Faberland identity into the real world with our premium merchandise. Each piece connects to
              your digital assets in the metaverse.
            </p>
            <div className="flex justify-center items-center gap-6">
              <div className="w-20 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"></div>
              <div className="w-12 h-1 bg-yellow-400/60 rounded-full"></div>
              <div className="w-6 h-1 bg-yellow-400/40 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Hero Video Section */}
        <section className="w-full bg-black relative">
          <div className="h-[600px] w-full relative overflow-hidden">
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
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 z-10">
              {/* Left Faberland Logo */}
              <div className="absolute left-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
                <div className="relative w-20 h-20 opacity-40">
                  <Image 
                    src="/v1-logo.png" 
                    alt="Faberland" 
                    fill 
                    className="object-contain" 
                  />
                </div>
              </div>
              
              {/* Right Faberland Logo */}
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block">
                <div className="relative w-20 h-20 opacity-40">
                  <Image 
                    src="/v1-logo.png" 
                    alt="Faberland" 
                    fill 
                    className="object-contain" 
                  />
                </div>
              </div>
              
              <div className="text-center max-w-4xl mx-auto">
                {/* Mobile Faberland Logos */}
                <div className="flex justify-center items-center gap-8 mb-6 lg:hidden">
                  <div className="relative w-12 h-12 opacity-60">
                    <Image 
                      src="/v1-logo.png" 
                      alt="Faberland" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                  <div className="relative w-12 h-12 opacity-60">
                    <Image 
                      src="/v1-logo.png" 
                      alt="Faberland" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-6xl font-light text-white mb-6 tracking-tight">
                  Connect Your Digital Identity
                </h2>
                <p className="text-xl md:text-2xl text-gray-200 mb-10 leading-relaxed max-w-3xl mx-auto">
                  Unlock exclusive in-game items and experiences with every purchase
                </p>
                <Link href="https://www.faber.land/discover">
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 text-lg font-medium rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                    Explore Faberland
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Metaverse Connection Section */}
        <section className="w-full py-24 bg-white">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-16">
              <div className="lg:w-1/2 relative">
                {/* Left Proof of Concept Logo */}
                <div className="absolute -left-8 -top-8 hidden lg:block">
                  <div className="relative w-16 h-16 opacity-30">
                    <Image 
                      src="/Minimal_-_Artboard_2-removebg-preview.png" 
                      alt="Proof of Concept" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                </div>
                
                {/* Mobile Proof of Concept Logos */}
                <div className="flex justify-center items-center gap-6 mb-6 lg:hidden">
                  <div className="relative w-12 h-12 opacity-60">
                    <Image 
                      src="/Minimal_-_Artboard_2-removebg-preview.png" 
                      alt="Proof of Concept" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                  <div className="relative w-12 h-12 opacity-60">
                    <Image 
                      src="/Minimal_-_Artboard_2-removebg-preview.png" 
                      alt="Proof of Concept" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-light text-gray-900 mb-6 tracking-tight">
                  Connect Your Digital Identity
                </h3>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Each Proof of Concept item comes with a unique QR code that connects to your Faberland avatar. Unlock
                  exclusive in-game items and experiences with your purchase.
                </p>
                <Link href="https://www.faber.land/">
                  <Button className="bg-gray-900 hover:bg-black text-white px-8 py-4 text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="lg:w-1/2 relative">
                {/* Right Proof of Concept Logo */}
                <div className="absolute -right-8 -top-8 hidden lg:block">
                  <div className="relative w-16 h-16 opacity-30">
                    <Image 
                      src="/Minimal_-_Artboard_2-removebg-preview.png" 
                      alt="Proof of Concept" 
                      fill 
                      className="object-contain" 
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl transform rotate-3"></div>
                  <div className="relative bg-white p-8 rounded-3xl shadow-2xl border border-gray-100">
                    <div className="aspect-video relative overflow-hidden rounded-2xl flex items-center justify-center bg-gray-50">
                      <Image
                        src="/gpt.PNG"
                        alt="Metastore GPT"
                        fill
                        className="object-contain"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onLoad={() => {
                          console.log('Image loaded successfully on mobile');
                          // Force re-render for mobile Safari
                          const img = document.querySelector('img[alt="Metastore GPT"]') as HTMLImageElement;
                          if (img) {
                            img.style.display = 'block';
                            img.style.visibility = 'visible';
                            img.style.opacity = '1';
                          }
                        }}
                        onError={(e) => {
                          console.log('Image failed to load on mobile:', e);
                          // Try alternative image sources
                          const target = e.currentTarget as HTMLImageElement;
                          if (target.src.includes('gpt.PNG')) {
                            target.src = '/placeholder.svg';
                            target.style.display = 'block';
                            target.style.visibility = 'visible';
                            target.style.opacity = '1';
                          }
                        }}
                        style={{
                          objectFit: 'contain',
                          width: '100%',
                          height: '100%',
                          display: 'block',
                          visibility: 'visible',
                          opacity: '1',
                          // Mobile Safari specific fixes
                          WebkitTransform: 'translateZ(0)',
                          transform: 'translateZ(0)',
                          WebkitBackfaceVisibility: 'hidden',
                          backfaceVisibility: 'hidden',
                        }}
                      />
                      {/* Fallback content for mobile */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl md:hidden">
                        <div className="text-center p-4">
                          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600">Metaverse Connection</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </CartWrapper>
  )
}
