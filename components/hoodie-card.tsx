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
    options?: any[]
    color?: string
    size?: string
    image?: string
    blueprint_id?: number
    originalVariant?: any
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
  const { addItem, currentWalletId } = useCart()
  // State for step-by-step selection
  const [selectedColorId, setSelectedColorId] = useState<string | null>(() => {
    const stored = localStorage.getItem(`hoodie-${id}-color`)
    console.log(`[HoodieCard ${id}] Loading stored color from localStorage:`, stored)
    return stored || null
  })
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(() => {
    const stored = localStorage.getItem(`hoodie-${id}-size`)
    console.log(`[HoodieCard ${id}] Loading stored size from localStorage:`, stored)
    return stored || null
  })
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
  const selectedVariant = (() => {
    // For now, just return the first enabled variant since we don't have full variant details
    // The color change will be handled by the image selection logic above
    return variants.find(v => v.is_enabled) || variants[0];
  })();

  // Get the image for the selected variant, fallback to default
  const displayImage = (() => {
    console.log(`[HoodieCard ${id}] Calculating displayImage - Wallet: ${!!currentWalletId}, Color: ${selectedColorId}, Size: ${selectedSizeId}`);
    
    if (selectedColorId) {
      const colorName = colorOption?.values.find(val => String(val.id) === selectedColorId)?.title;
      
      if (colorName) {
        console.log(`[HoodieCard ${id}] Looking for image for color: ${colorName}`);
        
        // Strategy 1: Use Printify's variant ID system for exact color matching
        const colorNameLower = colorName.toLowerCase();
        
        // First, try to find the variant that corresponds to this color
        // We'll use the color ID to find the matching variant
        const selectedColorValue = colorOption?.values.find(val => String(val.id) === selectedColorId);
        
        if (selectedColorValue) {
          console.log(`[HoodieCard ${id}] Looking for variant with color: ${selectedColorValue.title} (ID: ${selectedColorValue.id})`);
          
          // Strategy 1a: Try to find a variant that has this color ID in its options
          const matchingVariant = variants.find(variant => {
            if (variant.originalVariant && variant.originalVariant.options) {
              // Check if this variant contains the color ID
              return variant.originalVariant.options.includes(selectedColorValue.id);
            }
            return false;
          });
          
          if (matchingVariant) {
            console.log(`[HoodieCard ${id}] Found variant ${matchingVariant.id} that matches color ${selectedColorValue.title}`);
            
            // Now find the best image for this variant
            const variantImages = images.filter(img => 
              img.variant_ids.includes(matchingVariant.id)
            );
            
            if (variantImages.length > 0) {
              // Prefer front-facing images over folded/back views
              const frontImage = variantImages.find(img => 
                img.src.includes('front') || 
                img.src.includes('main') || 
                !img.src.includes('folded') && !img.src.includes('back')
              );
              
              if (frontImage) {
                console.log(`[HoodieCard ${id}] Using front-facing variant image:`, frontImage.src);
                return frontImage.src;
              } else {
                // Use any variant image if no front-facing one found
                console.log(`[HoodieCard ${id}] Using variant image:`, variantImages[0].src);
                return variantImages[0].src;
              }
            }
          }
        }
        
        // Strategy 2: Fallback to intelligent color-to-image mapping
        const availableImages = images.filter(img => img.variant_ids.length > 0);
        
        if (availableImages.length > 0) {
          // First, try to find an image that contains the color name in its URL
          const colorMatchingImage = availableImages.find(img => {
            const imgSrc = img.src.toLowerCase();
            const colorNameLower = colorName.toLowerCase();
            
            // Check if the image URL contains the color name
            if (imgSrc.includes(colorNameLower)) {
              return true;
            }
            
            // Check for common color synonyms
            if (colorNameLower.includes('black') && (imgSrc.includes('black') || imgSrc.includes('dark'))) return true;
            if (colorNameLower.includes('white') && (imgSrc.includes('white') || imgSrc.includes('light'))) return true;
            if (colorNameLower.includes('red') && imgSrc.includes('red')) return true;
            if (colorNameLower.includes('blue') && imgSrc.includes('blue')) return true;
            if (colorNameLower.includes('green') && imgSrc.includes('green')) return true;
            if (colorNameLower.includes('yellow') && imgSrc.includes('yellow')) return true;
            if (colorNameLower.includes('orange') && imgSrc.includes('orange')) return true;
            if (colorNameLower.includes('purple') && imgSrc.includes('purple')) return true;
            if (colorNameLower.includes('pink') && imgSrc.includes('pink')) return true;
            if (colorNameLower.includes('brown') && imgSrc.includes('brown')) return true;
            if (colorNameLower.includes('gray') && (imgSrc.includes('gray') || imgSrc.includes('grey'))) return true;
            
            return false;
          });
          
          if (colorMatchingImage) {
            console.log(`[HoodieCard ${id}] Found color-matching image URL:`, colorMatchingImage.src);
            return colorMatchingImage.src;
          }
          
          // Strategy 3: Use intelligent color-to-image mapping with preference for front-facing images
          const colorToImageIndex = (() => {
            const colorNameLower = colorName.toLowerCase();
            
            // Map colors to image positions based on color theory and common associations
            if (colorNameLower.includes('black') || colorNameLower.includes('dark')) return 0;
            if (colorNameLower.includes('white') || colorNameLower.includes('light')) return 1;
            if (colorNameLower.includes('red')) return 2;
            if (colorNameLower.includes('blue')) return 3;
            if (colorNameLower.includes('green')) return 4;
            if (colorNameLower.includes('yellow')) return 5;
            if (colorNameLower.includes('orange')) return 6;
            if (colorNameLower.includes('purple')) return 7;
            if (colorNameLower.includes('pink')) return 8;
            if (colorNameLower.includes('brown')) return 9;
            if (colorNameLower.includes('gray') || colorNameLower.includes('grey')) return 10;
            
            // For other colors, use the color index as a fallback
            return colorOption?.values.findIndex(val => String(val.id) === selectedColorId) || 0;
          })();
          
          // Prefer front-facing images over folded/back views
          const frontImages = availableImages.filter(img => 
            img.src.includes('front') || 
            img.src.includes('main') || 
            !img.src.includes('folded') && !img.src.includes('back')
          );
          
          const imagesToUse = frontImages.length > 0 ? frontImages : availableImages;
          const imageIndex = colorToImageIndex % imagesToUse.length;
          const selectedImage = imagesToUse[imageIndex];
          
          console.log(`[HoodieCard ${id}] Using intelligent color-to-image mapping: ${colorName} -> index ${colorToImageIndex} -> image ${imageIndex}`);
          console.log(`[HoodieCard ${id}] Selected image:`, selectedImage.src);
          console.log(`[HoodieCard ${id}] Image type: ${frontImages.length > 0 ? 'front-facing' : 'any available'}`);
          
          return selectedImage.src;
        }
        
        // Strategy 4: Fallback to default image
        console.log(`[HoodieCard ${id}] No suitable image found for color ${colorName}, using default image`);
        return image;
      }
    }
    
    console.log(`[HoodieCard ${id}] Using default image:`, image);
    return image;
  })();

  // Step logic
  const colorStepActive = !selectedColorId;
  const sizeStepActive = !!selectedColorId && !selectedSizeId;
  const canAddToCart = !!selectedColorId && !!selectedSizeId;

  // Persist color selection to localStorage
  const handleColorSelect = (colorId: string) => {
    console.log(`[HoodieCard ${id}] handleColorSelect called with colorId: ${colorId}, current wallet: ${!!currentWalletId}`)
    setSelectedColorId(colorId)
    localStorage.setItem(`hoodie-${id}-color`, colorId)
    setSelectedSizeId(null) // Reset size when color changes
    localStorage.removeItem(`hoodie-${id}-size`) // Clear stored size
    setAddedToCart(false) // Reset added to cart state
    setColorSelectOpen(false) // Hide color options after selection
  }
  const handleSizeSelect = (sizeId: string) => {
    console.log(`[HoodieCard ${id}] handleSizeSelect called with sizeId: ${sizeId}, current wallet: ${!!currentWalletId}`)
    setSelectedSizeId(sizeId)
    localStorage.setItem(`hoodie-${id}-size`, sizeId)
    setAddedToCart(false)
  }
  const handleAddToCart = () => {
    console.log(`[HoodieCard ${id}] handleAddToCart - Wallet: ${!!currentWalletId}, Color: ${colorLabel}, Size: ${sizeLabel}, Image: ${displayImage}`);
    addItem({
      id: Number(id),
      name: name,
      price: price,
      quantity: 1,
      size: sizeLabel,
      color: colorLabel,
      variantImage: displayImage,
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

  // Debug logging for wallet connection
  useEffect(() => {
    console.log(`[HoodieCard ${id}] State change - Wallet: ${!!currentWalletId}, Color: ${selectedColorId}, Size: ${selectedSizeId}`);
  }, [id, currentWalletId, selectedColorId, selectedSizeId]);

  // Debug when wallet connection changes
  useEffect(() => {
    console.log(`[HoodieCard ${id}] Wallet connection changed to: ${!!currentWalletId}`);
  }, [id, currentWalletId]);

  // Sync localStorage with state changes
  useEffect(() => {
    if (selectedColorId) {
      localStorage.setItem(`hoodie-${id}-color`, selectedColorId)
      console.log(`[HoodieCard ${id}] Saved color to localStorage:`, selectedColorId)
    } else {
      localStorage.removeItem(`hoodie-${id}-color`)
      console.log(`[HoodieCard ${id}] Removed color from localStorage`)
    }
  }, [id, selectedColorId])

  useEffect(() => {
    if (selectedSizeId) {
      localStorage.setItem(`hoodie-${id}-size`, selectedSizeId)
      console.log(`[HoodieCard ${id}] Saved size to localStorage:`, selectedSizeId)
    } else {
      localStorage.removeItem(`hoodie-${id}-size`)
      console.log(`[HoodieCard ${id}] Removed size from localStorage`)
    }
  }, [id, selectedSizeId])

  // Cleanup localStorage when component unmounts
  useEffect(() => {
    return () => {
      // Only clear if we're not keeping selections for wallet persistence
      // For now, we'll keep them to maintain user selections across wallet connections
    }
  }, [id])

  // Function to clear stored selections (useful for resetting state)
  const clearStoredSelections = () => {
    localStorage.removeItem(`hoodie-${id}-color`)
    localStorage.removeItem(`hoodie-${id}-size`)
  }

  // Function to reset all selections (useful for debugging)
  const resetSelections = () => {
    setSelectedColorId(null)
    setSelectedSizeId(null)
    setAddedToCart(false)
    clearStoredSelections()
  }

  return (
    <div className="bg-white rounded-3xl overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
      <div
        className="relative aspect-square bg-gray-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={displayImage}
          alt={name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 shadow-lg">
            Metaverse Item
          </Badge>
        </div>
        {/* Hover overlay for View Details */}
        <Link href={`/product/${id}`}>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
            <span className="text-white font-medium text-lg opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
              View Details
            </span>
          </div>
        </Link>
      </div>
      <div className="p-6">
        <Link href={`/product/${id}`}>
          <h3 className="text-lg font-medium text-gray-900 group-hover:text-yellow-600 transition-colors cursor-pointer mb-2 line-clamp-2 leading-tight">{name}</h3>
        </Link>
        <p className="text-2xl font-light text-gray-900 mb-3">${(selectedVariant?.price || price).toFixed(2)}</p>
        {description && (
          <div className="mb-6">
            <div 
              className="text-sm text-gray-600 leading-relaxed product-description"
              dangerouslySetInnerHTML={{ 
                __html: description.length > 200 
                  ? `${description.substring(0, 200)}...` 
                  : description 
              }}
            />
            {description.length > 200 && (
              <Link href={`/product/${id}`}>
                <span className="text-xs text-yellow-600 hover:text-yellow-700 font-medium cursor-pointer mt-2 inline-block hover:underline">
                  Read more →
                </span>
              </Link>
            )}
          </div>
        )}
        
        {/* View Details Button */}
        {/* Removed as per edit hint */}
        {/* Step 1: Choose Color */}
        {colorOption && (
          <div className="mb-2">
            {/* Only show the button for opening color selection if color not yet selected AND color select is not open */}
            {colorStepActive && !colorSelectOpen && (
              <Button
                className={`w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-full py-3 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
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
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105
                      ${selectedColorId === String(val.id)
                        ? 'bg-yellow-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}
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
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 transform hover:scale-105
                      ${selectedSizeId === String(val.id)
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}
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
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium transition-colors duration-300"
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
              className={`flex-1 font-medium py-3 flex items-center justify-center text-sm transition-all duration-300 transform hover:scale-105 rounded-full shadow-lg hover:shadow-xl
                ${addedToCart
                  ? 'bg-green-500 text-white'
                  : 'bg-yellow-500 hover:bg-yellow-600 text-white'}
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
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-300 transform hover:scale-105 py-3 text-sm rounded-full border-0"
                  onClick={() => { 
                    setSelectedColorId(null); 
                    setSelectedSizeId(null); 
                    setAddedToCart(false);
                    setColorSelectOpen(true); // Show color selection directly
                  }}
                >
                  Change Color
                </Button>
              )}
              {sizeOption && (
                <Button
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-300 transform hover:scale-105 py-3 text-sm rounded-full border-0"
                  onClick={() => { setSelectedSizeId(null); setAddedToCart(false); }}
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
