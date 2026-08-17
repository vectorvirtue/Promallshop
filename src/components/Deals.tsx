import { useEffect, useState } from 'react'
import { ShoppingBagIcon, Heart } from 'lucide-react'
import styles from './Deal.module.css'
import { getMonthEndTarget, getTimeLeft } from '../lib/countdown'
import { useNavigate } from 'react-router-dom'
import { productsApi, getImageUrl } from '../lib/api'
import { useWishlist } from '../lib/useWishlist'

const DEAL_PRODUCT_ID = 943

interface DealProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  discount: number
  short_description?: string
}

export default function Deals() {
  const navigate = useNavigate()
  const { addToWishlist } = useWishlist()

  const [time, setTime] = useState(() => getTimeLeft(getMonthEndTarget()))
  const [product, setProduct] = useState<DealProduct | null>(null)

  /* countdown tick */
  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(getMonthEndTarget())), 1000)
    return () => clearInterval(id)
  }, [])

  /* fetch product 943 */
  useEffect(() => {
    productsApi.getOne(DEAL_PRODUCT_ID)
      .then((res: unknown) => {
        const r = res as { success: boolean; data: DealProduct }
        if (r.success && r.data) setProduct(r.data)
      })
      .catch(() => {})
  }, [])

  const units = [
    { label: 'Days',    value: time.d },
    { label: 'Hours',   value: time.h },
    { label: 'Minutes', value: time.m },
    { label: 'Seconds', value: time.s },
  ]

  const formatPrice = (p: DealProduct) => {
    const n = Number(p.end_user_price || p.price)
    return n === 0 ? 'Price on request' : `₦ ${n.toLocaleString('en-NG')}`
  }

  return (
    <section
      className={styles.section}
      style={product ? {
        backgroundImage: `linear-gradient(135deg, rgba(13,29,85,0.95) 0%, rgba(13,29,85,0.85) 40%, rgba(13,29,85,0.3) 70%, transparent 100%), url(${getImageUrl(product.image)})`,
        backgroundSize: 'contain',
        backgroundPosition: 'center right',
        backgroundRepeat: 'no-repeat',
      } : {
        background: 'linear-gradient(135deg, #0D1D55 0%, #1a3a8a 50%, #f18d1ae7 100%)',
      }}
    >
      <div className={styles.container}>


        {/* ── LEFT: deal info + countdown ── */}
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingBagIcon size={14} /> Today's Deal
          </span>

          <h2
            className={styles.title}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/product/${DEAL_PRODUCT_ID}`)}
          >
            {product ? product.name : 'Yealink Flagship Smart Video Phone VP59'}
          </h2>

        

          {/* countdown */}
          <div className={styles.countdown}>
            {units.map((u, i) => (
              <div key={u.label} style={{ display: 'contents' }}>
                <div className={styles.unit}>
                  <span className={styles.unitLabel}>{u.label}</span>
                  <span className={styles.unitValue}>{u.value}</span>
                </div>
                {i < units.length - 1 && <span className={styles.colon}>:</span>}
              </div>
            ))}
          </div>

          {/* actions */}
          <div className={styles.actions}>
            <button
              className={styles.buyBtn}
              onClick={() => navigate(`/product/${DEAL_PRODUCT_ID}`)}
            >
              BUY NOW
            </button>
            <button
              className={styles.wishlist}
              aria-label="Add to wishlist"
              onClick={() => product && addToWishlist({
                id: product.id,
                name: product.name,
                price: formatPrice(product),
                img: getImageUrl(product.image),
              })}
            >
              <Heart size={22} />
            </button>
          </div>
        </div>

        {/* ── RIGHT: product image ── */}
    

      </div>
    </section>
  )
}
