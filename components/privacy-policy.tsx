import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-white shadow-lg border-0 rounded-3xl">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-4xl font-light text-gray-900 tracking-tight">
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600 mt-4 text-lg">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-12 space-y-8">
            {/* Summary Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-3">Key Points</h2>
              <ul className="space-y-2 text-blue-700">
                <li>• We collect only necessary information for order processing</li>
                <li>• Your data is never sold to third parties</li>
                <li>• Secure payment processing with industry standards</li>
                <li>• You can request deletion of your data anytime</li>
                <li>• We use cookies to improve your shopping experience</li>
              </ul>
            </div>

            {/* Policy Sections */}
            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This may include:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Shipping and billing addresses</li>
                <li>Payment information (processed securely by Stripe)</li>
                <li>Order history and preferences</li>
                <li>Communications with our support team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations and shipping updates</li>
                <li>Provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">3. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                We do not sell, trade, or otherwise transfer your personal information to third parties, except as described in this policy. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-3 space-y-1 ml-4">
                <li><strong>Payment processors:</strong> Stripe for secure payment processing</li>
                <li><strong>Shipping partners:</strong> To deliver your orders</li>
                <li><strong>Service providers:</strong> Who help us operate our business</li>
                <li><strong>Legal authorities:</strong> When required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption of sensitive data, secure payment processing, and regular security assessments.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">5. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to enhance your shopping experience, analyze website traffic, and understand where our visitors are coming from. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">7. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Order information is typically retained for 7 years for tax and accounting purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">9. International Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and that your information receives adequate protection.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">10. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Your continued use of our services after any changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-light text-gray-900 mb-4 tracking-tight">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-xl p-4 mt-3">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@faberstore.com<br />
                  <strong>Phone:</strong> +1 (555) 123-4567<br />
                  <strong>Address:</strong> 123 Privacy Street, Data City, DC 12345<br />
                  <strong>Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
