"use client"

import type { ReactNode } from "react"
import { CartProvider as CartContextProvider } from "@/context/cart-context"

export function CartProvider({ children }: { children: ReactNode }) {
  return <CartContextProvider>{children}</CartContextProvider>
}
