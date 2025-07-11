import { NextResponse } from 'next/server'
import { PrintifyAPI } from '@/lib/printify'

export async function GET() {
  try {
    const api = new PrintifyAPI()
    const res = await api.getProducts(1, 10)
    
    // Return raw Printify data with real IDs for debugging
    const debugData = res.data.map((product, index) => ({
      index: index + 1,
      realId: product.id,
      title: product.title,
      blueprint_id: product.blueprint_id,
      print_provider_id: product.print_provider_id,
      variants_count: product.variants.length,
      options: product.options.map(opt => ({
        name: opt.name,
        type: opt.type,
        values_count: opt.values.length
      }))
    }))
    
    return NextResponse.json({
      total: res.total,
      products: debugData,
      message: "Use these real IDs to update the printifyId mapping in data/products.ts"
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch Printify products',
      details: error
    }, { status: 500 })
  }
} 