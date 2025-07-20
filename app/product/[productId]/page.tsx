"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { CartWrapper } from "@/components/cart-wrapper"
import { ProductSplashScreen } from "@/components/splash-screen"
import { CheckCircle, ShoppingCart } from "lucide-react"

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
  }

  const handleSizeSelect = (sizeId: string) => {
    setSelectedSizeId(sizeId)
    setAddedToCart(false)
  }

  const handleAddToCart = () => {
    addItem({
      id: Number(productId),
      quantity,
      size: sizeLabel,
      color: colorLabel,
    })
    setAddedToCart(true)
  }

  return (
    <CartWrapper>
      <div className="min-h-screen bg-dark-900 flex flex-col items-center py-8 px-2 mt-20">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 bg-dark-800 rounded-lg p-6">
          {/* Image Gallery */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full mb-4 flex justify-start">
              <button className="text-yellow-500 hover:text-yellow-600 text-sm flex items-center font-bold" onClick={() => router.back()}>
                &larr; Back to Store
              </button>
            </div>
            <div className="relative w-full max-w-md aspect-square mb-4">
              <Image
                src={selectedImage || product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-contain rounded-lg bg-dark-900"
                priority
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-2 flex-wrap justify-center">
                {product.images.map((img: any, idx: number) => (
                  <button
                    key={img.src}
                    className={`w-16 h-16 rounded border-2 ${selectedImage === img.src ? "border-yellow-500" : "border-transparent"}`}
                    onClick={() => setSelectedImage(img.src)}
                  >
                    <Image src={img.src} alt={`thumb-${idx}`} width={64} height={64} className="object-cover rounded" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info and Selection */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-yellow-500 mb-2">{product.name}</h1>
            <p className="text-lg text-gray-100 mb-2">${(selectedVariant?.price || product.price).toFixed(2)}</p>
            <p className="text-sm text-gray-400 mb-6">{product.description}</p>

            {/* Color Selection - Always Visible */}
            {colorOption && (
              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-400 mb-3">Colors</div>
                <div className="flex flex-wrap gap-2">
                  {colorOption.values.map((val: any) => (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => handleColorSelect(String(val.id))}
                      className={`px-4 py-2 rounded font-medium text-sm border transition-colors
                        ${selectedColorId === String(val.id)
                          ? 'bg-yellow-500 text-dark-900 border-yellow-500'
                          : 'bg-dark-900 text-gray-100 border-gray-700 hover:bg-yellow-600 hover:text-dark-900'}
                      `}
                    >
                      {val.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection - Always Visible */}
            {sizeOption && (
              <div className="mb-6">
                <div className="text-sm font-semibold text-gray-400 mb-3">Sizes</div>
                <div className="flex flex-wrap gap-2">
                  {sizeOption.values.map((val: any) => (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => handleSizeSelect(String(val.id))}
                      className={`px-4 py-2 rounded font-medium text-sm border transition-colors
                        ${selectedSizeId === String(val.id)
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-dark-900 text-gray-100 border-gray-700 hover:bg-blue-600 hover:text-white'}
                      `}
                    >
                      {val.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-400">Quantity</span>
              <button
                className="w-8 h-8 rounded bg-dark-900 text-gray-100 border border-gray-700 flex items-center justify-center text-xl hover:bg-yellow-600 hover:text-dark-900"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                type="button"
              >-</button>
              <span className="w-8 text-center text-gray-100">{quantity}</span>
              <button
                className="w-8 h-8 rounded bg-dark-900 text-gray-100 border border-gray-700 flex items-center justify-center text-xl hover:bg-yellow-600 hover:text-dark-900"
                onClick={() => setQuantity(q => q + 1)}
                type="button"
              >+</button>
            </div>

            {/* Add to Cart - Always Visible */}
            <div className="mb-4">
              <Button
                className={`w-full border-2 border-yellow-400 font-bold py-3 flex items-center justify-center text-sm transition-colors
                  ${addedToCart
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-transparent text-yellow-400 hover:bg-yellow-400 hover:text-black'}
                `}
                onClick={handleAddToCart}
                disabled={addedToCart || (!selectedColorId && colorOption) || (!selectedSizeId && sizeOption)}
              >
                {addedToCart ? (
                  <>
                    <span className="mr-2">✔</span> Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart - ${((selectedVariant?.price || product.price) * quantity).toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </CartWrapper>
  )
} 