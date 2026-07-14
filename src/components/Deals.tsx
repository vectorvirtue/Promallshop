import { useEffect, useState } from 'react'
import { ShoppingBagIcon, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Deal.module.css'
import { productsApi } from '../lib/api'
import { useCart } from '../context/CartContext'
import { getMonthEndTarget, getTimeLeft } from '../lib/countdown'

const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE_URL as string) || ''

function getImageUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${IMAGE_BASE}/${path.replace(/^\/+/, '')}`
}

interface ApiProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  discount: number
}

interface ApiCategory {
  products: ApiProduct[]
}

const VISIBLE = 3

export default function Deals() {
  const { addToCart } = useCart()

  /* ── countdown — resets to end of current month automatically ── */
  const [time, setTime] = useState(() => getTimeLeft(getMonthEndTarget()))

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(getMonthEndTarget())), 1000)
    return () => clearInterval(id)
  }, [])

  /* ── products ── */
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [startIndex, setStartIndex] = useState(0)
  const [featuredProduct, setFeaturedProduct] = useState<ApiProduct | null>(null)

  useEffect(() => {
    productsApi.getAll()
      .then((res: unknown) => {
        const r = res as { success: boolean; data: ApiCategory[] }
        const all = (Array.isArray(r.data) ? r.data : []).flatMap(c => c.products)
        const discounted = all.filter(p => p.discount > 0)
        const source = discounted.length > 0 ? discounted : all
        setFeaturedProduct(source[0] ?? null)
        setProducts(source.slice(1, 13))
      })
      .catch(() => {})
  }, [])

  const units = [
    { label: 'Days',    value: time.d },
    { label: 'Hours',   value: time.h },
    { label: 'Minutes', value: time.m },
    { label: 'Seconds', value: time.s },
  ]

  const canPrev = startIndex > 0
  const canNext = startIndex + VISIBLE < products.length
  const visible = products.slice(startIndex, startIndex + VISIBLE)

  const formatPrice = (p: ApiProduct) => {
    const n = Number(p.end_user_price || p.price)
    return n === 0 ? 'Price on request' : `₦ ${n.toLocaleString('en-NG')}`
  }

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* ── LEFT: deal info + countdown ── */}
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingBagIcon size={14} /> Today's Deal
          </span>

          <h2 className={styles.title}>
            {featuredProduct ? featuredProduct.name : 'Weekly Sales Deals'}
          </h2>

          {featuredProduct && featuredProduct.discount > 0 && (
            <h3 className={styles.subtitle}>
              {featuredProduct.discount}% off this week only
            </h3>
          )}

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
              onClick={() => featuredProduct && addToCart({
                product_id: featuredProduct.id,
                name: featuredProduct.name,
                price: formatPrice(featuredProduct),
                img: getImageUrl(featuredProduct.image),
              })}
            >
              BUY NOW
            </button>
            <button className={styles.wishlist} aria-label="Add to wishlist">
              <Heart size={22} />
            </button>
          </div>
        </div>

        {/* ── RIGHT: product carousel ── */}
        {products.length > 0 && (
          <div className={styles.dealCarousel}>
            <button
              className={styles.carouselBtn}
              onClick={() => setStartIndex(i => Math.max(0, i - 1))}
              disabled={!canPrev}
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>

            <div className={styles.carouselTrack}>
              {visible.map(p => (
                <div key={p.id} className={styles.dealCard}>
                  <div className={styles.dealCardImg}>
                    <img src={getImageUrl(p.image)} alt={p.name} />
                    {p.discount > 0 && (
                      <span className={styles.dealBadge}>{p.discount}% OFF</span>
                    )}
                  </div>
                  <p className={styles.dealCardName}>{p.name}</p>
                  <p className={styles.dealCardPrice}>{formatPrice(p)}</p>
                  <button
                    className={styles.dealAddBtn}
                    onClick={() => addToCart({
                      product_id: p.id,
                      name: p.name,
                      price: formatPrice(p),
                      img: getImageUrl(p.image),
                    })}
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>

            <button
              className={styles.carouselBtn}
              onClick={() => setStartIndex(i => Math.min(products.length - VISIBLE, i + 1))}
              disabled={!canNext}
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
