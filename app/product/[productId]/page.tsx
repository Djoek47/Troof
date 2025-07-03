"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { CartWrapper } from "@/components/cart-wrapper"

export default function ProductDetailPage() {
  const { productId } = useParams() as { productId: string }
  const router = useRouter()
  const { addItem, state } = useCart()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [mappedId, setMappedId] = useState<number | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        // Step 1: Fetch the Printify product list (mapped 1-6)
        const listRes = await fetch(`/api/printify-products`)
        if (!listRes.ok) throw new Error("Failed to fetch product list")
        const listData = await listRes.json()
        const mappedIndex = Number(productId) - 1
        const mappedProduct = listData[mappedIndex]
        if (!mappedProduct) throw new Error("Product not found")
        setMappedId(mappedProduct.id) // Save the mapped id (1-6)
        const realPrintifyId = mappedProduct.originalId || mappedProduct.id
        // Step 2: Fetch the real Printify product by real id
        const res = await fetch(`/api/printify-products/${realPrintifyId}`)
        if (!res.ok) throw new Error("Failed to fetch product")
        const data = await res.json()
        console.log("Fetched Printify product:", data)
        setProduct(data)
        setSelectedImage(data.images?.[0]?.src || "")
      } catch (e: any) {
        setError(e.message || "Failed to load product")
      } finally {
        setLoading(false)
      }
    }
    if (productId) fetchProduct()
  }, [productId])

  if (loading) return <div className="text-center text-gray-300 py-20">Loading...</div>
  if (error) return <div className="text-center text-red-500 py-20">{error}</div>
  if (!product) return null

  // Robust field extraction with fallbacks
  const title = product.title || product.name || "Untitled Product"
  const description = product.description || product.body_html || "No description available."
  // Find the first enabled variant for price, fallback to first variant, then 0
  const enabledVariant = product.variants?.find((v: any) => v.is_enabled) || product.variants?.[0] || {}
  const price = (enabledVariant.price || 0) / 100
  // Options: look for type or fallback to name includes
  const colorOption = product.options?.find((opt: any) => opt.type === "color" || opt.name?.toLowerCase().includes("color"))
  const sizeOption = product.options?.find((opt: any) => opt.type === "size" || opt.name?.toLowerCase().includes("size"))

  const handleAddToCart = () => {
    if (mappedId == null) return
    addItem({
      id: mappedId, // Use mapped id (1-6) for cart
      quantity,
      size: selectedSize,
      color: selectedColor,
    })
  }

  return (
    <CartWrapper>
      <div className="min-h-screen bg-dark-900 flex flex-col items-center py-8 px-2 mt-20">
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 bg-dark-800 rounded-lg p-6">
          {/* Image Gallery and Product Info */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full mb-4 flex justify-start">
              <button className="text-yellow-500 hover:text-yellow-600 text-sm flex items-center font-bold" onClick={() => router.back()}>
                &larr; Back to Store
              </button>
            </div>
            <div className="relative w-full max-w-md aspect-square mb-4">
              <Image
                src={selectedImage || product.images?.[0]?.src || "/placeholder.svg"}
                alt={title}
                fill
                className="object-contain rounded-lg bg-dark-900"
                priority
              />
            </div>
            <div className="flex gap-2 mt-2 flex-wrap justify-center">
              {product.images?.map((img: any, idx: number) => (
                <button
                  key={img.src}
                  className={`w-16 h-16 rounded border-2 ${selectedImage === img.src ? "border-yellow-500" : "border-transparent"}`}
                  onClick={() => setSelectedImage(img.src)}
                >
                  <Image src={img.src} alt={`thumb-${idx}`} width={64} height={64} className="object-cover rounded" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="text-3xl font-bold text-gray-100 mb-2">{title}</h1>
            <p className="text-xl text-yellow-400 font-semibold mb-4">${price.toFixed(2)}</p>
            <div className="mb-4 text-gray-300 text-base" dangerouslySetInnerHTML={{ __html: description }} />
            {/* Color Selector */}
            {colorOption && colorOption.values?.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">Colors</div>
                <div className="flex flex-wrap gap-2">
                  {colorOption.values.map((val: any) => (
                    <button
                      key={val.id}
                      className={`px-4 py-2 rounded font-medium border transition-colors ${selectedColor === val.title ? "bg-yellow-500 text-dark-900 border-yellow-500" : "bg-dark-900 text-gray-100 border-gray-700 hover:bg-yellow-600 hover:text-dark-900"}`}
                      onClick={() => setSelectedColor(val.title)}
                      type="button"
                    >
                      {val.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Size Selector */}
            {sizeOption && sizeOption.values?.length > 0 && (
              <div className="mb-4">
                <div className="text-sm font-semibold mb-2">Sizes</div>
                <div className="flex flex-wrap gap-2">
                  {sizeOption.values.map((val: any) => (
                    <button
                      key={val.id}
                      className={`px-4 py-2 rounded font-medium border transition-colors ${selectedSize === val.title ? "bg-yellow-500 text-dark-900 border-yellow-500" : "bg-dark-900 text-gray-100 border-gray-700 hover:bg-yellow-600 hover:text-dark-900"}`}
                      onClick={() => setSelectedSize(val.title)}
                      type="button"
                    >
                      {val.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Quantity Selector */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm font-semibold">Quantity</span>
              <button
                className="w-8 h-8 rounded bg-dark-900 text-gray-100 border border-gray-700 flex items-center justify-center text-xl hover:bg-yellow-600 hover:text-dark-900"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                type="button"
              >-</button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                className="w-8 h-8 rounded bg-dark-900 text-gray-100 border border-gray-700 flex items-center justify-center text-xl hover:bg-yellow-600 hover:text-dark-900"
                onClick={() => setQuantity(q => q + 1)}
                type="button"
              >+</button>
            </div>
            <Button
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-dark-900 text-lg font-bold py-3 font-sans"
              onClick={handleAddToCart}
              disabled={(!selectedColor && colorOption) || (!selectedSize && sizeOption)}
            >
              Add to Cart - ${price.toFixed(2)}
            </Button>
          </div>
        </div>
      </div>
    </CartWrapper>
  )
} 