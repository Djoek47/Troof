"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { CartItem } from "@/components/cart/cart-item"
import { Button } from "@/components/ui/button"
import { calculateCartTotal } from "@/lib/cart"

export function CartDrawer() {
  const router = useRouter()
  const { state, closeCart, localCartItems, migrateLocalCartToWallet, currentWalletId, updateLocalCartWithPrintifyData } = useCart()
  const { items, isOpen } = state

  const [printifyProducts, setPrintifyProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0) // Force re-render when Printify data updates

  useEffect(() => {
    const fetchPrintifyProducts = async () => {
      try {
        const res = await fetch("/api/printify-products")
        if (!res.ok) throw new Error("Failed to fetch Printify products")
        const data = await res.json()
        setPrintifyProducts(data)
        
        // Update local cart items with Printify data when available
        updateLocalCartWithPrintifyData(data)
        
        // Dispatch custom event to notify other components about Printify data update
        window.dispatchEvent(new CustomEvent('printify-data-updated', { detail: data }))
        
        // Force a re-render of the cart drawer to show updated data
        setPrintifyProducts([...data])
        
        // Force a complete re-render by updating the refresh key
        setRefreshKey(prev => prev + 1)
      } catch (e) {
        setPrintifyProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchPrintifyProducts()
  }, [currentWalletId])

  // Calculate total using real Printify prices
  const total = items.reduce((sum, item) => {
    const product = printifyProducts[item.id - 1]
    console.log(`[Cart Drawer] Processing item ${item.id}:`, item);
    console.log(`[Cart Drawer] Found product:`, product);
    
    if (!product) {
      console.log(`[Cart Drawer] No product found, using fallback price: $${item.price}`);
      return sum + (item.price * item.quantity)
    }
    
    const variant = product.variants.find((v: any) => v.is_enabled) || product.variants[0]
    console.log(`[Cart Drawer] Found variant:`, variant);
    console.log(`[Cart Drawer] Variant price (raw):`, variant?.price);
    
    let price;
    if (variant?.price) {
      if (variant.price > 1000) {
        // Likely in cents, convert to dollars
        price = variant.price / 100;
        console.log(`[Cart Drawer] Converting cents to dollars: ${variant.price} -> $${price}`);
      } else {
        // Already in dollars
        price = variant.price;
        console.log(`[Cart Drawer] Price already in dollars: $${price}`);
      }
    } else {
      price = item.price;
      console.log(`[Cart Drawer] Using fallback price: $${price}`);
    }
    
    console.log(`[Cart Drawer] Final price for item: $${price}`);
    return sum + (price * item.quantity)
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
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-light text-gray-900 tracking-tight">Your Cart</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCart}
            className="h-8 w-8 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            aria-label="Close cart"
          >
            <X className="h-4 w-4 text-white" />
          </Button>
        </div>

        <div className="flex-grow overflow-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              {showMigrateButton ? (
                 <p className="text-gray-600 mb-6 text-lg">Your wallet cart is empty, but you have items in your local cart.</p>
              ) : (
                 <p className="text-gray-600 mb-6 text-lg">Your cart is empty</p>
              )}
              <Button 
                onClick={closeCart} 
                className="font-medium py-3 px-8 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-gray-900 hover:bg-black text-white"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {console.log('[CartDrawer] Rendering items:', items)}
              {items.map((item) => {
                console.log(`[Cart Drawer] Passing item to CartItem:`, item);
                console.log(`[Cart Drawer] Item variantImage:`, item.variantImage);
                return (
                  <CartItem 
                    key={`${item.id}-${item.size || ''}-${item.color || ''}-${refreshKey}`} 
                    item={item} 
                    printifyProducts={printifyProducts} 
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
           {showMigrateButton && (
              <Button
                 onClick={migrateLocalCartToWallet}
                 className="w-full mb-6 font-medium py-3 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-green-500 hover:bg-green-600 text-white"
              >
                 Migrate Local Cart to Wallet
              </Button>
           )}

          {items.length > 0 && (
             <div className="flex justify-between mb-6">
               <span className="text-gray-600 text-lg">Subtotal</span>
               <span className="text-gray-900 font-medium text-xl">${total.toFixed(2)}</span>
             </div>
          )}

          {items.length > 0 && (
            <Button 
              className="w-full font-medium py-3 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-yellow-500 hover:bg-yellow-600 text-white" 
              onClick={handleCheckout}
            >
              Checkout
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
