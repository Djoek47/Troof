import { NextResponse } from 'next/server'
import { PrintifyAPI } from '@/lib/printify'

export async function GET() {
  try {
    const api = new PrintifyAPI()
    const res = await api.getProducts(1, 50) // Fetch more products to ensure we get all mapped ones
    
    // Return raw Printify products with real IDs for mapping
    const rawProducts = res.data.map(product => ({
      id: product.id,
      originalId: product.id, // Keep original ID for consistency
      name: product.title,
      description: product.description,
      price: product.variants.find(v => v.is_enabled)?.price / 100 || 0,
      image: product.images.find(img => img.is_default)?.src || product.images[0]?.src,
      variants: product.variants.map(variant => ({
        ...variant,
        // Include the full variant options for proper color/size matching
        options: variant.options || [],
        // Add color and size information if available
        color: variant.options?.find((opt: any) => 
          typeof opt === 'object' && opt.name?.toLowerCase().includes('color')
        )?.value,
        size: variant.options?.find((opt: any) => 
          typeof opt === 'object' && opt.name?.toLowerCase().includes('size')
        )?.value,
        // Add blueprint_id for better product categorization
        blueprint_id: variant.blueprint_id,
        // Add variant-specific image if available
        image: product.images.find(img => 
          img.variant_ids.includes(variant.id)
        )?.src,
        // Add the original variant data for debugging
        originalVariant: variant,
      })),
      images: product.images,
      options: product.options,
    }))
    
    return NextResponse.json(rawProducts)
  } catch (error: any) {
    console.error('Error fetching raw Printify products:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch Printify products',
      details: error
    }, { status: 500 })
  }
} 