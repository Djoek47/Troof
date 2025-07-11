"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/context/cart-context"
import { EnhancedCheckoutForm } from "@/components/checkout/enhanced-checkout-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Shield } from "lucide-react"
import Image from "next/image"
import { getPrintifyProductId } from "@/data/products";

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
        // Fetch raw Printify products with real IDs for mapping
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/printify-products/raw`)
        if (!res.ok) throw new Error("Failed to fetch Printify products")
        const data = await res.json()
        setPrintifyProducts(data)
      } catch (e) {
        console.error("Failed to fetch Printify products:", e)
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

  // Helper: Map cart item to Printify product/variant and extract size/color labels
  function getPrintifyProductInfo(item: any) {
    // Use stable mapping: get the real Printify product ID from the mock ID
    const printifyProductId = getPrintifyProductId(item.id);
    if (!printifyProductId) {
      return { name: item.name, image: item.image1, price: item.price, size: item.size, color: item.color };
    }
    
    // Find the actual Printify product by its real ID
    const product = printifyProducts.find(p => p.id.toString() === printifyProductId);
    if (!product) {
      return { name: item.name, image: item.image1, price: item.price, size: item.size, color: item.color };
    }
    
    // Try to find the variant that matches both size and color
    let variant = product.variants[0]
    if (item.size || item.color) {
      variant = product.variants.find((v: any) => {
        if (!v.options || !Array.isArray(v.options)) return false;
        
        let matches = true
        if (item.size) {
          matches = matches && v.options.some((o: any) => o && o.value === item.size)
        }
        if (item.color) {
          matches = matches && v.options.some((o: any) => o && o.value === item.color)
        }
        return matches
      }) || product.variants.find((v: any) => v.is_enabled) || product.variants[0]
    } else {
      variant = product.variants.find((v: any) => v.is_enabled) || product.variants[0]
    }
    // Extract size and color labels from variant options
    let sizeLabel = undefined
    let colorLabel = undefined
    if (variant.options && Array.isArray(variant.options)) {
      for (const opt of variant.options) {
        if (opt && opt.name && typeof opt.name === 'string') {
          if (opt.name.toLowerCase().includes('size')) sizeLabel = opt.value
          if (opt.name.toLowerCase().includes('color')) colorLabel = opt.value
        }
      }
    }
    return {
      name: product.name,
      image: product.images?.[0]?.src || item.image1 || "/placeholder.svg",
      price: (variant.price || item.price) / 100, // Convert cents to dollars
      size: sizeLabel,
      color: colorLabel,
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
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row gap-10 md:gap-16 items-start">
        {/* Back to Store button above Your Order */}
        <div className="absolute left-0 top-0 mt-8 ml-8 z-10">
          <Button onClick={() => router.push("/")} className="bg-yellow-500 hover:bg-yellow-600 text-dark-900 font-bold rounded-md px-6 py-2 shadow transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Store
          </Button>
        </div>
        {/* Left: Order Summary Sidebar */}
        <div className="bg-dark-800 rounded-lg p-6 w-full md:w-2/5 max-w-md mt-24">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Your Order</h2>
          {isLoadingProducts ? (
            <div className="space-y-4 mb-6 animate-pulse">
              {[1,2,3].map((i) => (
                <div key={i} className="h-20 bg-dark-700 rounded-lg" />
              ))}
              <div className="h-8 bg-dark-700 rounded w-1/2 mt-4" />
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {state.items.map((item) => {
                  const info = getPrintifyProductInfo(item)
                  return (
                    <div
                      key={item.id + (info.size || "") + (typeof (item as any).color === 'string' ? (item as any).color : "")}
                      className="flex items-center space-x-4 bg-dark-700 p-4 rounded-lg"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={info.image || "/placeholder.svg"}
                          alt={info.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-100 truncate">{info.name}</h3>
                        <p className="text-sm text-gray-400">Qty: {item.quantity}</p>
                        {item.size && <p className="text-xs text-gray-400 mt-1">Size: {item.size}</p>}
                        {item.color && <p className="text-xs text-gray-400 mt-0.5">Color: {item.color}</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-100">${(info.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Total */}
              <div className="flex justify-between items-center border-t border-dark-600 pt-4 mt-2">
                <span className="text-lg font-bold text-gray-100">Total</span>
                <span className="text-lg font-bold text-yellow-400">${calculateTotal().toFixed(2)}</span>
              </div>
            </>
          )}
          {/* Security Notice */}
          <div className="bg-green-900/20 border border-green-500 rounded-lg p-4 my-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Secure Payment</span>
            </div>
            <p className="text-green-300 text-sm">
              Your payment is processed securely by Printify. We never store your payment information.
            </p>
          </div>
          {/* Printify Notice */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <h4 className="text-blue-400 font-semibold mb-2">Print-on-Demand Service</h4>
            <p className="text-blue-300 text-sm">
              Your items will be printed and shipped directly from Printify's production facilities. This ensures the
              highest quality and fastest delivery times.
            </p>
          </div>
        </div>

        {/* Right: Shipping/Payment Form (dominant) */}
        <div className="flex-1 flex flex-col gap-8 mt-24">
          <div className="bg-dark-800 rounded-lg p-8 w-full">
            <h1 className="text-3xl font-bold text-gray-100 mb-6 flex items-center gap-4">
              <Shield className="w-5 h-5 text-green-400" />
              Secure Checkout
            </h1>
            <EnhancedCheckoutForm />
          </div>
        </div>
      </div>
    </div>
  )
}
