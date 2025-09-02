"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { calculateCartTotal } from "@/lib/cart"
import type { CheckoutState } from "@/types/checkout"
import type { CartItem } from "@/types/cart"
import { useState, useEffect } from "react"

interface ReviewStepProps {
  checkoutData: CheckoutState
  cartItems: CartItem[]
  onSubmit: () => void
  onBack: () => void
}

export function ReviewStep({ checkoutData, cartItems, onSubmit, onBack }: ReviewStepProps) {
  const { shippingAddress, shippingMethod } = checkoutData
  const [printifyProducts, setPrintifyProducts] = useState<any[]>([])

  // Fetch Printify products for color matching
  useEffect(() => {
    const fetchPrintifyProducts = async () => {
      try {
        const res = await fetch("/api/printify-products")
        if (res.ok) {
          const data = await res.json()
          setPrintifyProducts(data)
        }
      } catch (e) {
        console.error("Failed to fetch Printify products for checkout:", e)
      }
    }
    fetchPrintifyProducts()
  }, [])

  // Function to get the correct image for a cart item (same logic as CartItem)
  const getItemImage = (item: CartItem) => {
    // If we have variantImage, use it
    if (item.variantImage) {
      return item.variantImage
    }

    // Otherwise, use color matching logic
    const printifyProduct = printifyProducts[item.id - 1]
    if (printifyProduct && item.color && printifyProduct.options) {
      // Find the color option
      const colorOption = printifyProduct.options.find((opt: any) => 
        opt.name && opt.name.toLowerCase().includes('color')
      )
      
      if (colorOption && colorOption.values) {
        // Find the selected color value
        const selectedColorValue = colorOption.values.find((val: any) => 
          val.title && val.title.toLowerCase() === item.color.toLowerCase()
        )
        
        if (selectedColorValue) {
          // Find variant with this color
          const matchingVariant = printifyProduct.variants?.find((variant: any) => {
            if (variant.originalVariant && variant.originalVariant.options) {
              return variant.originalVariant.options.includes(selectedColorValue.id)
            }
            return false
          })
          
          if (matchingVariant) {
            // Find image for this variant
            const variantImages = printifyProduct.images?.filter((img: any) => 
              img.variant_ids.includes(matchingVariant.id)
            ) || []
            
            if (variantImages.length > 0) {
              // Prefer front-facing images
              const frontImage = variantImages.find((img: any) => 
                img.src.includes('front') || 
                img.src.includes('main') || 
                !img.src.includes('folded') && !img.src.includes('back')
              )
              
              return frontImage ? frontImage.src : variantImages[0].src
            }
          }
        }
      }
    }
    
    // Fallback to item.image1 or placeholder
    return item.image1 || "/placeholder.svg"
  }

  if (!shippingAddress || !shippingMethod) {
    return <div>Missing required information</div>
  }

  const subtotal = calculateCartTotal(cartItems)
  const shippingCost = shippingMethod.price
  const tax = subtotal * 0.08 // 8% tax rate
  const total = subtotal + shippingCost + tax

  return (
    <div>
      <h2 className="text-2xl font-light mb-8 text-gray-900 tracking-tight">Review Your Order</h2>

      <div className="space-y-8">
        {/* Shipping Information */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900 text-lg">Shipping Address</h3>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p>{shippingAddress.address1}</p>
            {shippingAddress.address2 && <p>{shippingAddress.address2}</p>}
            <p>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
            </p>
            <p>{shippingAddress.country}</p>
            <p>{shippingAddress.phone}</p>
          </div>
        </div>

        {/* Delivery Method */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900 text-lg">Delivery Method</h3>
            <span className="text-gray-900 font-medium">${shippingMethod.price.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>{shippingMethod.name}</p>
            <p>{shippingMethod.description}</p>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-gray-900 text-lg">Payment Information</h3>
          </div>
          <div className="text-sm text-gray-700 space-y-1">
            <p>•••• •••• •••• {checkoutData.paymentDetails?.cardNumber.slice(-4)}</p>
            <p>{checkoutData.paymentDetails?.nameOnCard}</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
          <h3 className="font-medium text-gray-900 text-lg mb-6">Order Summary</h3>

          <div className="space-y-6 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden flex-shrink-0">
                  <Image 
                    src={getItemImage(item)} 
                    alt={item.name} 
                    fill 
                    className="object-cover" 
                  />
                </div>
                <div className="ml-6 flex-grow">
                  <Link href={`/product/${item.id}`}>
                    <h4 className="text-base font-medium text-gray-900 hover:text-yellow-500 transition-colors cursor-pointer">{item.name}</h4>
                  </Link>
                  <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                  {item.color && <p className="text-xs text-gray-600 mt-1">Color: {item.color}</p>}
                  {item.size && <p className="text-xs text-gray-600 mt-1">Size: {item.size}</p>}
                </div>
                <div className="text-base text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-900">${shippingCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="text-gray-900">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-4 border-t border-gray-200">
              <span className="text-gray-900 text-lg">Total</span>
              <span className="text-yellow-500 text-xl">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-6">
        <Button
          type="button"
          onClick={onBack}
          className="flex-1 font-medium py-4 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-gray-900 hover:bg-black text-white text-lg"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="flex-1 font-medium py-4 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-yellow-500 hover:bg-yellow-600 text-white text-lg"
        >
          Place Order
        </Button>
      </div>
    </div>
  )
}
