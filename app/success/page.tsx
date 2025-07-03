"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-dark-900 text-center px-4">
      <CheckCircle className="w-20 h-20 text-green-400 mb-6" />
      {isManual ? (
        <>
          <h1 className="text-3xl font-bold text-gray-100 mb-4">Order Received!</h1>
          <p className="text-lg text-gray-300 mb-8">
            Thank you for your order. Please check your email{email ? ` (${email})` : ""} for a payment link.<br />
            Your order will be processed after payment is received. Thank you!
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-100 mb-4">Payment Successful!</h1>
          <p className="text-lg text-gray-300 mb-8">
            Thank you for your purchase. Your payment has been processed and your order is being prepared.
          </p>
        </>
      )}
      <Button className="bg-yellow-500 hover:bg-yellow-600 text-dark-900 font-bold px-8 py-3 rounded-md" onClick={() => router.push("/")}>Return to Store</Button>
    </div>
  );
} 