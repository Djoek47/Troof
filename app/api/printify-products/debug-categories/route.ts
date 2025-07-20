import { NextResponse } from 'next/server'
import { PrintifyAPI } from '@/lib/printify'

export async function GET() {
  try {
    const api = new PrintifyAPI()
    const res = await api.getProducts(1, 12)
    
    // Categorize products to see what's happening
    const categories = {
      Hoodies: [] as any[],
      "T-shirts": [] as any[],
      Caps: [] as any[],
      Other: [] as any[],
    };
    
    res.data.forEach((product) => {
      const title = product.title?.toLowerCase() || "";
      const tags = (product.tags || []).map((t: string) => t.toLowerCase());
      
      // More comprehensive hoodie detection
      if (title.includes("hoodie") || title.includes("hoody") || title.includes("sweatshirt") || 
          tags.includes("hoodie") || tags.includes("hoody") || tags.includes("sweatshirt") ||
          title.includes("pullover") || tags.includes("pullover")) {
        categories.Hoodies.push({
          id: product.id,
          title: product.title,
          blueprint_id: product.blueprint_id,
          tags: product.tags
        });
      } else if (title.includes("t-shirt") || title.includes("tee") || title.includes("tshirt") || 
                 tags.includes("t-shirt") || tags.includes("tee") || tags.includes("tshirt")) {
        categories["T-shirts"].push({
          id: product.id,
          title: product.title,
          blueprint_id: product.blueprint_id,
          tags: product.tags
        });
      } else if (title.includes("cap") || title.includes("hat") || title.includes("baseball") || 
                 tags.includes("cap") || tags.includes("hat") || tags.includes("baseball")) {
        categories.Caps.push({
          id: product.id,
          title: product.title,
          blueprint_id: product.blueprint_id,
          tags: product.tags
        });
      } else {
        categories.Other.push({
          id: product.id,
          title: product.title,
          blueprint_id: product.blueprint_id,
          tags: product.tags
        });
      }
    });
    
    return NextResponse.json({
      totalProducts: res.data.length,
      categories,
      allProducts: res.data.map(p => ({
        id: p.id,
        title: p.title,
        blueprint_id: p.blueprint_id,
        tags: p.tags
      }))
    })
  } catch (error: any) {
    console.error('Error fetching product categories:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch product categories',
      details: error
    }, { status: 500 })
  }
} 