"use client"

import Image from "next/image"
import { useState } from "react"
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
  // Store selected option IDs for <select> value, and labels for display
  const [selectedOptionIds, setSelectedOptionIds] = useState<{ [optionName: string]: string }>({})
  const [selectedOptionLabels, setSelectedOptionLabels] = useState<{ [optionName: string]: string }>({})
  const [isHovered, setIsHovered] = useState(false)

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
    console.log('Adding to cart:', {
      id: Number(id),
      quantity: 1,
      size: sizeLabel,
      color: colorLabel,
    });

    addItem({
      id: Number(id),
      quantity: 1,
      size: sizeLabel,
      color: colorLabel,
    });
  }

  // Get the image for the selected variant, fallback to default
  const displayImage = images.find((img) =>
    selectedVariant && img.variant_ids.includes(selectedVariant.id)
  )?.src || image

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
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-yellow-500 transition-colors">{name}</h3>
        <p className="text-gray-400 mb-2">${(selectedVariant?.price || price).toFixed(2)}</p>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2">{description}</p>
        {/* Render option selectors */}
        {options.map((option) => (
          <div key={option.name} className="mb-2">
            <label className="block text-xs text-gray-400 mb-1">{option.name}</label>
            <select
              className="w-full rounded bg-white text-gray-900 p-2 border border-dark-600"
              value={selectedOptionIds[option.name] || ""}
              onChange={(e) => handleOptionChange(option.name, e.target.value)}
            >
              <option value="">Select {option.name}</option>
              {option.values.map((val) => (
                <option key={val.id} value={val.id}>{val.title}</option>
              ))}
            </select>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <Button
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-dark-900 border-none"
            onClick={handleAddToCart}
            disabled={!selectedVariant || !allOptionsSelected}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
