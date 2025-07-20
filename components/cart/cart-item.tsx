"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X } from "lucide-react"
import { useCart } from "@/context/cart-context"
import type { CartItem as CartItemType } from "@/types/cart"
import { useState, useEffect } from "react"

interface CartItemProps {
  item: CartItemType
  printifyProducts?: any[]
}

export function CartItem({ item, printifyProducts = [] }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart()
  const [imageError, setImageError] = useState(false)

  // Helper: Map cart item to Printify product/variant and extract size/color labels
  function getPrintifyProductInfo(item: any) {
    const product = printifyProducts[item.id - 1]
    if (!product) return { name: item.name, image: item.image1, price: item.price, size: item.size, color: item.color }
    // Try to find the variant that matches both size and color
    let variant = product.variants[0]
    if (item.size || item.color) {
      variant = product.variants.find((v: any) => {
        let matches = true
        if (item.size) {
          matches = matches && v.options && v.options.some((o: any) => o.value === item.size)
        }
        if (item.color) {
          matches = matches && v.options && v.options.some((o: any) => o.value === item.color)
        }
        return matches
      }) || product.variants.find((v: any) => v.is_enabled) || product.variants[0]
    } else {
      variant = product.variants.find((v: any) => v.is_enabled) || product.variants[0]
    }
    // Extract size and color labels from variant options
    let sizeLabel = undefined
    let colorLabel = undefined
    if (variant.options) {
      for (const opt of variant.options) {
        if (opt.name.toLowerCase().includes('size')) sizeLabel = opt.value
        if (opt.name.toLowerCase().includes('color')) colorLabel = opt.value
      }
    }
    return {
      name: product.name,
      image: product.images?.[0]?.src || item.image1 || "/placeholder.svg",
      price: variant.price || item.price,
      size: sizeLabel || item.size,
      color: colorLabel || item.color,
    }
  }

  const info = getPrintifyProductInfo(item)

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1)
    } else {
      removeItem(item.id, item.variantId, item.size, item.color)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="flex items-center py-4 border-b border-gray-700">
      <div className="relative h-16 w-16 rounded overflow-hidden flex-shrink-0 bg-dark-700">
        {!imageError ? (
          <Image 
            src={info.image} 
            alt={info.name} 
            fill 
            className="object-cover"
            onError={handleImageError}
            sizes="64px"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>
      <div className="ml-4 flex-grow">
        <Link href={`/product/${item.id}`} className="text-sm font-medium text-gray-100 hover:text-yellow-500 transition-colors">
          {info.name}
        </Link>
        <p className="text-sm text-gray-400">${info.price.toFixed(2)}</p>
        {info.color && <p className="text-xs text-gray-400">Color: {info.color}</p>}
        {info.size && <p className="text-xs text-gray-400">Size: {info.size}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={handleDecrement} className="p-1 rounded-full bg-dark-700 hover:bg-dark-600 transition-colors">
          <Minus className="h-3 w-3 text-gray-300" />
        </button>
        <span className="text-sm text-gray-300 w-6 text-center">{item.quantity}</span>
        <button onClick={handleIncrement} className="p-1 rounded-full bg-dark-700 hover:bg-dark-600 transition-colors">
          <Plus className="h-3 w-3 text-gray-300" />
        </button>
      </div>
      <button
        onClick={() => removeItem(item.id, item.variantId, item.size, item.color)}
        className="ml-4 p-1 rounded-full bg-dark-700 hover:bg-dark-600 transition-colors"
      >
        <X className="h-4 w-4 text-gray-300" />
      </button>
    </div>
  )
}
