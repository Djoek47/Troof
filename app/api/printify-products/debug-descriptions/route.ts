import { NextResponse } from 'next/server'
import { PrintifyAPI } from '@/lib/printify'

export async function GET() {
  try {
    const api = new PrintifyAPI()
    const res = await api.getProducts(1, 12)
    
    // Return raw description data for debugging
    const descriptionData = res.data.map(product => ({
      id: product.id,
      title: product.title,
      description: product.description,
      descriptionLength: product.description?.length || 0,
      hasDescription: !!product.description,
      descriptionPreview: product.description?.substring(0, 100) + '...' || 'NO DESCRIPTION'
    }))
    
    return NextResponse.json({
      totalProducts: res.data.length,
      descriptions: descriptionData,
      message: "Debug: Check actual description data from Printify"
    })
  } catch (error: any) {
    console.error('Error fetching description debug data:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch description debug data',
      details: error
    }, { status: 500 })
  }
}
