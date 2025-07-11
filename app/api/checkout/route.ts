import { NextResponse } from "next/server";
import { PrintifyAPI, getPrintifyVariantId } from "@/lib/printify";
import { getPrintifyProductId } from "@/data/products";

export async function POST(req: Request) {
  try {
    const { cartItems, shippingAddress, processPayment } = await req.json();

    // 1. Fetch Printify products for mapping using PrintifyAPI directly
    const printifyApi = new PrintifyAPI();
    const res = await printifyApi.getProducts(1, 50); // Fetch more products to ensure we get all mapped ones
    const printifyProducts = res.data;

    // 2. Map cart items to real Printify product/variant IDs using stable mapping
    const line_items = cartItems.map((item: any) => {
      console.log('Processing cart item:', {
        id: item.id,
        productId: item.productId,
        idType: typeof item.id,
        productIdType: typeof item.productId,
        color: item.color,
        size: item.size
      });
      
      let printifyProductId: string;
      let product: any;
      
      // Check if we have a productId (real Printify ID) or need to map from mock ID
      if (item.productId && typeof item.productId === 'string' && item.productId.length > 10) {
        console.log('Using direct Printify productId:', item.productId);
        // It's already a real Printify ID
        printifyProductId = item.productId;
        product = printifyProducts.find(p => p.id.toString() === printifyProductId);
        if (!product) {
          throw new Error(`Printify product not found for ID ${printifyProductId}`);
        }
      } else {
        // Use id field (could be mock ID or real ID)
        const itemId = String(item.id || item.productId || '');
        console.log('Using id field for mapping:', itemId);
        
        if (itemId.length > 10) {
          console.log('Using direct Printify ID from id field:', itemId);
          // It's already a real Printify ID
          printifyProductId = itemId;
          product = printifyProducts.find(p => p.id.toString() === printifyProductId);
          if (!product) {
            throw new Error(`Printify product not found for ID ${printifyProductId}`);
          }
        } else {
          console.log('Using mock ID mapping for:', itemId);
          // It's a mock ID, use the mapping
          const mappedId = getPrintifyProductId(Number(itemId));
          if (!mappedId) {
            throw new Error(`No Printify product ID mapped for mock ID ${itemId}`);
          }
          printifyProductId = mappedId;
          
          // Find the actual Printify product by its real ID
          product = printifyProducts.find(p => p.id.toString() === printifyProductId);
          if (!product) {
            throw new Error(`Printify product not found for ID ${printifyProductId} (mapped from mock ID ${itemId})`);
          }
        }
      }
      
      console.log('Found product:', product.id, product.name);
      
      const variantId = getPrintifyVariantId(product, item.color, item.size);
      if (!variantId) {
        throw new Error(`Variant not found for size ${item.size} and color ${item.color} in product id ${product.id}`);
      }
      
      console.log('Found variant ID:', variantId);
      
      return {
        product_id: product.id, // real Printify product ID
        variant_id: variantId, // real Printify variant ID
        quantity: item.quantity,
      };
    });

    // 3. Prepare Printify order payload
    const printifyOrder = {
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
