"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Star, Gift, Truck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isManual = searchParams.get("manual") === "1";
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Floating Elements */}
      <div className="absolute top-32 left-20 opacity-20 pointer-events-none">
        <div className="w-8 h-8 bg-yellow-400 rounded-full blur-sm animate-pulse"></div>
      </div>
      <div className="absolute top-40 right-32 opacity-15 pointer-events-none">
        <Star className="w-6 h-6 text-yellow-500 animate-bounce" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative z-10">
        {/* Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          {isManual ? (
            <>
              <h1 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
                Order Received! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Thank you for your order. Please check your email{email ? ` (${email})` : ""} for a payment link.<br />
                Your order will be processed after payment is received.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
                Payment Successful! 🎉
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Thank you for your purchase. Your payment has been processed and your order is being prepared.
              </p>
            </>
          )}

          {/* Order Details */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-xl max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Truck className="w-6 h-6 text-blue-500" />
              <span className="text-lg font-medium text-gray-700">Order Processing</span>
            </div>
            <p className="text-gray-600 mb-4">
              You'll receive an email confirmation with your order details and tracking information.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Gift className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-gray-500">
                Your digital items will be available in your Faberland metaverse account within 24 hours
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Button */}
        <div className="space-y-4">
          <Button 
            className="font-medium py-5 px-12 transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl hover:shadow-3xl bg-yellow-500 hover:bg-yellow-600 text-black text-xl"
            onClick={() => router.push("/")}
          >
            Continue Shopping
          </Button>
          <p className="text-sm text-gray-500">
            Thank you for choosing Faberland! 🚀
          </p>
        </div>
      </div>
    </div>
  );
} 