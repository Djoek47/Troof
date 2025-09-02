"use client"

import { useState } from "react"
import { CheckCircle } from "lucide-react"
import type { ShippingMethod } from "@/types/checkout"

interface DeliveryStepProps {
  onSubmit: (method: ShippingMethod) => void
  onBack: () => void
  initialData: ShippingMethod | null
}

export function DeliveryStep({ onSubmit, onBack, initialData }: DeliveryStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(initialData?.id || "standard")

  const shippingMethods: ShippingMethod[] = [
    {
      id: "standard",
      name: "Standard Shipping",
      description: "Delivery in 5-7 business days",
      price: 5.99,
      estimatedDelivery: "5-7 business days",
    },
    {
      id: "express",
      name: "Express Shipping",
      description: "Delivery in 2-3 business days",
      price: 12.99,
      estimatedDelivery: "2-3 business days",
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      description: "Next business day delivery",
      price: 24.99,
      estimatedDelivery: "Next business day",
    },
  ]

  const handleSubmit = () => {
    const method = shippingMethods.find((m) => m.id === selectedMethod)
    if (method) {
      onSubmit(method)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-light mb-8 text-gray-900 tracking-tight">Delivery Method</h2>

      <div className="space-y-6 mb-8">
        {shippingMethods.map((method) => (
          <div
            key={method.id}
            className={`p-6 border rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${
              selectedMethod === method.id
                ? "border-yellow-500 bg-yellow-50 shadow-lg"
                : "border-gray-200 hover:border-gray-300 bg-white"
            }`}
            onClick={() => setSelectedMethod(method.id)}
          >
            <div className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                  selectedMethod === method.id ? "border-yellow-500 bg-yellow-500 text-white" : "border-gray-300"
                }`}
              >
                {selectedMethod === method.id && <CheckCircle className="w-4 h-4" />}
              </div>

              <div className="flex-grow">
                <div className="flex justify-between">
                  <h3 className="font-medium text-gray-900 text-lg">{method.name}</h3>
                  <span className="font-medium text-gray-900 text-lg">${method.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{method.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <Button
          type="button"
          onClick={onBack}
          className="flex-1 font-medium py-4 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-gray-900 hover:bg-black text-white text-lg"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="flex-1 font-medium py-4 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-yellow-500 hover:bg-yellow-600 text-white text-lg"
        >
          Continue to Payment
        </Button>
      </div>
    </div>
  )
}
