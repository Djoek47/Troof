"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { ShoppingCart } from "lucide-react"

// Printify product types
interface PrintifyProductCardProps {
  id: string
  name: string
  description: string
  price: number
  image: string
  variants: Array<{
    id: number
    price: number
    is_enabled: boolean
  }>
  images: Array<{
    src: string
    variant_ids: number[]
    position: string
    is_default: boolean
  }>
  options: Array<{
    name: string
    type: string
    values: Array<{
      id: number
      title: string
    }>
  }>
}

export function HoodieCard({
  id, // This is the mapped id (1-6), not the Printify id
  name,
  price,
  image,
  variants,
  images,
  options,
  description,
}: PrintifyProductCardProps) {
  const { addItem } = useCart()
  // State for step-by-step selection
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [colorSelectOpen, setColorSelectOpen] = useState(false);

  // Find color and size options
  const colorOption = options.find(opt => opt.type === 'color');
  const sizeOption = options.find(opt => opt.type === 'size');
  
  // Use all available colors from the API (already filtered to enabled variants)
  const colorLabel = colorOption?.values.find(val => String(val.id) === selectedColorId)?.title;
  const sizeLabel = sizeOption?.values.find(val => String(val.id) === selectedSizeId)?.title;

  // Find the variant that matches selected color and size
  const selectedVariant = variants.find((variant) => {
    if (!colorOption && !sizeOption) return variant.is_enabled;
    let matches = true;
    // Only check variant.options if present (PrintifyVariant.options is optional)
    if (colorOption && selectedColorId) {
      if (Array.isArray((variant as any).options)) {
        matches = matches && (variant as any).options.some((o: any) => o.name && o.name.toLowerCase().includes('color') && o.value == colorLabel);
      } else {
        matches = matches && colorLabel === undefined;
      }
    }
    if (sizeOption && selectedSizeId) {
      if (Array.isArray((variant as any).options)) {
        matches = matches && (variant as any).options.some((o: any) => o.name && o.name.toLowerCase().includes('size') && o.value == sizeLabel);
      } else {
        matches = matches && sizeLabel === undefined;
      }
    }
    return matches && variant.is_enabled;
  }) || variants[0];

  // Get the image for the selected variant, fallback to default
  const displayImage = images.find((img) =>
    selectedVariant && img.variant_ids.includes(selectedVariant.id)
  )?.src || image;

  // Step logic
  const colorStepActive = !selectedColorId;
  const sizeStepActive = !!selectedColorId && !selectedSizeId;
  const canAddToCart = !!selectedColorId && !!selectedSizeId;

  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId);
    setSelectedSizeId(null); // Reset size when color changes
    setAddedToCart(false);
    setColorSelectOpen(false); // Hide color options after selection
  };
  const handleSizeSelect = (sizeId: string) => {
    setSelectedSizeId(sizeId);
    setAddedToCart(false);
  };
  const handleAddToCart = () => {
    addItem({
      id: Number(id),
      quantity: 1,
      size: sizeLabel,
      color: colorLabel,
    });
    setAddedToCart(true);
  };

  // Add a timer to reset 'addedToCart' after showing success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (addedToCart) {
      timer = setTimeout(() => setAddedToCart(false), 1500);
    }
    return () => clearTimeout(timer);
  }, [addedToCart]);

  return (
    <div className="bg-dark-800 rounded-lg overflow-hidden group">
      <div
        className="relative aspect-square"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={displayImage}
          alt={name}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute top-2 right-2">
          <Badge className="bg-yellow-500 text-dark-900 hover:bg-yellow-600">Metaverse Item</Badge>
        </div>
        {/* Hover overlay for View Details */}
        <Link href={`/product/${id}`}>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-20">
              View Details
            </span>
          </div>
        </Link>
      </div>
      <div className="p-4">
        <Link href={`/product/${id}`}>
          <h3 className="text-lg font-semibold text-gray-100 group-hover:text-yellow-500 transition-colors cursor-pointer">{name}</h3>
        </Link>
        <p className="text-gray-400 mb-2">${(selectedVariant?.price || price).toFixed(2)}</p>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{description}</p>
        
        {/* View Details Button */}
        {/* Removed as per edit hint */}
        {/* Step 1: Choose Color */}
        {colorOption && (
          <div className="mb-2">
            {/* Only show the button for opening color selection if color not yet selected AND color select is not open */}
            {colorStepActive && !colorSelectOpen && (
              <Button
                className={`w-full bg-yellow-500 text-dark-900 font-semibold`}
                onClick={() => setColorSelectOpen(true)}
              >
                Choose Color
              </Button>
            )}
            {/* Color selection pills appear after clicking the button OR when changing color */}
            {colorSelectOpen && (
              <div className="mt-2 flex flex-wrap gap-2">
                {colorOption.values.map((val) => (
                  <button
                    key={val.id}
                    type="button"
                    onClick={() => handleColorSelect(String(val.id))}
                    className={`px-4 py-1 rounded-full font-semibold text-xs transition-colors
                      ${selectedColorId === String(val.id)
                        ? 'bg-yellow-400 text-black border-2 border-yellow-500'
                        : 'bg-black text-white border border-gray-700 hover:bg-yellow-500 hover:text-black'}
                    `}
                  >
                    {val.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {/* Step 2: Choose Size (always show clickable pill(s), even if only one size) */}
        {sizeOption && !!selectedColorId && !selectedSizeId && (
          <div className="mb-2">
            <span className="text-xs text-gray-400 font-medium">Sizes</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizeOption.values.map((val) => (
                <button
                  key={val.id}
                  type="button"
                  onClick={() => handleSizeSelect(String(val.id))}
                  className={`px-4 py-1 rounded-full font-semibold text-xs transition-colors
                    ${selectedSizeId === String(val.id)
                      ? 'bg-blue-600 text-white border-2 border-blue-400'
                      : 'bg-black text-white border border-gray-700 hover:bg-blue-500 hover:text-white'}
                  `}
                >
                  {val.title}
                </button>
              ))}
            </div>
            {/* Change Color as text under size selection */}
            {colorOption && (
              <div className="mt-3">
                <button
                  type="button"
                  className="text-yellow-500 hover:text-yellow-400 text-sm font-medium underline"
                  onClick={() => { 
                    setSelectedColorId(null); 
                    setSelectedSizeId(null); 
                    setAddedToCart(false);
                    setColorSelectOpen(true); // Show color selection directly
                  }}
                >
                  Change Color
                </button>
              </div>
            )}
          </div>
        )}
        {/* Step 3: Add to Cart */}
        {canAddToCart && (
          <div className="flex gap-2 mt-2">
            <Button
              className={`flex-1 border-2 border-yellow-400 font-bold py-3 flex items-center justify-center text-sm transition-colors
                ${addedToCart
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-transparent text-yellow-400 hover:bg-yellow-400 hover:text-black'}
              `}
              onClick={handleAddToCart}
              disabled={addedToCart}
            >
              {addedToCart ? (
                <>
                  <span className="mr-2">✔</span> Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                </>
              )}
            </Button>
          </div>
        )}
        {/* Change Color/Size after adding to cart or when both options are selected */}
        {selectedColorId && selectedSizeId && (
          <>
            <div className="text-xs text-gray-400 text-center mt-4 mb-2">Want to add another with a different option?</div>
            <div className="flex gap-2">
              {colorOption && (
                <Button
                  className="flex-1 border-2 border-green-500 text-green-500 font-bold bg-transparent hover:bg-green-500 hover:text-white transition-colors py-3 text-sm"
                  style={{ boxShadow: 'none' }}
                  onClick={() => { 
                    setSelectedColorId(null); 
                    setSelectedSizeId(null); 
                    setAddedToCart(false);
                    setColorSelectOpen(true); // Show color selection directly
                  }}
                  variant="outline"
                >
                  Change Color
                </Button>
              )}
              {sizeOption && (
                <Button
                  className="flex-1 border-2 border-blue-500 text-blue-500 font-bold bg-transparent hover:bg-blue-500 hover:text-white transition-colors py-3 text-sm"
                  style={{ boxShadow: 'none' }}
                  onClick={() => { setSelectedSizeId(null); setAddedToCart(false); }}
                  variant="outline"
                >
                  Change Size
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
