"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConfirmationStepProps {
  orderNumber: string
  onBackToShop: () => void
}

export function ConfirmationStep({ orderNumber, onBackToShop }: ConfirmationStepProps) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-8">
        <div className="w-20 h-20 rounded-full bg-yellow-500 flex items-center justify-center shadow-xl">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
      </div>

      <h2 className="text-3xl font-light text-gray-900 mb-4 tracking-tight">Order Confirmed!</h2>
      <p className="text-gray-600 mb-8 text-lg">Thank you for your purchase. Your order has been received.</p>

      <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl inline-block mb-10 shadow-lg">
        <p className="text-sm text-gray-600 mb-2">Order Number</p>
        <p className="text-xl font-medium text-yellow-500">{orderNumber}</p>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        <p className="text-gray-600 text-base">
          We've sent a confirmation email with your order details and tracking information.
        </p>
        <p className="text-gray-600 text-base">
          Your digital items will be available in your Faberland metaverse account within 24 hours.
        </p>
      </div>

      <div className="mt-10">
        <Button
          onClick={onBackToShop}
          className="font-medium py-4 px-10 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-yellow-500 hover:bg-yellow-600 text-white text-lg"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  )
}
