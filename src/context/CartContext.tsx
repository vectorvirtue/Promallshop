import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { cartApi, getToken } from '../lib/api'
import { toast } from 'sonner'

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
  clearCart: () => void
  totalItems: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // persist cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items))
  }, [items])

  const addToCart = async (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    // update local state immediately
    setItems((prev) => {
      const existing = prev.find((i) => i.name === product.name)
      if (existing) {
        return prev.map((i) =>
          i.name === product.name ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [...prev, { ...product, quantity }]
    })

    // show toast
    toast.success('Added to cart!', {
      description: product.name,
      duration: 2500,
      action: {
        label: 'View Cart',
        onClick: () => window.location.href = '/cart',
      },
    })

    // sync with backend if logged in
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

  const clearCart = () => {
    setItems([])
  }

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
