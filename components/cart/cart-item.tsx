"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import type { CartItem as CartItemType } from "@/types/cart"
import { useState, useEffect } from "react"

interface CartItemProps {
  item: CartItemType
  printifyProducts?: any[]
}

export function CartItem({ item, printifyProducts = [] }: CartItemProps) {
  const { removeItem, updateQuantity, state } = useCart()
  const [imageError, setImageError] = useState(false)

  // Get the latest item data from the cart context to ensure we have the most up-to-date information
  const latestItem = state.items.find(cartItem => 
    cartItem.id === item.id && 
    cartItem.size === item.size && 
    cartItem.color === item.color
  ) || item
  
  console.log(`[CartItem] Item ${item.id}:`, {
    originalItem: item,
    latestItem: latestItem,
    cartContextItems: state.items
  })

  // Enhanced Helper: Map cart item to Printify product/variant with intelligent color-to-image mapping
  function getPrintifyProductInfo(cartItem: any) {
    console.log(`[Cart Item] Processing item:`, cartItem)
    console.log(`[Cart Item] Item variantImage:`, cartItem.variantImage);
    console.log(`[Cart Item] Item keys:`, Object.keys(cartItem));
    console.log(`[Cart Item] Printify products count:`, printifyProducts.length)
    
    // PRIORITY 1: If we have a variant image stored, use it (this ensures color accuracy)
    if (cartItem.variantImage) {
      console.log(`[Cart Item] PRIORITY 1: Using stored variant image for color accuracy:`, cartItem.variantImage)
      
      // Get Printify data for name/price if available
      const printifyProduct = printifyProducts[cartItem.id - 1];
      if (printifyProduct) {
        const variant = printifyProduct.variants?.find((v: any) => v.is_enabled) || printifyProduct.variants?.[0];
        let price = variant?.price || 0;
        
        // Convert price from cents to dollars if needed
        if (price > 1000) {
          price = price / 100;
        }
        
        return {
          name: printifyProduct.name,
          price: price,
          size: cartItem.size,
          color: cartItem.color,
          image: cartItem.variantImage, // ALWAYS use the stored variant image for color accuracy
        };
      } else {
        // Fallback to item data if no Printify product found
        return {
          name: cartItem.name,
          image: cartItem.variantImage,
          price: cartItem.price,
          size: cartItem.size,
          color: cartItem.color,
        };
      }
    }
    
    // PRIORITY 2: Use Printify data if no variant image stored
    const printifyProduct = printifyProducts[cartItem.id - 1];
    if (printifyProduct) {
      console.log(`[Cart Item] PRIORITY 2: Using Printify data (no variant image stored):`, printifyProduct);
      
      const variant = printifyProduct.variants?.find((v: any) => v.is_enabled) || printifyProduct.variants?.[0];
      let price = variant?.price || 0;
      
      // Convert price from cents to dollars if needed
      if (price > 1000) {
        price = price / 100;
      }
      
      return {
        name: printifyProduct.name,
        price: price,
        size: cartItem.size,
        color: cartItem.color,
        image: printifyProduct.images?.[0]?.src || "/placeholder.svg",
      };
    }
    
    const product = printifyProducts[cartItem.id - 1]
    console.log(`[Cart Item] Found product for ID ${cartItem.id}:`, product)
    
    if (!product) {
      console.log(`[Cart Item] No product found, using fallback`)
      return { name: cartItem.name, image: cartItem.image1, price: cartItem.price, size: cartItem.size, color: cartItem.color }
    }
    
    // Use Printify product name and price
    const variant = product.variants?.find((v: any) => v.is_enabled) || product.variants?.[0];
    console.log(`[Cart Item] Variant found:`, variant);
    console.log(`[Cart Item] Variant price (raw):`, variant?.price);
    console.log(`[Cart Item] Item price (fallback):`, item.price);
    
    // Check if Printify price is in cents (usually > 1000) or dollars
    let price;
    if (variant?.price) {
      if (variant.price > 1000) {
        // Likely in cents, convert to dollars
        price = variant.price / 100;
        console.log(`[Cart Item] Converting cents to dollars: ${variant.price} -> $${price}`);
      } else {
        // Already in dollars
        price = variant.price;
        console.log(`[Cart Item] Price already in dollars: $${price}`);
      }
    } else {
      price = item.price;
      console.log(`[Cart Item] Using fallback price: $${price}`);
    }
    
    // Strategy 1: Use Printify's variant ID system for exact color matching
    const colorName = cartItem.color
    const colorNameLower = colorName?.toLowerCase()
    
    console.log(`[Cart Item] Looking for color: ${colorName}`)
    console.log(`[Cart Item] Product options:`, product.options)
    console.log(`[Cart Item] Product variants:`, product.variants)
    console.log(`[Cart Item] Product images:`, product.images)
    
    if (colorName && product.options) {
      // Find the color option
      const colorOption = product.options.find((opt: any) => 
        opt.name && opt.name.toLowerCase().includes('color')
      )
      
      if (colorOption && colorOption.values) {
        // Find the selected color value
        const selectedColorValue = colorOption.values.find((val: any) => 
          val.title && val.title.toLowerCase() === colorNameLower
        )
        
        if (selectedColorValue) {
          console.log(`[Cart Item] Looking for variant with color: ${selectedColorValue.title} (ID: ${selectedColorValue.id})`)
          
          // Strategy 1a: Try to find a variant that has this color ID in its options
          const matchingVariant = product.variants?.find((variant: any) => {
            if (variant.originalVariant && variant.originalVariant.options) {
              // Check if this variant contains the color ID
              return variant.originalVariant.options.includes(selectedColorValue.id)
            }
            return false
          })
          
          if (matchingVariant) {
            console.log(`[Cart Item] Found variant ${matchingVariant.id} that matches color ${selectedColorValue.title}`)
            
            // Now find the best image for this variant
            const variantImages = product.images?.filter((img: any) => 
              img.variant_ids.includes(matchingVariant.id)
            ) || []
            
            if (variantImages.length > 0) {
              // Prefer front-facing images over folded/back views
              const frontImage = variantImages.find((img: any) => 
                img.src.includes('front') || 
                img.src.includes('main') || 
                !img.src.includes('folded') && !img.src.includes('back')
              )
              
                                  if (frontImage) {
                      console.log(`[Cart Item] Using front-facing variant image:`, frontImage.src)
                      return {
                        name: product.title || product.name,
                        image: frontImage.src,
                        price: price,
                        size: cartItem.size,
                        color: cartItem.color,
                      }
                    } else {
                      // Use any variant image if no front-facing one found
                      console.log(`[Cart Item] Using variant image:`, variantImages[0].src)
                      return {
                        name: product.title || product.name,
                        image: variantImages[0].src,
                        price: price,
                        size: cartItem.size,
                        color: cartItem.color,
                      }
                    }
            }
          }
        }
      }
    }
    
    // Strategy 2: Fallback to intelligent color-to-image mapping
    const availableImages = product.images?.filter((img: any) => img.variant_ids.length > 0) || []
    
    if (availableImages.length > 0) {
      // First, try to find an image that contains the color name in its URL
      const colorMatchingImage = availableImages.find((img: any) => {
        const imgSrc = img.src.toLowerCase()
        const colorNameLower = colorName?.toLowerCase()
        
        if (!colorNameLower) return false
        
        // Check if the image URL contains the color name
        if (imgSrc.includes(colorNameLower)) {
          return true
        }
        
        // Check for common color synonyms
        if (colorNameLower.includes('black') && (imgSrc.includes('black') || imgSrc.includes('dark'))) return true
        if (colorNameLower.includes('white') && (imgSrc.includes('white') || imgSrc.includes('light'))) return true
        if (colorNameLower.includes('red') && imgSrc.includes('red')) return true
        if (colorNameLower.includes('blue') && imgSrc.includes('blue')) return true
        if (colorNameLower.includes('green') && imgSrc.includes('green')) return true
        if (colorNameLower.includes('yellow') && imgSrc.includes('yellow')) return true
        if (colorNameLower.includes('orange') && imgSrc.includes('orange')) return true
        if (colorNameLower.includes('purple') && imgSrc.includes('purple')) return true
        if (colorNameLower.includes('pink') && imgSrc.includes('pink')) return true
        if (colorNameLower.includes('brown') && imgSrc.includes('brown')) return true
        if (colorNameLower.includes('gray') && (imgSrc.includes('gray') || imgSrc.includes('grey'))) return true
        
        return false
      })
      
                  if (colorMatchingImage) {
              console.log(`[Cart Item] Found color-matching image URL:`, colorMatchingImage.src)
              return {
                name: product.title || product.name,
                image: colorMatchingImage.src,
                price: price,
                size: cartItem.size,
                color: cartItem.color,
              }
            }
      
      // Strategy 3: Use intelligent color-to-image mapping with preference for front-facing images
      const colorToImageIndex = (() => {
        const colorNameLower = colorName?.toLowerCase()
        
        if (!colorNameLower) return 0
        
        // Map colors to image positions based on color theory and common associations
        if (colorNameLower.includes('black') || colorNameLower.includes('dark')) return 0
        if (colorNameLower.includes('white') || colorNameLower.includes('light')) return 1
        if (colorNameLower.includes('red')) return 2
        if (colorNameLower.includes('blue')) return 3
        if (colorNameLower.includes('green')) return 4
        if (colorNameLower.includes('yellow')) return 5
        if (colorNameLower.includes('orange')) return 6
        if (colorNameLower.includes('purple')) return 7
        if (colorNameLower.includes('pink')) return 8
        if (colorNameLower.includes('brown')) return 9
        if (colorNameLower.includes('gray') || colorNameLower.includes('grey')) return 10
        
        // For other colors, use a hash-based fallback
        return Math.abs(colorNameLower.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)) % availableImages.length
      })()
      
      // Prefer front-facing images over folded/back views
      const frontImages = availableImages.filter((img: any) => 
        img.src.includes('front') || 
        img.src.includes('main') || 
        !img.src.includes('folded') && !img.src.includes('back')
      )
      
      const imagesToUse = frontImages.length > 0 ? frontImages : availableImages
      const imageIndex = colorToImageIndex % imagesToUse.length
      const selectedImage = imagesToUse[imageIndex]
      
      console.log(`[Cart Item] Using intelligent color-to-image mapping: ${colorName} -> index ${colorToImageIndex} -> image ${imageIndex}`)
      console.log(`[Cart Item] Selected image:`, selectedImage.src)
      console.log(`[Cart Item] Image type: ${frontImages.length > 0 ? 'front-facing' : 'any available'}`)
      
                  return {
              name: product.title || product.name,
              image: selectedImage.src,
              price: price,
              size: cartItem.size,
              color: cartItem.color,
            }
          }
          
          // Strategy 4: Fallback to default image
          console.log(`[Cart Item] No suitable image found for color ${colorName}, using default image`)
    return {
            name: product.title || product.name,
      image: product.images?.[0]?.src || item.image1 || "/placeholder.svg",
            price: price,
            size: cartItem.size,
            color: cartItem.color,
          }
  }

  console.log(`[Cart Item] About to call getPrintifyProductInfo with:`, latestItem);
  console.log(`[Cart Item] latestItem.variantImage:`, latestItem.variantImage);
  const info = getPrintifyProductInfo(latestItem)
  console.log(`[Cart Item] getPrintifyProductInfo returned:`, info);

  const handleIncrement = () => {
    updateQuantity(latestItem.id, latestItem.quantity + 1)
  }

  const handleDecrement = () => {
    if (latestItem.quantity > 1) {
      updateQuantity(latestItem.id, latestItem.quantity - 1)
    } else {
      removeItem(latestItem.id, latestItem.variantId, latestItem.size, latestItem.color)
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="flex items-center py-6 border-b border-gray-200 last:border-b-0">
      <div className="relative h-20 w-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
        {!imageError ? (
          <Image 
            src={info.image} 
            alt={info.name} 
            fill 
            className="object-cover"
            onError={handleImageError}
            sizes="80px"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>
      <div className="ml-6 flex-grow">
        <Link href={`/product/${latestItem.id}`} className="text-base font-medium text-gray-900 hover:text-yellow-500 transition-colors">
          {info.name}
        </Link>
        <p className="text-sm text-gray-600 mt-1">${info.price.toFixed(2)}</p>
        {info.color && <p className="text-xs text-gray-500 mt-1">Color: {info.color}</p>}
        {info.size && <p className="text-xs text-gray-500 mt-1">Size: {info.size}</p>}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDecrement}
          className="h-6 w-6 rounded-full bg-dark-700 hover:bg-dark-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Minus className="h-3 w-3 text-gray-300" />
        </Button>
        <span className="text-sm text-gray-300 w-6 text-center">{latestItem.quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleIncrement}
          className="h-6 w-6 rounded-full bg-dark-700 hover:bg-dark-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <Plus className="h-3 w-3 text-gray-300" />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeItem(latestItem.id, latestItem.variantId, latestItem.size, latestItem.color)}
        className="ml-4 h-6 w-6 rounded-full bg-dark-700 hover:bg-dark-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <X className="h-4 w-4 text-gray-300" />
      </Button>
    </div>
  )
}
