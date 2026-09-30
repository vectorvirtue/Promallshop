import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { wishlistApi, getToken } from './api'
import { useWishlistStore } from '../context/WishlistContext'

/**
 * TEMPORARY: POST /wishlist/add returns 500 from the backend, so saves go to a
 * device-local wishlist (localStorage) instead, mirroring how the cart works.
 * Flip this to true once the endpoint is fixed — the local list is read too, so
 * nothing saved in the meantime is lost.
 */
export const WISHLIST_API_ENABLED = false

interface WishlistProduct {
  id: number
  name: string
  price: string
  img: string
}

export function useWishlist() {
  const navigate = useNavigate()
  const { addItem } = useWishlistStore()

  const addToWishlist = async (product: WishlistProduct) => {
    // no token — the local wishlist works signed out, but the API one can't
    if (WISHLIST_API_ENABLED && !getToken()) {
      toast.error('Please log in to save to wishlist', {
        action: { label: 'Login', onClick: () => navigate('/login') },
        duration: 3000,
      })
      return
    }

    addItem({
      product_id: product.id,
      name: product.name,
      price: product.price,
      img: product.img,
    })

    toast.success('Added to wishlist!', {
      description: product.name,
      duration: 2500,
      action: {
        label: 'View Wishlist',
        onClick: () => navigate('/dashboard'),
      },
    })

    if (!WISHLIST_API_ENABLED) return

    // local list is already updated — a failed push must not undo it
    try {
      await wishlistApi.add(product.id, 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('addToWishlist sync failed:', message)
      toast.error('Saved on this device only', {
        description: message,
        duration: 4000,
      })
    }
  }

  return { addToWishlist }
}
