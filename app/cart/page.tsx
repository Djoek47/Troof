"use client"

import { useCart } from "@/context/cart-context";
import { CartItem } from "@/types/cart";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function CartPage() {
  const { state, clearCart } = useCart();
  const [printifyProducts, setPrintifyProducts] = useState<any[]>([]);

  // Fetch Printify products for color matching
  useEffect(() => {
    const fetchPrintifyProducts = async () => {
      try {
        const res = await fetch("/api/printify-products");
        if (res.ok) {
          const data = await res.json();
          setPrintifyProducts(data);
        }
      } catch (e) {
        console.error("Failed to fetch Printify products for cart page:", e);
      }
    };
    fetchPrintifyProducts();
  }, []);

  // Function to get the correct image for a cart item (same logic as CartItem)
  const getItemImage = (item: CartItem) => {
    // If we have variantImage, use it
    if (item.variantImage) {
      return item.variantImage;
    }

    // Otherwise, use color matching logic
    const printifyProduct = printifyProducts[item.id - 1];
    if (printifyProduct && item.color && printifyProduct.options) {
      // Find the color option
      const colorOption = printifyProduct.options.find((opt: any) => 
        opt.name && opt.name.toLowerCase().includes('color')
      );
      
      if (colorOption && colorOption.values) {
        // Find the selected color value
        const selectedColorValue = colorOption.values.find((val: any) => 
          val.title && val.title.toLowerCase() === item.color.toLowerCase()
        );
        
        if (selectedColorValue) {
          // Find variant with this color
          const matchingVariant = printifyProduct.variants?.find((variant: any) => {
            if (variant.originalVariant && variant.originalVariant.options) {
              return variant.originalVariant.options.includes(selectedColorValue.id);
            }
            return false;
          });
          
          if (matchingVariant) {
            // Find image for this variant
            const variantImages = printifyProduct.images?.filter((img: any) => 
              img.variant_ids.includes(matchingVariant.id)
            ) || [];
            
            if (variantImages.length > 0) {
              // Prefer front-facing images
              const frontImage = variantImages.find((img: any) => 
                img.src.includes('front') || 
                img.src.includes('main') || 
                !img.src.includes('folded') && !img.src.includes('back')
              );
              
              return frontImage ? frontImage.src : variantImages[0].src;
            }
          }
        }
      }
    }
    
    // Fallback to item.image1 or placeholder
    return item.image1 || "/placeholder.svg";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>
      
      {state.items.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4">
            {state.items.map((item: CartItem) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded">
                <div className="relative w-24 h-24">
                  <Image 
                    src={getItemImage(item)} 
                    alt={item.name} 
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  {item.color && <p className="text-gray-600">Color: {item.color}</p>}
                  {item.size && <p className="text-gray-600">Size: {item.size}</p>}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={clearCart}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
            >
              Clear Cart
            </button>
            
            <div className="text-xl font-bold">
              Total: ${state.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0).toFixed(2)}
            </div>
          </div>
        </>
      )}
    </div>
  );
} 