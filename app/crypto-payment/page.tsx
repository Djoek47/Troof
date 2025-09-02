"use client";

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { Bitcoin, Mail, Clock, Shield, ArrowRight } from "lucide-react";

export default function CryptoPaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CryptoPaymentContent />
    </Suspense>
  );
}

function CryptoPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Floating Elements */}
      <div className="absolute top-32 left-20 opacity-20 pointer-events-none">
        <div className="w-8 h-8 bg-yellow-400 rounded-full blur-sm animate-pulse"></div>
      </div>
      <div className="absolute top-40 right-32 opacity-15 pointer-events-none">
        <Bitcoin className="w-6 h-6 text-yellow-500 animate-bounce" />
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4 relative z-10">
        {/* Crypto Payment Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl">
            <Bitcoin className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-light text-gray-900 mb-6 tracking-tight">
            Crypto Payment Setup 🚀
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your order has been confirmed! We're setting up your crypto payment link.
          </p>

          {/* Payment Process Steps */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-xl max-w-2xl mx-auto">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Order Confirmed</h3>
                  <p className="text-gray-600 text-sm">Your order has been received and is being processed</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">2</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Payment Link Generated</h3>
                  <p className="text-gray-600 text-sm">We'll send you a secure crypto payment link via email</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-green-600 font-semibold">3</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">Complete Payment</h3>
                  <p className="text-gray-600 text-sm">Click the link and complete your payment in crypto</p>
                </div>
              </div>
            </div>
          </div>

          {/* Email Confirmation */}
          {email && (
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-blue-600" />
                <span className="text-blue-800 font-medium text-lg">Payment Link Will Be Sent To:</span>
              </div>
              <p className="text-blue-700 font-mono text-lg">{email}</p>
            </div>
          )}

          {/* Order Details */}
          {orderId && (
            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-gray-600" />
                <span className="text-gray-700 font-medium">Order Reference</span>
              </div>
              <p className="text-gray-600 font-mono">{orderId}</p>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-medium text-yellow-800 mb-2">What Happens Next?</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• You'll receive a payment link within 5-10 minutes</li>
                  <li>• The link will be valid for 24 hours</li>
                  <li>• Your order will be processed after payment confirmation</li>
                  <li>• Digital items will be available in your Faberland account</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            className="font-medium py-5 px-12 transition-all duration-300 transform hover:scale-105 rounded-full shadow-2xl hover:shadow-3xl bg-yellow-500 hover:bg-yellow-600 text-black text-xl"
            onClick={() => router.push("/")}
          >
            Continue Shopping
          </Button>
          
          <Button 
            variant="outline"
            className="font-medium py-4 px-8 transition-all duration-300 transform hover:scale-105 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
            onClick={() => window.open(`mailto:${email || 'support@faberland.com'}?subject=Crypto Payment Link Request`)}
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          
          <p className="text-sm text-gray-500">
            Thank you for choosing crypto payments! 💎
          </p>
        </div>
      </div>
    </div>
  );
}
