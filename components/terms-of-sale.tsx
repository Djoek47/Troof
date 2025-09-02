import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const TermsOfSale = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg border-0 rounded-3xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-light text-gray-900 tracking-tight">
              Terms of Sale
            </CardTitle>
            <p className="text-gray-600 mt-4 text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-12 space-y-8">
            {/* Summary Box */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-yellow-800 mb-3">Key Points</h2>
              <ul className="space-y-2 text-yellow-700">
                <li>• All sales are final - no returns or refunds</li>
                <li>• Orders are processed within 3-5 business days</li>
                <li>• Shipping takes 5-10 business days</li>
                <li>• Custom designs are non-refundable</li>
                <li>• Product quality guaranteed</li>
              </ul>
            </div>

            {/* Terms Sections */}
            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">1. Order Acceptance</h2>
              <p className="text-gray-700 leading-relaxed">
                By placing an order through our website, you acknowledge that you have read, understood, and agree to be bound by these Terms of Sale. We reserve the right to refuse or cancel any order at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">2. All Sales Final</h2>
              <p className="text-gray-700 leading-relaxed">
                <strong>IMPORTANT:</strong> All sales are final. We do not offer returns, exchanges, or refunds for any products purchased through our website. This policy applies to all items, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-3 space-y-1 ml-4">
                <li>Custom designed products</li>
                <li>Personalized items</li>
                <li>Sale or clearance items</li>
                <li>All other merchandise</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">3. Product Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We strive to provide accurate product descriptions, images, and pricing. However, we do not guarantee that product descriptions, colors, information, or other content available on our website is accurate, complete, reliable, current, or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">4. Pricing and Payment</h2>
              <p className="text-gray-700 leading-relaxed">
                All prices are listed in US Dollars and are subject to change without notice. Payment must be received in full before your order is processed. We accept all major credit cards and cryptocurrency payments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">5. Order Processing</h2>
              <p className="text-gray-700 leading-relaxed">
                Orders are typically processed within 3-5 business days. Custom or personalized items may take longer. You will receive an email confirmation once your order has been processed and shipped.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">6. Shipping and Delivery</h2>
              <p className="text-gray-700 leading-relaxed">
                Standard shipping takes 5-10 business days. Delivery times may vary based on your location and shipping method selected. We are not responsible for delays caused by shipping carriers or circumstances beyond our control.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">7. Product Quality</h2>
              <p className="text-gray-700 leading-relaxed">
                We guarantee the quality of our products. If you receive a damaged or defective item, please contact us within 48 hours of delivery with photos and a description of the issue. We will work with you to resolve the problem.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">8. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Our liability for any claim arising from the purchase or use of our products is limited to the amount paid for the specific product giving rise to the claim. We are not liable for any indirect, incidental, or consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">9. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms of Sale, please contact us at:
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mt-3">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@faberstore.com<br />
                  <strong>Phone:</strong> +1 (555) 123-4567<br />
                  <strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">10. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms of Sale at any time. Changes will be effective immediately upon posting on our website. Your continued use of our website after any changes constitutes acceptance of the new terms.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
