import { NextResponse } from 'next/server'
import { PrintifyAPI } from '@/lib/printify'

export async function GET() {
  try {
    const api = new PrintifyAPI()
    const res = await api.getProducts(1, 6)
    const products = res.data.slice(0, 6).map((p, idx) => {
      const transformed = api.transformProduct(p)
      return { ...transformed, id: idx + 1 }
    })
    return NextResponse.json(products)
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch Printify products' }, { status: 500 })
  }
} 