import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { wishlistApi, getToken } from './api'

interface WishlistProduct {
  id: number
  name: string
  price: string
  img: string
}

export function useWishlist() {
  const navigate = useNavigate()

  const addToWishlist = async (product: WishlistProduct) => {
    if (!getToken()) {
      toast.error('Please log in to save to wishlist', {
        action: { label: 'Login', onClick: () => navigate('/login') },
        duration: 3000,
      })
      return
    }

    try {
      await wishlistApi.add(product.id, 1)
      toast.success('Added to wishlist!', {
        description: product.name,
        duration: 2500,
        action: {
          label: 'View Wishlist',
          onClick: () => navigate('/wishlist'),
        },
      })
    } catch {
      toast.error('Failed to add to wishlist. Try again.')
    }
  }

  return { addToWishlist }
}
