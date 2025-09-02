import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { PrintifyAPI, getPrintifyVariantId } from "@/lib/printify"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
})

export async function POST(request: NextRequest) {
  try {
    const { paymentIntentId, orderData } = await request.json()

    if (!paymentIntentId) {
      return NextResponse.json({ error: "Payment intent ID is required" }, { status: 400 })
    }

    // Retrieve the payment intent to verify it succeeded
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    // Create order in Printify
    try {
      // 1. Fetch Printify products for mapping
      const printifyApi = new PrintifyAPI();
      const res = await printifyApi.getProducts(1, 12); // Fetch all 12 products
      const printifyProducts = res.data;

      // 2. Map cart items to real Printify product/variant IDs using robust mapping
      const line_items = orderData.items.map((item: any) => {
        // Use the index mapping: id 1 => index 0, id 2 => index 1, etc.
        const product = printifyProducts[item.productId - 1] || printifyProducts[item.id - 1];
        if (!product) throw new Error(`Product not found for id ${item.productId || item.id}`);
        
        // For Stripe orders, we need to get the color and size from the cart item
        // This assumes the cart item has color and size information
        const color = item.color;
        const size = item.size;
        
        const variantId = getPrintifyVariantId(product, color, size);
        if (!variantId) throw new Error(`Variant not found for size ${size} and color ${color} in product id ${product.id}`);
        
        return {
          product_id: product.id, // real Printify product ID
          variant_id: variantId, // real Printify variant ID
          quantity: item.quantity,
        };
      });

      // 3. Create Printify order using the API
      const printifyOrder = {
        external_id: `Stripe_${paymentIntentId}`,
        label: "Stripe API",
        line_items,
        address_to: {
          first_name: orderData.shippingAddress.firstName,
          last_name: orderData.shippingAddress.lastName,
          email: orderData.shippingAddress.email,
          phone: orderData.shippingAddress.phone || "",
          country: orderData.shippingAddress.country,
          region: orderData.shippingAddress.state,
          address1: orderData.shippingAddress.address1,
          address2: orderData.shippingAddress.address2 || "",
          city: orderData.shippingAddress.city,
          zip: orderData.shippingAddress.zipCode,
        },
        send_shipping_notification: true,
      };

      // 4. Send order to Printify
      const orderResponse = await printifyApi.createOrder(printifyOrder);

      return NextResponse.json({
        success: true,
        paymentIntentId,
        orderId: orderResponse.id,
        order: orderResponse,
      })
    } catch (printifyError) {
      console.error("Error creating Printify order:", printifyError)

      // Payment succeeded but order creation failed
      // You might want to store this for manual processing
      return NextResponse.json({
        success: true,
        paymentIntentId,
        warning: "Payment completed but order creation failed. Please contact support.",
        error: printifyError instanceof Error ? printifyError.message : "Unknown error",
      })
    }
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ error: "Failed to confirm payment" }, { status: 500 })
  }
} 