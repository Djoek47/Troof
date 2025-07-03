import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const apiToken = process.env.PRINTIFY_API_TOKEN;

  if (!shopId || !apiToken) {
    return NextResponse.json({ error: "Missing Printify credentials" }, { status: 500 });
  }

  const res = await fetch(
    `https://api.printify.com/v1/shops/${shopId}/products/${productId}.json`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch from Printify" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
} 