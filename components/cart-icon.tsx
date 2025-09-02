"use client"

import { ShoppingCart, CheckCircle } from "lucide-react"
import { useState } from "react"
import { useCart } from "@/context/cart-context"
import { calculateItemsCount } from "@/lib/cart"
import { Button } from "@/components/ui/button"

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
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      className={`relative h-10 w-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
        showSuccess 
          ? "bg-green-500 text-white hover:bg-green-600" 
          : "bg-yellow-500 hover:bg-yellow-600 text-white"
      }`}
      aria-label="Open cart"
    >
      {showSuccess ? (
        <CheckCircle className="w-5 h-5 text-white" />
      ) : (
        <ShoppingCart className="w-5 h-5 text-white" />
      )}
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-white text-yellow-500 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg border-2 border-yellow-500">
          {itemCount}
        </span>
      )}
    </Button>
  )
}
