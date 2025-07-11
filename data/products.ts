import type { CartItem } from "@/types/cart";

interface ProductItem {
  id: number;
  name: string;
  price: number;
  image1: string;
  image2: string;
  printifyId?: string; // Real Printify product ID
}

// Define your product data here
export const hoodies: ProductItem[] = [
  {
    id: 1,
    name: "Faberland Classic Hoodie",
    price: 149.99,
    image1: "https://i.imgur.com/YFRVFDX.jpg",
    image2: "https://i.imgur.com/S5WuVkN.jpg",
    printifyId: "686061bf115d268c1d0f2b08", // Real Printify product ID
  },
  {
    id: 2,
    name: "Metaverse Explorer Hoodie",
    price: 154.99,
    image1: "https://i.imgur.com/YFRVFDX.jpg",
    image2: "https://i.imgur.com/S5WuVkN.jpg",
    printifyId: "686061bb115d268c1d0f2b02", // Real Printify product ID
  },
  {
    id: 3,
    name: "Digital Realm Hoodie",
    price: 159.99,
    image1: "https://i.imgur.com/YFRVFDX.jpg",
    image2: "https://i.imgur.com/S5WuVkN.jpg",
    printifyId: "686061b9115d268c1d0f2afd", // Real Printify product ID
  },
  {
    id: 4,
    name: "Faberland Limited Edition",
    price: 199.99,
    image1: "https://i.imgur.com/YFRVFDX.jpg",
    image2: "https://i.imgur.com/S5WuVkN.jpg",
    printifyId: "686061b7115d268c1d0f2af6", // Real Printify product ID
  },
];

// Mapping function to get Printify product ID from mock ID
export function getPrintifyProductId(mockId: number): string | undefined {
  const product = hoodies.find(p => p.id === mockId);
  return product?.printifyId;
}

// Mapping function to get mock ID from Printify product ID
export function getMockProductId(printifyId: string): number | undefined {
  const product = hoodies.find(p => p.printifyId === printifyId);
  return product?.id;
}

// You can add other product types or data arrays here as needed 