"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { EnhancedCheckoutForm } from "@/components/checkout/enhanced-checkout-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Shield } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
        
        // Force a re-render to ensure checkout displays updated data
        setTimeout(() => {
          setPrintifyProducts(prev => [...prev])
        }, 100)
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
    
    // PRIORITY 1: Use stored variant image for color accuracy (this ensures the correct color is shown)
    if (item.variantImage) {
      console.log(`[Checkout] Using stored variant image for color accuracy:`, item.variantImage)
      const product = printifyProducts[item.id - 1]
      if (product) {
        // Use Printify name and price, but keep the variant image for color accuracy
        const variant = product.variants?.find((v: any) => v.is_enabled) || product.variants?.[0];
        let price = variant?.price || 0;
        
        // Convert price from cents to dollars if needed
        if (price > 1000) {
          price = price / 100;
        }
        
        return {
          name: product.name,
          price: price,
          size: item.size,
          color: item.color,
          image: item.variantImage, // Keep the variant image for color accuracy
        };
      } else {
        // Fallback to item data if no Printify product found
        return {
          name: item.name,
          image: item.variantImage,
          price: item.price,
          size: item.size,
          color: item.color,
        }
      }
    }
    
    // PRIORITY 2: Use color matching logic when no variant image is available (same as CartItem)
    const product = printifyProducts[item.id - 1]
    if (product && item.color && product.options) {
      console.log(`[Checkout] Using color matching logic for item ${item.id} with color: ${item.color}`);
      
      // Find the color option
      const colorOption = product.options.find((opt: any) => 
        opt.name && opt.name.toLowerCase().includes('color')
      )
      
      if (colorOption && colorOption.values) {
        // Find the selected color value
        const selectedColorValue = colorOption.values.find((val: any) => 
          val.title && val.title.toLowerCase() === item.color.toLowerCase()
        )
        
        if (selectedColorValue) {
          console.log(`[Checkout] Found color value: ${selectedColorValue.title} (ID: ${selectedColorValue.id})`);
          
          // Find variant with this color
          const matchingVariant = product.variants?.find((variant: any) => {
            if (variant.originalVariant && variant.originalVariant.options) {
              return variant.originalVariant.options.includes(selectedColorValue.id)
            }
            return false
          })
          
          if (matchingVariant) {
            console.log(`[Checkout] Found matching variant: ${matchingVariant.id}`);
            
            // Find image for this variant
            const variantImages = product.images?.filter((img: any) => 
              img.variant_ids.includes(matchingVariant.id)
            ) || []
            
            if (variantImages.length > 0) {
              // Prefer front-facing images
              const frontImage = variantImages.find((img: any) => 
                img.src.includes('front') || 
                img.src.includes('main') || 
                !img.src.includes('folded') && !img.src.includes('back')
              )
              
              const selectedImage = frontImage ? frontImage.src : variantImages[0].src
              console.log(`[Checkout] Using color-matched image:`, selectedImage);
              
              // Use Printify data for name and price
              const variant = product.variants?.find((v: any) => v.is_enabled) || product.variants?.[0];
              let price = variant?.price || 0;
              
              // Convert price from cents to dollars if needed
              if (price > 1000) {
                price = price / 100;
              }
              
              return {
                name: product.name,
                price: price,
                size: item.size,
                color: item.color,
                image: selectedImage,
              };
            }
          }
        }
      }
    }
    
    // PRIORITY 3: Fallback to Printify data when no variant image or color matching is available
    if (product) {
      console.log(`[Checkout] Found Printify product for ID ${item.id}:`, product);
      
      // Use Printify data exclusively, ignore any mock data from the item
      const variant = product.variants?.find((v: any) => v.is_enabled) || product.variants?.[0];
      let price = variant?.price || 0;
      
      // Convert price from cents to dollars if needed
      if (price > 1000) {
        price = price / 100;
      }
      
      console.log(`[Checkout] Using Printify data exclusively for item ${item.id}:`, {
        name: product.name,
        price: price,
        originalItemName: item.name,
        originalItemPrice: item.price
      });
      
      // Return Printify data with item's size/color
      return {
        name: product.name,
        price: price,
        size: item.size,
        color: item.color,
        // Use Printify image if available, otherwise fallback
        image: product.images?.[0]?.src || "/placeholder.svg",
      };
    }
    
    // PRIORITY 4: Final fallback to item data
    console.log(`[Checkout] No Printify product found, using fallback`)
    return { name: item.name, image: item.image1, price: item.price, size: item.size, color: item.color }
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
        {/* Main Logo - Same as header */}
        <div className="flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <Image 
              src="/logo.png" 
              alt="Faberstore" 
              fill 
              className="object-contain" 
              priority
            />
          </div>
        </div>
        
        {/* Maintenance Notice - Below logo */}
        <div 
          className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 text-center cursor-pointer hover:bg-blue-100 transition-colors duration-200"
          onClick={() => {
            // This will trigger the modal from the parent layout
            const event = new CustomEvent('openMaintenanceModal');
            window.dispatchEvent(event);
          }}
        >
          <div className="flex items-center justify-center mb-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <span className="text-blue-600 text-lg">ℹ️</span>
            </div>
            <h3 className="text-blue-800 font-medium text-lg">Maintenance Update</h3>
          </div>
          <p className="text-blue-700 text-sm leading-relaxed max-w-2xl mx-auto">
            We're currently performing some maintenance to improve your experience. 
            <span className="text-blue-600 font-medium"> Click here for more details</span>.
          </p>
        </div>
        
        {/* Back to Store button */}
        <div className="mb-8">
          <Button 
            onClick={() => router.push("/")} 
            className="font-medium py-3 px-6 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left: Order Summary Sidebar */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full lg:w-1/3 max-w-md shadow-xl relative overflow-hidden">
            
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
                        <Link href={`/product/${item.id}`}>
                          <h3 className="font-medium text-gray-900 truncate text-lg hover:text-yellow-600 transition-colors cursor-pointer">{info.name}</h3>
                        </Link>
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
        <div className="flex-1 flex flex-col gap-8 relative">
          {/* Logo - Prominently displayed above the checkout form */}
          <div className="flex justify-center mb-8">
            <div className="relative w-60 h-60 opacity-90">
              <Image 
                src="/FaberlanD78.png" 
                alt="FaberlanD Logo" 
                fill 
                className="object-contain" 
                priority
              />
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-3xl p-8 w-full shadow-xl relative z-10">
            <div className="text-center mb-12">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
                Secure Checkout
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Your information is protected with bank-level security. Complete your purchase with confidence.
              </p>
            </div>
            <EnhancedCheckoutForm />
          </div>
        </div>
      </div>
    </div>
  )
}
