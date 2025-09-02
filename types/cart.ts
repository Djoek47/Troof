export interface CartItem {
  id: number
  name: string
  price: number
  image1: string;
  image2: string;
  quantity: number
  size?: string
  color?: string
  variantId?: number
  variantImage?: string
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
  cartUrl?: string
}

export interface CartIdentifier {
  type: 'guest' | 'wallet';
  id: string;
}
