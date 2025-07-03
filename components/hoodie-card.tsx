"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/cart-context"
import { ShoppingCart, CheckCircle } from "lucide-react"
import Link from "next/link"

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
  // Store selected option IDs for <select> value, and labels for display
  const [selectedOptionIds, setSelectedOptionIds] = useState<{ [optionName: string]: string }>({})
  const [selectedOptionLabels, setSelectedOptionLabels] = useState<{ [optionName: string]: string }>({})
  const [isHovered, setIsHovered] = useState(false)
  // Step state: 'idle' | 'color' | 'size' | 'done' | 'postAdd'
  const [step, setStep] = useState<'idle' | 'color' | 'size' | 'done' | 'postAdd'>('idle')
  const [showSuccess, setShowSuccess] = useState(false)

  // Debug: log the options array to see the actual option names
  console.log('Printify product options:', options)

  // Find the variant that matches the selected options
  const selectedVariant = variants.find((variant) => {
    // If there are no options, just return the first enabled variant
    if (!options.length) return variant.is_enabled
    // For each option, check if the selected value matches a variant id
    return Object.values(selectedOptionIds).every((val) =>
      images.some((img) => img.variant_ids.includes(variant.id) && img.variant_ids.includes(Number(val)))
    ) && variant.is_enabled
  }) || variants[0]

  const handleOptionChange = (optionName: string, value: string) => {
    // Find the label/title for the selected value
    const option = options.find((opt) => opt.name === optionName)
    const label = option?.values.find((valObj) => String(valObj.id) === value)?.title || value
    setSelectedOptionIds((prev) => ({ ...prev, [optionName]: value }))
    setSelectedOptionLabels((prev) => ({ ...prev, [optionName]: label }))
    if (optionName === (colorOption?.name || '')) {
      setStep('size')
    }
    if (optionName === (sizeOption?.name || '')) {
      setStep('done')
    }
  }

  // Dynamically find the option keys for size and color
  const sizeOption = options.find(opt => opt.type === 'size');
  const colorOption = options.find(opt => opt.type === 'color');
  const sizeId = sizeOption ? selectedOptionIds[sizeOption.name] : undefined;
  const colorId = colorOption ? selectedOptionIds[colorOption.name] : undefined;
  const sizeLabel = sizeOption?.values.find(val => String(val.id) === sizeId)?.title;
  const colorLabel = colorOption?.values.find(val => String(val.id) === colorId)?.title;
  // Only enable Add to Cart if all required options are selected
  const allOptionsSelected = (!sizeOption || !!sizeId) && (!colorOption || !!colorId);

  // IMPORTANT: At checkout, transform this id back to the correct Printify product/variant id!
  const handleAddToCart = () => {
    addItem({
      id: Number(id),
      quantity: 1,
      size: sizeLabel,
      color: colorLabel,
    });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 770);
    setStep('postAdd');
  }

  // Get the image for the selected variant, fallback to default
  const displayImage = images.find((img) =>
    selectedVariant && img.variant_ids.includes(selectedVariant.id)
  )?.src || image

  // Get the real Printify product id if available (for linking)
  const productPageId = typeof id === 'string' ? id : String(id)

  return (
    <div className="bg-dark-800 rounded-lg overflow-hidden group">
      <Link href={`/product/${productPageId}`} className="block">
        <div
          className="relative aspect-square cursor-pointer"
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
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/product/${productPageId}`} className="block">
          <h3 className="text-lg font-semibold text-gray-100 group-hover:text-yellow-500 transition-colors cursor-pointer">{name}</h3>
        </Link>
        <p className="text-gray-400 mb-2">${(selectedVariant?.price || price).toFixed(2)}</p>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{description}</p>
        {/* Step-based Color/Size Selection */}
        {colorOption && step === 'idle' && (
          <div className="mb-2 flex justify-center">
            <Button
              className="w-full"
              onClick={() => setStep('color')}
              type="button"
            >
              Choose Color
            </Button>
          </div>
        )}
        {colorOption && step === 'color' && (
          <div className="mb-2 animate-fade-in">
            <div className="text-xs font-semibold mb-1 text-gray-400">Colors</div>
            <div className="flex flex-wrap gap-2">
              {colorOption.values.map((val) => (
                <button
                  key={val.id}
                  className={`px-3 py-1 rounded font-medium border transition-colors text-xs ${colorId === String(val.id) ? "bg-yellow-500 text-dark-900 border-yellow-500" : "bg-dark-900 text-gray-100 border-gray-700 hover:bg-yellow-600 hover:text-dark-900"}`}
                  onClick={() => handleOptionChange(colorOption.name, String(val.id))}
                  type="button"
                >
                  {val.title}
                </button>
              ))}
            </div>
          </div>
        )}
        {sizeOption && step === 'size' && (
          <div className="mb-2 animate-fade-in">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs font-semibold text-gray-400">Sizes</div>
              <Button variant="link" className="p-0 h-auto text-lg font-bold font-sans" onClick={() => setStep('color')} type="button">Change Color</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizeOption.values.map((val) => (
                <button
                  key={val.id}
                  className={`px-3 py-1 rounded font-medium border transition-colors text-xs ${sizeId === String(val.id) ? "bg-yellow-500 text-dark-900 border-yellow-500" : "bg-dark-900 text-gray-100 border-gray-700 hover:bg-yellow-600 hover:text-dark-900"}`}
                  onClick={() => handleOptionChange(sizeOption.name, String(val.id))}
                  type="button"
                >
                  {val.title}
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Add to Cart always visible when done or postAdd */}
        {(step === 'done' || step === 'postAdd') && (
          <div className={`flex gap-2 mt-2 transition-opacity duration-300 ${step === 'done' ? 'opacity-100' : 'opacity-100'}`}>
            <Button
              className={
                step === 'done'
                  ? "flex-1 border-2 border-yellow-500 text-yellow-500 font-bold bg-transparent hover:bg-yellow-500 hover:text-dark-900 transition-colors"
                  : "flex-1 bg-yellow-500 hover:bg-yellow-600 text-dark-900 border-none font-bold"
              }
              onClick={handleAddToCart}
              disabled={!selectedVariant || !allOptionsSelected || showSuccess}
            >
              {showSuccess ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-500 animate-pulse" />
              ) : (
                <ShoppingCart className="w-4 h-4 mr-2" />
              )}
              {showSuccess ? 'Added!' : 'Add to Cart'}
            </Button>
          </div>
        )}
        {/* After Add to Cart: Offer to change color/size for new selection */}
        {step === 'postAdd' && (
          <div className="flex flex-col gap-2 mt-2 animate-fade-in">
            <div className="text-xs text-gray-400 text-center mb-2">Want to add another with a different option?</div>
            <div className="flex gap-2">
              <Button
                className="flex-1 border-2 border-green-500 text-green-500 font-bold bg-transparent hover:bg-green-500 hover:text-dark-900 transition-colors"
                onClick={() => setStep('color')}
                type="button"
              >
                Change Color
              </Button>
              <Button
                className="flex-1 border-2 border-blue-500 text-blue-500 font-bold bg-transparent hover:bg-blue-500 hover:text-dark-900 transition-colors"
                onClick={() => setStep('size')}
                type="button"
              >
                Change Size
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
