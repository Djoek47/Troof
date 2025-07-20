import { NextResponse } from 'next/server'
import { PrintifyAPI } from '@/lib/printify'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    
    const api = new PrintifyAPI()
    
    if (productId) {
      // Get specific product with detailed variant analysis
      const product = await api.getProduct(productId)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }
      
      // Analyze variants in detail
      const variantAnalysis = product.variants.map(variant => {
        const sizeOption = product.options.find(opt => opt.type === 'size' || opt.name.toLowerCase().includes('size'))
        const colorOption = product.options.find(opt => opt.type === 'color' || opt.name.toLowerCase().includes('color'))
        
        let sizeValue = 'Unknown'
        let colorValue = 'Unknown'
        
        if ((variant as any).options && Array.isArray((variant as any).options)) {
          if (typeof (variant as any).options[0] === 'object') {
            // Options are objects with name/value
            const sizeOpt = (variant as any).options.find((opt: any) => opt.name && opt.name.toLowerCase().includes('size'))
            const colorOpt = (variant as any).options.find((opt: any) => opt.name && opt.name.toLowerCase().includes('color'))
            sizeValue = sizeOpt?.value || 'Unknown'
            colorValue = colorOpt?.value || 'Unknown'
          } else {
            // Options are array of values
            const sizeIndex = product.options.findIndex(opt => opt.type === 'size' || opt.name.toLowerCase().includes('size'))
            const colorIndex = product.options.findIndex(opt => opt.type === 'color' || opt.name.toLowerCase().includes('color'))
            sizeValue = (variant as any).options[sizeIndex] || 'Unknown'
            colorValue = (variant as any).options[colorIndex] || 'Unknown'
          }
        }
        
        return {
          variantId: variant.id,
          price: variant.price / 100,
          is_enabled: variant.is_enabled,
          size: sizeValue,
          color: colorValue,
          options: (variant as any).options
        }
      })
      
      return NextResponse.json({
        productId,
        title: product.title,
        totalVariants: product.variants.length,
        enabledVariants: product.variants.filter(v => v.is_enabled).length,
        options: product.options.map(option => ({
          name: option.name,
          type: option.type,
          values: option.values.map(value => ({
            id: value.id,
            title: value.title
          }))
        })),
        variants: variantAnalysis,
        availableCombinations: variantAnalysis.filter(v => v.is_enabled).map(v => `${v.size} + ${v.color}`)
      })
    }
    
    // Get all products with their options
    const res = await api.getProducts(1, 12)
    const products = res.data.map(product => ({
      id: product.id,
      title: product.title,
      options: product.options.map(option => ({
        name: option.name,
        type: option.type,
        values: option.values.slice(0, 5).map(value => ({
          id: value.id,
          title: value.title
        })),
        totalValues: option.values.length
      })),
      variantsCount: product.variants.length,
      enabledVariantsCount: product.variants.filter(v => v.is_enabled).length
    }))
    
    return NextResponse.json({
      products,
      message: "Use ?productId=PRODUCT_ID to see detailed variants for a specific product"
    })
  } catch (error: any) {
    console.error('Error fetching product variants:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch product variants',
      details: error
    }, { status: 500 })
  }
} 