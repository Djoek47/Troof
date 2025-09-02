"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { EnhancedCheckoutForm } from "@/components/checkout/enhanced-checkout-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Shield } from "lucide-react"
import Image from "next/image"

export default function CheckoutPage() {
  const { state } = useCart()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [printifyProducts, setPrintifyProducts] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch Printify products for mapping
  useEffect(() => {
    const fetchPrintifyProducts = async () => {
      try {
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
        const res = await fetch(`${baseUrl}/api/printify-products`)
        if (!res.ok) throw new Error("Failed to fetch Printify products")
        const data = await res.json()
        setPrintifyProducts(data)
      } catch (e) {
        setPrintifyProducts([])
      }
    }
    fetchPrintifyProducts()
  }, [])

  // Redirect if cart is empty
  useEffect(() => {
    if (mounted && state.items.length === 0) {
      router.push("/")
    }
  }, [mounted, state.items.length, router])

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Your cart is empty</h1>
          <p className="text-gray-400 mb-6">Add some items to your cart before checking out.</p>
          <Button onClick={() => router.push("/")} variant="outline">
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  // Enhanced Helper: Map cart item to Printify product/variant with intelligent color-to-image mapping
  function getPrintifyProductInfo(item: any) {
    console.log(`[Checkout] Processing item:`, item)
    console.log(`[Checkout] Printify products count:`, printifyProducts.length)
    
    // If we have a variant image stored, use it (this ensures color accuracy)
    if (item.variantImage) {
      console.log(`[Checkout] Using stored variant image:`, item.variantImage)
      return {
        name: item.name,
        image: item.variantImage,
        price: item.price,
        size: item.size,
        color: item.color,
      }
    }
    
    const product = printifyProducts[item.id - 1]
    console.log(`[Checkout] Found product for ID ${item.id}:`, product)
    
    if (!product) {
      console.log(`[Checkout] No product found, using fallback`)
      return { name: item.name, image: item.image1, price: item.price, size: item.size, color: item.color }
    }
    
    // Strategy 1: Use Printify's variant ID system for exact color matching
    const colorName = item.color
    const colorNameLower = colorName?.toLowerCase()
    
    console.log(`[Checkout] Looking for color: ${colorName}`)
    console.log(`[Checkout] Product options:`, product.options)
    console.log(`[Checkout] Product variants:`, product.variants)
    console.log(`[Checkout] Product images:`, product.images)
    
    if (colorName && product.options) {
      // Find the color option
      const colorOption = product.options.find((opt: any) => 
        opt.name && opt.name.toLowerCase().includes('color')
      )
      
      if (colorOption && colorOption.values) {
        // Find the selected color value
        const selectedColorValue = colorOption.values.find((val: any) => 
          val.title && val.title.toLowerCase() === colorNameLower
        )
        
        if (selectedColorValue) {
          console.log(`Looking for variant with color: ${selectedColorValue.title} (ID: ${selectedColorValue.id})`)
          
          // Strategy 1a: Try to find a variant that has this color ID in its options
          const matchingVariant = product.variants?.find((variant: any) => {
            if (variant.originalVariant && variant.originalVariant.options) {
              // Check if this variant contains the color ID
              return variant.originalVariant.options.includes(selectedColorValue.id)
            }
            return false
          })
          
          if (matchingVariant) {
            console.log(`Found variant ${matchingVariant.id} that matches color ${selectedColorValue.title}`)
            
            // Now find the best image for this variant
            const variantImages = product.images?.filter((img: any) => 
              img.variant_ids.includes(matchingVariant.id)
            ) || []
            
            if (variantImages.length > 0) {
              // Prefer front-facing images over folded/back views
              const frontImage = variantImages.find((img: any) => 
                img.src.includes('front') || 
                img.src.includes('main') || 
                !img.src.includes('folded') && !img.src.includes('back')
              )
              
              if (frontImage) {
                console.log(`Using front-facing variant image:`, frontImage.src)
                // Convert price from cents to dollars if needed
                let price;
                if (matchingVariant?.price) {
                  if (matchingVariant.price > 1000) {
                    price = matchingVariant.price / 100; // Convert cents to dollars
                  } else {
                    price = matchingVariant.price; // Already in dollars
                  }
                } else {
                  price = item.price;
                }
                
                return {
                  name: product.name,
                  image: frontImage.src,
                  price: price,
                  size: item.size,
                  color: item.color,
                }
              } else {
                // Use any variant image if no front-facing one found
                console.log(`Using variant image:`, variantImages[0].src)
                // Convert price from cents to dollars if needed
                let price;
                if (matchingVariant?.price) {
                  if (matchingVariant.price > 1000) {
                    price = matchingVariant.price / 100; // Convert cents to dollars
                  } else {
                    price = matchingVariant.price; // Already in dollars
                  }
                } else {
                  price = item.price;
                }
                
                return {
                  name: product.name,
                  image: variantImages[0].src,
                  price: price,
                  size: item.size,
                  color: item.color,
                }
              }
            }
          }
        }
      }
    }
    
    // Strategy 2: Fallback to intelligent color-to-image mapping
    const availableImages = product.images?.filter((img: any) => img.variant_ids.length > 0) || []
    
    if (availableImages.length > 0) {
      // First, try to find an image that contains the color name in its URL
      const colorMatchingImage = availableImages.find((img: any) => {
        const imgSrc = img.src.toLowerCase()
        const colorNameLower = colorName?.toLowerCase()
        
        if (!colorNameLower) return false
        
        // Check if the image URL contains the color name
        if (imgSrc.includes(colorNameLower)) {
          return true
        }
        
        // Check for common color synonyms
        if (colorNameLower.includes('black') && (imgSrc.includes('black') || imgSrc.includes('dark'))) return true
        if (colorNameLower.includes('white') && (imgSrc.includes('white') || imgSrc.includes('light'))) return true
        if (colorNameLower.includes('red') && imgSrc.includes('red')) return true
        if (colorNameLower.includes('blue') && imgSrc.includes('blue')) return true
        if (colorNameLower.includes('green') && imgSrc.includes('green')) return true
        if (colorNameLower.includes('yellow') && imgSrc.includes('yellow')) return true
        if (colorNameLower.includes('orange') && imgSrc.includes('orange')) return true
        if (colorNameLower.includes('purple') && imgSrc.includes('purple')) return true
        if (colorNameLower.includes('pink') && imgSrc.includes('pink')) return true
        if (colorNameLower.includes('brown') && imgSrc.includes('brown')) return true
        if (colorNameLower.includes('gray') && (imgSrc.includes('gray') || imgSrc.includes('grey'))) return true
        
        return false
      })
      
      if (colorMatchingImage) {
        console.log(`Found color-matching image URL:`, colorMatchingImage.src)
        return {
          name: product.name,
          image: colorMatchingImage.src,
          price: item.price,
          size: item.size,
          color: item.color,
        }
      }
      
      // Strategy 3: Use intelligent color-to-image mapping with preference for front-facing images
      const colorToImageIndex = (() => {
        const colorNameLower = colorName?.toLowerCase()
        
        if (!colorNameLower) return 0
        
        // Map colors to image positions based on color theory and common associations
        if (colorNameLower.includes('black') || colorNameLower.includes('dark')) return 0
        if (colorNameLower.includes('white') || colorNameLower.includes('light')) return 1
        if (colorNameLower.includes('red')) return 2
        if (colorNameLower.includes('blue')) return 3
        if (colorNameLower.includes('green')) return 4
        if (colorNameLower.includes('yellow')) return 5
        if (colorNameLower.includes('orange')) return 6
        if (colorNameLower.includes('purple')) return 7
        if (colorNameLower.includes('pink')) return 8
        if (colorNameLower.includes('brown')) return 9
        if (colorNameLower.includes('gray') || colorNameLower.includes('grey')) return 10
        
        // For other colors, use a hash-based fallback
        return Math.abs(colorNameLower.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % availableImages.length
      })()
      
      // Prefer front-facing images over folded/back views
      const frontImages = availableImages.filter((img: any) => 
        img.src.includes('front') || 
        img.src.includes('main') || 
        !img.src.includes('folded') && !img.src.includes('back')
      )
      
      const imagesToUse = frontImages.length > 0 ? frontImages : availableImages
      const imageIndex = colorToImageIndex % imagesToUse.length
      const selectedImage = imagesToUse[imageIndex]
      
      console.log(`Using intelligent color-to-image mapping: ${colorName} -> index ${colorToImageIndex} -> image ${imageIndex}`)
      console.log(`Selected image:`, selectedImage.src)
      console.log(`Image type: ${frontImages.length > 0 ? 'front-facing' : 'any available'}`)
      
      return {
        name: product.name,
        image: selectedImage.src,
        price: item.price,
        size: item.size,
        color: item.color,
      }
    }
    
    // Strategy 4: Fallback to default image
    console.log(`No suitable image found for color ${colorName}, using default image`)
    return {
      name: product.name,
      image: product.images?.[0]?.src || item.image1 || "/placeholder.svg",
      price: item.price,
      size: item.size,
      color: item.color,
    }
  }

  // Calculate total using real Printify prices
  function calculateTotal() {
    return state.items.reduce((total, item) => {
      const info = getPrintifyProductInfo(item)
      return total + (info.price * item.quantity)
    }, 0)
  }

  const isLoadingProducts = printifyProducts.length === 0

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 max-w-7xl py-12">
        {/* Back to Store button */}
        <div className="mb-8">
          <Button 
            onClick={() => router.push("/")} 
            className="font-medium py-3 px-6 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-gray-900 hover:bg-black text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left: Order Summary Sidebar */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full lg:w-2/5 max-w-md shadow-xl">
            <h2 className="text-2xl font-light text-gray-900 mb-8 tracking-tight">Your Order</h2>
          {isLoadingProducts ? (
            <div className="space-y-6 mb-8 animate-pulse">
              {[1,2,3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl" />
              ))}
              <div className="h-8 bg-gray-100 rounded-2xl w-1/2 mt-6" />
            </div>
          ) : (
            <>
              <div className="space-y-6 mb-8">
                {state.items.map((item) => {
                  const info = getPrintifyProductInfo(item)
                  return (
                    <div
                      key={item.id + (info.size || "") + (typeof (item as any).color === 'string' ? (item as any).color : "")}
                      className="flex items-center space-x-4 bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300"
                    >
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={info.image || "/placeholder.svg"}
                          alt={info.name}
                          fill
                          className="object-cover rounded-xl"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate text-lg">{info.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        {item.size && <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>}
                        {item.color && <p className="text-xs text-gray-500 mt-0.5">Color: {item.color}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-lg">${(info.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Total */}
              <div className="flex justify-between items-center border-t border-gray-200 pt-6 mt-4">
                <span className="text-xl font-light text-gray-900">Total</span>
                <span className="text-2xl font-light text-gray-900">${calculateTotal().toFixed(2)}</span>
              </div>
            </>
          )}
          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 my-6">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-green-800 font-medium text-lg">Secure Payment</span>
            </div>
            <p className="text-green-700 text-sm leading-relaxed">
              Your payment is processed securely by Printify. We never store your payment information.
            </p>
          </div>
          {/* Printify Notice */}
          <div className="bg-blue-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="text-blue-800 font-medium text-lg mb-3">Print-on-Demand Service</h4>
            <p className="text-blue-700 text-sm leading-relaxed">
              Your items will be printed and shipped directly from Printify's production facilities. This ensures the
              highest quality and fastest delivery times.
            </p>
          </div>
        </div>
      </div>

        {/* Right: Shipping/Payment Form (dominant) */}
        <div className="flex-1 flex flex-col gap-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full shadow-xl">
            <h1 className="text-3xl font-light text-gray-900 mb-8 flex items-center gap-4 tracking-tight">
              <Shield className="w-5 h-5 text-green-600" />
              Secure Checkout
            </h1>
            <EnhancedCheckoutForm />
          </div>
        </div>
      </div>
    </div>
  )
}
