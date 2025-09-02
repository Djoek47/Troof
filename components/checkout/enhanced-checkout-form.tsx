"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CreditCard, Clock, CheckCircle } from "lucide-react"
import StripePaymentForm from "@/components/checkout/stripe-payment-form"
import { getPrintifyVariantId } from "@/lib/printify"

interface PaymentMethod {
  id: string
  name: string
  description: string
  type: string
  enabled: boolean
}

interface ShippingAddress {
  firstName: string
  lastName: string
  email: string
  phone: string
  address1: string
  address2: string
  city: string
  state: string
  zipCode: string
  country: string
}

export const EnhancedCheckoutForm = () => {
  const { state, clearCart } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [showStripeForm, setShowStripeForm] = useState(false)
  const [printifyProducts, setPrintifyProducts] = useState<any[]>([])
  const [stripeProcessing, setStripeProcessing] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "US",
  })

  // Load payment methods
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const response = await fetch("/api/payments/methods")
        const data = await response.json()
        setPaymentMethods(data.methods || [])

        // Auto-select first available method
        if (data.methods && data.methods.length > 0) {
          setSelectedPaymentMethod(data.methods[0].id)
        }
      } catch (error) {
        console.error("Failed to load payment methods:", error)
        setPaymentMethods([
          {
            id: "manual",
            name: "Crypto Payment",
            description: "Create order for manual payment processing",
            type: "manual",
            enabled: true,
          },
        ])
        setSelectedPaymentMethod("manual")
      }
    }

    loadPaymentMethods()
  }, [])

  // Fetch Printify products for mapping
  useEffect(() => {
    const fetchPrintifyProducts = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/printify-products`)
        if (!res.ok) throw new Error("Failed to fetch Printify products")
        const data = await res.json()
        setPrintifyProducts(data)
      } catch (e) {
        setPrintifyProducts([])
      }
    }
    fetchPrintifyProducts()
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Only redirect if not coming from a successful payment
  useEffect(() => {
    const isSuccess = window.location.pathname.startsWith("/success")
    if (mounted && state.items.length === 0 && !isSuccess) {
      router.push("/")
    }
  }, [mounted, state.items.length, router])

  // Calculate total using real Printify prices
  const calculateTotal = () => {
    return state.items.reduce((total, item) => {
      const product = printifyProducts[item.id - 1];
      if (!product) return total;
      const variant = product.variants.find((v: any) => v.is_enabled) || product.variants[0];
      const price = variant.price || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const required = ["firstName", "lastName", "email", "address1", "city", "state", "zipCode", "country"]
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`)
        return false
      }
    }

    if (!selectedPaymentMethod) {
      setError("Please select a payment method")
      return false
    }

    return true
  }

  // Helper: Map cart item to Printify product/variant
  function mapCartItemToPrintify(item: any) {
    const product = printifyProducts[item.id - 1];
    if (!product) {
      console.error("No Printify product found for cart item", item);
      return null;
    }
    // Use robust mapping to get the correct variantId
    const variantId = getPrintifyVariantId(product, item.color, item.size);
    const variant = product.variants.find((v: any) => v.id === variantId) || product.variants[0];
    // Extract size and color labels from variant options
    let sizeLabel = undefined;
    let colorLabel = undefined;
    if (variant && variant.options && Array.isArray(variant.options) && typeof variant.options[0] === "object") {
      for (const opt of variant.options) {
        if (opt.name && opt.name.toLowerCase().includes('size')) sizeLabel = opt.value;
        if (opt.name && opt.name.toLowerCase().includes('color')) colorLabel = opt.value;
      }
    }
    return {
      productId: product.originalId || product.id,
      variantId: variant.id,
      quantity: item.quantity,
      price: variant.price || item.price,
      name: product.name,
      size: sizeLabel || item.size,
      color: colorLabel || item.color,
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Transform cart items to Printify format
      const transformedItems = state.items.map(mapCartItemToPrintify).filter(Boolean)
      const orderData = {
        items: transformedItems,
        shippingAddress,
      }

      if (selectedPaymentMethod === "stripe") {
        // Create Stripe payment intent
        const intentResponse = await fetch("/api/payments/stripe/create-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: calculateTotal(),
            metadata: {
              customerEmail: shippingAddress.email,
              orderItems: JSON.stringify(orderData.items),
            },
          }),
        })

        if (!intentResponse.ok) {
          throw new Error("Failed to create payment intent")
        }

        const { clientSecret } = await intentResponse.json()
        setClientSecret(clientSecret)
        setShowStripeForm(true)
      } else if (selectedPaymentMethod === "manual") {
        // Create manual order
        const response = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartItems: orderData.items,
            shippingAddress,
            processPayment: false,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to create order")
        }

        // Set order details and show crypto confirmation modal
        const orderWithEmail = {
          email: shippingAddress.email,
          items: state.items,
          shippingAddress: shippingAddress
        }
        setOrderDetails(orderWithEmail)
        setShowConfirmation(true)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStripeSuccess = async (paymentIntentId: string) => {
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: state.items,
          shippingAddress,
          processPayment: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Add payment intent ID and email to the order details for Stripe payments
        const orderWithPaymentId = {
          ...result.order,
          paymentIntentId: paymentIntentId,
          email: shippingAddress.email
        }
        setOrderDetails(orderWithPaymentId)
        setShowConfirmation(true)
      } else {
        setError(result.error || "Payment confirmation failed")
      }
    } catch (error) {
      setError("Failed to confirm payment")
    }
  }

  const handleStripeError = (error: string) => {
    setError(error)
    setShowStripeForm(false)
  }

  if (state.items.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p>Your cart is empty</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Forms */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
        {/* Shipping Address */}
          <Card className="bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 px-8 py-6">
              <CardTitle className="text-2xl font-light text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Shipping Address
              </CardTitle>
              <p className="text-gray-600 mt-2 font-light">Where should we deliver your order?</p>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input
                    id="firstName"
                    value={shippingAddress.firstName}
                    onChange={(e) => handleAddressChange("firstName", e.target.value)}
                    required
                    className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input
                    id="lastName"
                    value={shippingAddress.lastName}
                    onChange={(e) => handleAddressChange("lastName", e.target.value)}
                    required
                    className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={shippingAddress.email}
                  onChange={(e) => handleAddressChange("email", e.target.value)}
                  required
                  className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                <Input
                  id="phone"
                  value={shippingAddress.phone}
                  onChange={(e) => handleAddressChange("phone", e.target.value)}
                  className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address1" className="text-sm font-medium text-gray-700">Street Address</Label>
                <Input
                  id="address1"
                  value={shippingAddress.address1}
                  onChange={(e) => handleAddressChange("address1", e.target.value)}
                  required
                  className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address2" className="text-sm font-medium text-gray-700">Apartment, suite, etc. (optional)</Label>
                <Input
                  id="address2"
                  value={shippingAddress.address2}
                  onChange={(e) => handleAddressChange("address2", e.target.value)}
                  className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium text-gray-700">City</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) => handleAddressChange("city", e.target.value)}
                    required
                    className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-sm font-medium text-gray-700">State</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) => handleAddressChange("state", e.target.value)}
                    required
                    className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                    required
                    className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm font-medium text-gray-700">Country</Label>
                <Select value={shippingAddress.country} onValueChange={(value) => handleAddressChange("country", value)}>
                  <SelectTrigger className="h-12 px-4 text-base border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

        {/* Payment Method */}
          <Card className="bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 px-8 py-6">
              <CardTitle className="text-2xl font-light text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Payment Method
              </CardTitle>
              <p className="text-gray-600 mt-2 font-light">Choose how you'd like to pay</p>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                    selectedPaymentMethod === method.id
                        ? "border-yellow-500 bg-yellow-50 shadow-lg"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-md"
                  }`}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPaymentMethod === method.id 
                        ? 'border-yellow-500 bg-yellow-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedPaymentMethod === method.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 flex-1">
                      {method.type === "card" && <CreditCard className="h-6 w-6 text-gray-600" />}
                      {method.type === "manual" && <Clock className="h-6 w-6 text-gray-600" />}
                      <div className="flex-1">
                          <div className={`font-medium text-lg ${selectedPaymentMethod === method.id ? 'text-yellow-700' : 'text-gray-900'}`}>{method.name}</div>
                          <div className={`text-sm ${selectedPaymentMethod === method.id ? 'text-yellow-600' : 'text-gray-600'}`}>{method.description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 rounded-2xl">
            <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        {!showStripeForm && (
          <div className="pt-6">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-14 text-lg font-medium bg-yellow-500 hover:bg-yellow-600 text-black rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Processing Your Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
            <p className="text-center text-sm text-gray-500 mt-3">
              By placing your order, you agree to our{" "}
              <Link href="/terms" className="text-yellow-600 hover:text-yellow-700 underline">
                terms of service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-yellow-600 hover:text-yellow-700 underline">
                privacy policy
              </Link>
            </p>
          </div>
        )}
      </form>
      </div>

      {/* Stripe Payment Form (now at the very bottom of the checkout section) */}
      {showStripeForm && clientSecret && (
        <div className="w-full md:w-2/3 mx-auto mt-8">
          <Card className="bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden">
            <CardHeader className="bg-gray-50 border-b border-gray-100 px-8 py-6">
              <CardTitle className="text-2xl font-light text-gray-900 tracking-tight flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Complete Payment
              </CardTitle>
              <p className="text-gray-600 mt-2 font-light">Enter your payment details to complete your order</p>
            </CardHeader>
            <CardContent className="p-8">
              <StripePaymentForm
                clientSecret={clientSecret}
                onSuccess={handleStripeSuccess}
                onError={handleStripeError}
                  amount={calculateTotal() * 100}
                  isProcessing={stripeProcessing}
                  setIsProcessing={setStripeProcessing}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Confirmation Step */}
      {showConfirmation && orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
                             <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">
                 {orderDetails.paymentIntentId ? 'Order Confirmed! 🎉' : 'Crypto Payment Requested! 🚀'}
               </h2>
               
               <p className="text-gray-600 mb-6 leading-relaxed">
                 {orderDetails.paymentIntentId 
                   ? `Your order has been received and is being processed. You'll receive a confirmation email at:`
                   : `Your crypto payment request has been received. You'll be sent a payment link via email at:`
                 }
               </p>
               
               <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                 <p className="text-blue-800 font-semibold text-lg">
                   {orderDetails.email}
                 </p>
               </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                {orderDetails.paymentIntentId && (
                  <p className="text-sm text-gray-600">
                    <strong>Payment ID:</strong> {orderDetails.paymentIntentId}
                  </p>
                )}
              </div>
              
                             <Button
                 onClick={() => {
                   clearCart()
                   setShowConfirmation(false)
                   router.push('/')
                 }}
                                 className="w-full font-medium py-4 px-8 transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl bg-yellow-500 hover:bg-yellow-600 text-black text-lg"
               >
                 Exit Cart
               </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default EnhancedCheckoutForm 