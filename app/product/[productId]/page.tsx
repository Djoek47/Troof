"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { CartWrapper } from "@/components/cart-wrapper"
import { ProductSplashScreen } from "@/components/splash-screen"
import { CheckCircle, ShoppingCart, Minus, Plus } from "lucide-react"

export default function ProductDetailPage() {
  const { productId } = useParams() as { productId: string }
  const router = useRouter()
  const { addItem, state } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null)
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch the product directly using the mapped ID
        const res = await fetch(`/api/printify-products`)
        if (!res.ok) throw new Error("Failed to fetch products")
        const products = await res.json()
        const mappedIndex = Number(productId) - 1
        const productData = products[mappedIndex]
        if (!productData) throw new Error("Product not found")
        
        setProduct(productData)
        setSelectedImage(productData.image || "")
      } catch (e: any) {
        setError(e.message || "Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    if (productId) fetchProduct()
  }, [productId])

  // Add a timer to reset 'addedToCart' after showing success
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (addedToCart) {
      timer = setTimeout(() => setAddedToCart(false), 1500)
    }
    return () => clearTimeout(timer)
  }, [addedToCart])

  if (loading) return <ProductSplashScreen />
  if (error) return <div className="text-center text-red-500 py-20">{error}</div>
  if (!product) return null

  // Find color and size options
  const colorOption = product.options?.find((opt: any) => opt.type === 'color')
  const sizeOption = product.options?.find((opt: any) => opt.type === 'size')
  const colorLabel = colorOption?.values.find((val: any) => String(val.id) === selectedColorId)?.title
  const sizeLabel = sizeOption?.values.find((val: any) => String(val.id) === selectedSizeId)?.title

  // Find the variant that matches selected color and size
  const selectedVariant = product.variants?.find((variant: any) => {
    if (!colorOption && !sizeOption) return variant.is_enabled
    let matches = true
    if (colorOption && selectedColorId) {
      if (Array.isArray((variant as any).options)) {
        matches = matches && (variant as any).options.some((o: any) => o.name && o.name.toLowerCase().includes('color') && o.value == colorLabel)
      } else {
        matches = matches && colorLabel === undefined
      }
    }
    if (sizeOption && selectedSizeId) {
      if (Array.isArray((variant as any).options)) {
        matches = matches && (variant as any).options.some((o: any) => o.name && o.name.toLowerCase().includes('size') && o.value == sizeLabel)
      } else {
        matches = matches && sizeLabel === undefined
      }
    }
    return matches && variant.is_enabled
  }) || product.variants?.[0]

  const handleColorSelect = (colorId: string) => {
    setSelectedColorId(colorId)
    setSelectedSizeId(null) // Reset size when color changes
    setAddedToCart(false)
    
    // Copy the exact working logic from hoodie-card.tsx
    if (product?.images && product.images.length > 0) {
      const colorName = colorOption?.values.find(val => String(val.id) === colorId)?.title;
      
      if (colorName) {
        console.log(`[Product Page] Looking for image for color: ${colorName}`);
        
        // Strategy 1: Use Printify's variant ID system for exact color matching
        const colorNameLower = colorName.toLowerCase();
        
        // First, try to find the variant that corresponds to this color
        const selectedColorValue = colorOption?.values.find(val => String(val.id) === colorId);
        
        if (selectedColorValue) {
          console.log(`[Product Page] Looking for variant with color: ${selectedColorValue.title} (ID: ${selectedColorValue.id})`);
          
          // Strategy 1a: Try to find a variant that has this color ID in its options
          const matchingVariant = product.variants?.find(variant => {
            if (variant.originalVariant && variant.originalVariant.options) {
              // Check if this variant contains the color ID
              return variant.originalVariant.options.includes(selectedColorValue.id);
            }
            return false;
          });
          
          if (matchingVariant) {
            console.log(`[Product Page] Found variant ${matchingVariant.id} that matches color ${selectedColorValue.title}`);
            
            // Now find the best image for this variant
            const variantImages = product.images.filter(img => 
              img.variant_ids && img.variant_ids.includes(matchingVariant.id)
            );
            
            if (variantImages.length > 0) {
              // Prefer front-facing images over folded/back views
              const frontImage = variantImages.find(img => 
                img.src.includes('front') || 
                img.src.includes('main') || 
                !img.src.includes('folded') && !img.src.includes('back')
              );
              
              if (frontImage) {
                console.log(`[Product Page] Using front-facing variant image:`, frontImage.src);
                setSelectedImage(frontImage.src);
                return;
              } else {
                // Use any variant image if no front-facing one found
                console.log(`[Product Page] Using variant image:`, variantImages[0].src);
                setSelectedImage(variantImages[0].src);
                return;
              }
            }
          }
        }
        
        // Strategy 2: Fallback to intelligent color-to-image mapping
        const availableImages = product.images.filter(img => img.variant_ids && img.variant_ids.length > 0);
        
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
            console.log(`[Product Page] Found color-matching image URL:`, colorMatchingImage.src);
            setSelectedImage(colorMatchingImage.src);
            return;
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
            return colorOption?.values.findIndex(val => String(val.id) === colorId) || 0;
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
          
          console.log(`[Product Page] Using intelligent color-to-image mapping: ${colorName} -> index ${colorToImageIndex} -> image ${imageIndex}`);
          console.log(`[Product Page] Selected image:`, selectedImage.src);
          console.log(`[Product Page] Image type: ${frontImages.length > 0 ? 'front-facing' : 'any available'}`);
          
          setSelectedImage(selectedImage.src);
          return;
        }
        
        // Strategy 4: Fallback to default image
        console.log(`[Product Page] No suitable image found for color ${colorName}, using default image`);
        setSelectedImage(product.images[0].src);
        return;
      }
    }
    
    console.log(`[Product Page] Using default image:`, product.images?.[0]?.src);
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0].src);
    }
  }

  const handleSizeSelect = (sizeId: string) => {
    setSelectedSizeId(sizeId)
    setAddedToCart(false)
    
    // When size changes, we might want to update the image based on the current color selection
    // For now, keep the current selected image since color is the primary driver
    console.log(`[Product Page] Size selected: ${sizeId}`);
  }

  const handleAddToCart = () => {
    // Simple approach: use the currently selected image or first product image
    const variantImage = selectedImage || product.images?.[0]?.src || "/placeholder.svg";
    
    console.log(`[Product Page] handleAddToCart - Debug Info:`, {
      selectedColorId,
      selectedSizeId,
      colorLabel,
      sizeLabel,
      selectedImage,
      variantImage,
      selectedVariant
    });
    
    console.log(`[Product Page] Final cart item:`, {
      id: Number(productId),
      quantity,
      size: sizeLabel,
      color: colorLabel,
      variantImage: variantImage,
      selectedVariant: selectedVariant
    });
    
    addItem({
      id: Number(productId),
      quantity,
      size: sizeLabel,
      color: colorLabel,
      variantImage: variantImage, // Pass the selected image
    })
    setAddedToCart(true)
  }

  return (
    <CartWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center py-12 px-4 mt-20">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-12 bg-white rounded-3xl p-10 shadow-2xl border border-gray-100 hover:shadow-3xl transition-all duration-500">
          {/* Image Gallery */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full mb-6 flex justify-start">
              <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center font-light transition-colors tracking-wide" onClick={() => router.back()}>
                &larr; Back to Store
              </button>
            </div>
            <div className="relative w-full max-w-lg aspect-square mb-6">
              <Image
                src={selectedImage || product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain rounded-3xl bg-gray-50 shadow-lg"
                priority
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 mt-4 flex-wrap justify-center">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={img.src}
                    className={`w-20 h-20 rounded-2xl border-2 transition-all duration-300 ${selectedImage === img.src ? "border-yellow-500 shadow-xl scale-105" : "border-gray-200 hover:border-gray-300 hover:shadow-md"}`}
                    onClick={() => setSelectedImage(img.src)}
                  >
                    <Image src={img.src} alt={`thumb-${idx}`} width={80} height={80} className="object-cover rounded-xl" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 flex flex-col">
            <div className="mb-8">
              <h1 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">
                {product.name}
              </h1>
              <p className="text-2xl text-yellow-500 font-light mb-6">
                ${selectedVariant?.price || product.price || 0}
              </p>
              <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed" 
                   dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {/* Color Selection */}
            {colorOption && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {colorOption.values.map((color: any) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(String(color.id))}
                      className={`px-6 py-3 rounded-2xl border-2 transition-all duration-300 font-light ${
                        selectedColorId === String(color.id)
                          ? "border-yellow-500 bg-yellow-50 text-yellow-700 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:shadow-md"
                      }`}
                    >
                      {color.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizeOption && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {sizeOption.values.map((size: any) => (
                    <button
                      key={size.id}
                      onClick={() => handleSizeSelect(String(size.id))}
                      className={`px-6 py-3 rounded-2xl border-2 transition-all duration-300 font-light ${
                        selectedSizeId === String(size.id)
                          ? "border-yellow-500 bg-yellow-50 text-yellow-700 shadow-lg"
                          : "border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:shadow-md"
                      }`}
                    >
                      {size.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="text-xl font-light text-gray-900 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-white text-gray-700 hover:shadow-md transition-all duration-300 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mt-auto">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedColorId || !selectedSizeId}
                className="w-full py-6 text-xl font-light bg-yellow-500 hover:bg-yellow-600 text-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {addedToCart ? (
                  <div className="flex items-center justify-center gap-3">
                    <CheckCircle className="w-6 h-6" />
                    Added to Cart!
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <ShoppingCart className="w-6 h-6" />
                    Add to Cart
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CartWrapper>
  )
}
