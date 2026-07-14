import { createContext, useContext, useState, type ReactNode } from 'react'
import { cartApi, getToken } from '../lib/api'

export interface CartItem {
  product_id?: string | number
  name: string
  price: string
  oldPrice?: string
  img: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>
  removeFromCart: (name: string) => void
  updateQuantity: (name: string, delta: number) => void
  totalItems: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    // always update local state immediately for a snappy UI
    setItems((prev) => {
      const existing = prev.find((i) => i.name === product.name)
      if (existing) {
        return prev.map((i) =>
          i.name === product.name ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...product, quantity }]
    })

    // if logged in and product_id is available, sync with backend
    if (getToken() && product.product_id) {
      try {
        await cartApi.add(product.product_id, quantity)
      } catch (err) {
        console.error('Failed to sync cart with backend:', err)
      }
    }
  }

  const removeFromCart = (name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name))
  }

  const updateQuantity = (name: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => (i.name === name ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
