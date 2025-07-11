import { NextRequest, NextResponse } from 'next/server'
import { PrintifyAPI } from '@/lib/printify'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    
    const api = new PrintifyAPI()
    
    if (productId) {
      // Get specific product variants
      const product = await api.getProduct(productId)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      const variants = product.variants.map(variant => ({
        id: variant.id,
        price: variant.price / 100,
        is_enabled: variant.is_enabled,
        // Note: Printify API doesn't include options in the basic variant response
        // We'll need to reconstruct the options from the product options
      }))
      
      const options = product.options.map(option => ({
        name: option.name,
        type: option.type,
        values: option.values.map(value => ({
          id: value.id,
          title: value.title
        }))
      }))
      
      return NextResponse.json({
        productId,
        title: product.title,
        options,
        variants: variants.slice(0, 10), // Show first 10 variants
        totalVariants: variants.length
      })
    } else {
      // Get all products with their options
      const res = await api.getProducts(1, 6)
      const products = res.data.map(product => ({
        id: product.id,
        title: product.title,
        options: product.options.map(option => ({
          name: option.name,
          type: option.type,
          values: option.values.slice(0, 5).map(value => ({ // Show first 5 values
            id: value.id,
            title: value.title
          })),
          totalValues: option.values.length
        })),
        variantsCount: product.variants.length
      }))
      
      return NextResponse.json({
        products,
        message: "Use ?productId=PRODUCT_ID to see detailed variants for a specific product"
      })
    }
  } catch (error: any) {
    console.error('Error fetching product variants:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch product variants',
      details: error
    }, { status: 500 })
  }
} 