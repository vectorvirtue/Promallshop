import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface WishlistItem {
  product_id: string | number
  name: string
  price: string
  img: string
}

interface WishlistContextType {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (productId: string | number) => void
  clearWishlist: () => void
  totalItems: number
}

const WishlistContext = createContext<WishlistContextType | null>(null)

/**
 * Device-local wishlist, mirroring CartContext: localStorage is the source of
 * truth for display, and the API is synced in the background when available.
 * Stands in until POST /wishlist/add stops returning 500.
 */
export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem('wishlist_items')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // persist whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlist_items', JSON.stringify(items))
  }, [items])

  const addItem = (item: WishlistItem) => {
    setItems(prev =>
      prev.some(i => String(i.product_id) === String(item.product_id))
        ? prev
        : [...prev, item]
    )
  }

  const removeItem = (productId: string | number) => {
    setItems(prev => prev.filter(i => String(i.product_id) !== String(productId)))
  }

  const clearWishlist = () => setItems([])

  const totalItems = items.length

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, clearWishlist, totalItems }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlistStore() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlistStore must be used inside WishlistProvider')
  return ctx
}
