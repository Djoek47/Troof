"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X, CheckCircle } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { CartItem } from "@/components/cart/cart-item"
import { Button } from "@/components/ui/button"
import { calculateCartTotal } from "@/lib/cart"

export function CartDrawer() {
  const router = useRouter()
  const { state, closeCart, localCartItems, migrateLocalCartToWallet, currentWalletId } = useCart()
  const { items, isOpen } = state

  const [printifyProducts, setPrintifyProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [prevCount, setPrevCount] = useState(items.length)

  useEffect(() => {
    const fetchPrintifyProducts = async () => {
      try {
        const res = await fetch("/api/printify-products")
        if (!res.ok) throw new Error("Failed to fetch Printify products")
        const data = await res.json()
        setPrintifyProducts(data)
      } catch (e) {
        setPrintifyProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchPrintifyProducts()
  }, [])

  useEffect(() => {
    if (isOpen && items.length > prevCount) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 770)
    }
    setPrevCount(items.length)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, isOpen])

  // Calculate total using real Printify prices
  const total = items.reduce((sum, item) => {
    const product = printifyProducts[item.id - 1]
    if (!product) return sum
    const variant = product.variants.find((v: any) => v.is_enabled) || product.variants[0]
    const price = variant.price || item.price
    return sum + price * item.quantity
  }, 0)

  const showMigrateButton = currentWalletId && localCartItems.length > 0;

  // Close cart when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart()
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      // Prevent scrolling when cart is open
      document.body.style.overflow = "hidden"
      // Add blur class to main content
      document.getElementById("main-content")?.classList.add("blur-effect")
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
      // Remove blur class when cart is closed
      document.getElementById("main-content")?.classList.remove("blur-effect")
    }
  }, [isOpen, closeCart])

  const handleCheckout = () => {
    closeCart()
    router.push("/checkout")
  }

  // Collect unique productIds from cart items
  const productIds = Array.from(new Set(items.map(item => item.id)));

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-70 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      ></div>

      {/* Cart drawer */}
      <div className="relative w-full max-w-md bg-dark-800 shadow-xl flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2 min-h-[32px]">
            {showSuccess ? (
              <>
                <CheckCircle className="h-6 w-6 text-green-500 animate-pulse" />
                <span className="text-lg font-bold text-green-500 animate-fade-in">Added to Cart!</span>
              </>
            ) : (
              <h2 className="text-lg font-medium text-gray-100">Your Cart</h2>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-dark-900" />
          </button>
        </div>

        <div className="flex-grow overflow-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {showMigrateButton ? (
                 <p className="text-gray-400 mb-4">Your wallet cart is empty, but you have items in your local cart.</p>
              ) : (
                 <p className="text-gray-400 mb-4">Your cart is empty</p>
              )}
              <Button onClick={closeCart} variant="outline">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <CartItem key={`${item.id}-${item.size || ''}-${item.color || ''}`} item={item} printifyProducts={printifyProducts} closeCart={closeCart} />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
           {showMigrateButton && (
              <Button
                 onClick={migrateLocalCartToWallet}
                 className="w-full mb-4 bg-green-500 hover:bg-green-600 text-dark-900"
              >
                 Migrate Local Cart to Wallet
              </Button>
           )}

          {items.length > 0 && (
             <div className="flex justify-between mb-4">
               <span className="text-gray-300">Subtotal</span>
               <span className="text-gray-100 font-medium">${total.toFixed(2)}</span>
             </div>
          )}

          {items.length > 0 && (
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-dark-900" onClick={handleCheckout}>
              Checkout
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
