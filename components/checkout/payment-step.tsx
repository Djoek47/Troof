"use client"
import { useForm } from "react-hook-form"
import { CreditCard, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PaymentDetails } from "@/types/checkout"

interface PaymentStepProps {
  onSubmit: (data: PaymentDetails) => void
  onBack: () => void
  initialData: PaymentDetails | null
}

export function PaymentStep({ onSubmit, onBack, initialData }: PaymentStepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PaymentDetails>({
    defaultValues: initialData || {
      cardNumber: "",
      nameOnCard: "",
      expiryDate: "",
      cvv: "",
    },
  })

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    return (
      value
        .replace(/\s/g, "")
        .match(/.{1,4}/g)
        ?.join(" ")
        .substr(0, 19) || ""
    )
  }

  const cardNumber = watch("cardNumber")

  // Determine card type based on first digits
  const getCardType = (number: string) => {
    const cleaned = number.replace(/\D/g, "")
    if (cleaned.startsWith("4")) return "Visa"
    if (/^5[1-5]/.test(cleaned)) return "Mastercard"
    if (/^3[47]/.test(cleaned)) return "American Express"
    if (/^6(?:011|5)/.test(cleaned)) return "Discover"
    return null
  }

  const cardType = getCardType(cardNumber)

  return (
    <div>
      <h2 className="text-2xl font-light mb-8 text-gray-900 tracking-tight">Payment Information</h2>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center text-gray-600">
          <Lock className="w-5 h-5 mr-3" />
          <span className="text-base font-medium">Secure Payment</span>
        </div>

        <div className="flex items-center space-x-3">
          <div className="w-12 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-12 h-8 bg-gray-200 rounded-lg"></div>
          <div className="w-12 h-8 bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Card Number *
          </label>
          <div className="relative">
            <input
              id="cardNumber"
              type="text"
              className={`w-full pl-12 pr-4 py-3 bg-white border ${
                errors.cardNumber ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              placeholder="1234 5678 9012 3456"
              {...register("cardNumber", {
                required: "Card number is required",
                onChange: (e) => {
                  e.target.value = formatCardNumber(e.target.value)
                },
                validate: (value) => {
                  const cleaned = value.replace(/\s/g, "")
                  return (cleaned.length >= 13 && cleaned.length <= 19) || "Invalid card number"
                },
              })}
            />
            <CreditCard className="absolute left-4 top-3 h-5 w-5 text-gray-500" />
            {cardType && <span className="absolute right-4 top-3 text-sm text-gray-500">{cardType}</span>}
          </div>
          {errors.cardNumber && <p className="mt-1 text-sm text-red-500">{errors.cardNumber.message}</p>}
        </div>

        <div>
          <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-2">
            Name on Card *
          </label>
          <input
            id="nameOnCard"
            type="text"
            className={`w-full px-4 py-3 bg-white border ${
              errors.nameOnCard ? "border-red-500" : "border-gray-300"
            } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
            {...register("nameOnCard", { required: "Name on card is required" })}
          />
          {errors.nameOnCard && <p className="mt-1 text-sm text-red-500">{errors.nameOnCard.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date (MM/YY) *
            </label>
            <input
              id="expiryDate"
              type="text"
              className={`w-full px-4 py-3 bg-white border ${
                errors.expiryDate ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              placeholder="MM/YY"
              {...register("expiryDate", {
                required: "Expiry date is required",
                pattern: {
                  value: /^(0[1-9]|1[0-2])\/([0-9]{2})$/,
                  message: "Invalid format (MM/YY)",
                },
              })}
            />
            {errors.expiryDate && <p className="mt-1 text-sm text-red-500">{errors.expiryDate.message}</p>}
          </div>

          <div>
            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
              CVV *
            </label>
            <input
              id="cvv"
              type="text"
              className={`w-full px-4 py-3 bg-white border ${
                errors.cvv ? "border-red-500" : "border-gray-300"
              } rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-200`}
              maxLength={4}
              {...register("cvv", {
                required: "CVV is required",
                pattern: {
                  value: /^[0-9]{3,4}$/,
                  message: "CVV must be 3 or 4 digits",
                },
              })}
            />
            {errors.cvv && <p className="mt-1 text-sm text-red-500">{errors.cvv.message}</p>}
          </div>
        </div>

        <div className="pt-6 flex gap-6">
          <Button
            type="button"
            onClick={onBack}
            className="flex-1 font-medium py-4 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-gray-900 hover:bg-black text-white text-lg"
          >
            Back
          </Button>
          <Button
            type="submit"
            className="flex-1 font-medium py-4 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-yellow-500 hover:bg-yellow-600 text-white text-lg"
          >
            Review Order
          </Button>
        </div>
      </form>
    </div>
  )
}
