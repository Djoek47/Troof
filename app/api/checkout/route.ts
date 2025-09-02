import { NextResponse } from "next/server";
import { PrintifyAPI, getPrintifyVariantId } from "@/lib/printify";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingAddress, processPayment } = await req.json();

    // 1. Fetch Printify products for mapping using PrintifyAPI directly
    const printifyApi = new PrintifyAPI();
    const res = await printifyApi.getProducts(1, 12); // Fetch all 12 products
    const printifyProducts = res.data;

    // 2. Map cart items to real Printify product/variant IDs using robust mapping
    const line_items = cartItems.map((item: any) => {
      // Use the index mapping: id 1 => index 0, id 2 => index 1, etc.
      const product = printifyProducts[item.productId - 1] || printifyProducts[item.id - 1];
      if (!product) throw new Error(`Product not found for id ${item.productId || item.id}`);
      const variantId = getPrintifyVariantId(product, item.color, item.size);
      if (!variantId) throw new Error(`Variant not found for size ${item.size} and color ${item.color} in product id ${product.id}`);
      return {
        product_id: product.id, // real Printify product ID
        variant_id: variantId, // real Printify variant ID
        quantity: item.quantity,
      };
    });

    // 3. Prepare Printify order payload
    const printifyOrder = {
      external_id: `Crypto_API_${Date.now()}`,
      label: "Crypto API",
      line_items,
      address_to: {
        first_name: shippingAddress.firstName,
        last_name: shippingAddress.lastName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        country: shippingAddress.country,
        region: shippingAddress.state,
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        zip: shippingAddress.zipCode,
      },
      send_shipping_notification: true,
    };

    // 4. Send order to Printify
    const orderResponse = await printifyApi.createOrder(printifyOrder);

    return NextResponse.json({ success: true, printifyOrder, orderResponse });

  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: error.message || "Checkout failed" }, { status: 500 });
  }
}
