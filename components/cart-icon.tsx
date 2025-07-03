"use client"

import { ShoppingCart, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { calculateItemsCount } from "@/lib/cart"

export function CartIcon() {
  const [showSuccess, setShowSuccess] = useState(false)
  const { state, toggleCart } = useCart()
  const itemCount = calculateItemsCount(state.items)
  const [prevCount, setPrevCount] = useState(itemCount)

  // Detect when itemCount increases
  if (itemCount !== prevCount) {
    if (itemCount > prevCount) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 770)
    }
    setPrevCount(itemCount)
  }

  const handleClick = () => {
    toggleCart()
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full transition-colors duration-200 relative ${
        showSuccess ? "bg-green-500" : "bg-yellow-500 hover:bg-yellow-600"
      }`}
      aria-label="Open cart"
    >
      {showSuccess ? (
        <CheckCircle className="w-6 h-6 text-black" />
      ) : (
        <ShoppingCart className="w-6 h-6 text-dark-900" />
      )}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-dark-900 text-yellow-500 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-yellow-500">
          {itemCount}
        </span>
      )}
    </button>
  )
}
