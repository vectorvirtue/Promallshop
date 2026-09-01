import { useEffect, useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './FlashSales.module.css'
import { useCart } from '../context/CartContext'
import { productsApi, getImageUrl, quoteApi } from '../lib/api'
import { useWishlist } from '../lib/useWishlist'
import { useQuoteForm } from '../context/QuoteFormContext'

const PROMALL_PROXY_URL =
  (import.meta.env.VITE_PROMALL_PROXY_URL as string) ||
  'http://127.0.0.1:8001/proxy'

interface ApiProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  discount: number
  availability: number
  qty?: string | number
}

interface ApiCategory {
  category_id: number
  category_name: string
  products: ApiProduct[]
}

interface FlashSaleData {
  id: number
  title: string
  description: string
  image: string
  start_datetime: string
  end_datetime: string
  is_live: boolean
  seconds_remaining: number
  display_order: number
}

function Stars({ count }: { count: number }) {
  return (
    <span className={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </span>
  )
}

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' as const },
  }),
}

const LIMIT = 8

export default function FlashSales() {
  const { addToCart } = useCart()
  const { addToWishlist } = useWishlist()
  const { openQuoteForm } = useQuoteForm()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [quoteThreshold, setQuoteThreshold] = useState(2000000)
  const [flashSaleImage, setFlashSaleImage] = useState<string | null>(null)
  // --- new states for countdown ---
  const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    // Fetch flash sale image and data from combined endpoint
    const url = import.meta.env.DEV
      ? '/vite-proxy/combined/promallshop/'
      : `${PROMALL_PROXY_URL}/combined/promallshop/`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.flash_sales)) {
          // Use first live entry, or first entry if none are explicitly live
          const live = data.flash_sales.find((f: FlashSaleData) => f.is_live)
            ?? data.flash_sales[0]
          if (live) {
            setFlashSaleImage(getImageUrl(live.image))
            setFlashSale(live)
            setSecondsLeft(live.seconds_remaining || 0)
          }
        }
      })
      .catch(() => {
        // silently ignore — topBar renders without the image
      })

    // Fetch quote threshold
    quoteApi.getThreshold()
      .then(res => setQuoteThreshold(res.threshold))
      .catch(() => setQuoteThreshold(2000000))

    productsApi.getAll()
      .then((res: unknown) => {
        const r = res as { success: boolean; data: ApiCategory[] }
        const all = (Array.isArray(r.data) ? r.data : []).flatMap(c => c.products)
        // only in-stock products
        const inStock = all.filter(p => p.availability !== 0 && (p.qty === undefined || Number(p.qty) > 0))
        // prefer discounted, fall back to all in-stock
        const discounted = inStock.filter(p => p.discount > 0)
        const source = discounted.length >= LIMIT ? discounted : inStock
        setProducts(source.slice(0, LIMIT))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  // --- countdown timer effect ---
  useEffect(() => {
    if (secondsLeft <= 0) return
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [secondsLeft])

  const handleRequestQuote = (product: ApiProduct) => {
    const priceNum = Number(product.end_user_price || product.price)
    const priceStr = priceNum === 0 ? 'Price on request' : `₦ ${priceNum.toLocaleString('en-NG')}`
    openQuoteForm({
      id: product.id,
      name: product.name,
      price: priceStr
    })
  }

  const isHighValue = (price: number) => price >= quoteThreshold

  // format countdown values
  const days = Math.floor(secondsLeft / 86400)
  const hours = Math.floor((secondsLeft % 86400) / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const secs = secondsLeft % 60

  return (
    <section className={styles.section}>
      
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingCart size={14} /> Ongoing
          </span>
          <h2 className={styles.title}>Flash Sales</h2>
          <p className={styles.subtitle}>Every listed new product from our trusted sellers</p>
          {/* Countdown display */}
          {flashSale && secondsLeft > 0 && (
            <div className={styles.countdown}>
              <div className={styles.timeBlock}>
                <span>{days}</span> Days
              </div>
              <div className={styles.timeBlock}>
                <span>{hours}</span> Hours
              </div>
              <div className={styles.timeBlock}>
                <span>{minutes}</span> Minutes
              </div>
              <div className={styles.timeBlock}>
                <span>{secs}</span> Seconds
              </div>
            </div>
          )}
          {flashSale && secondsLeft === 0 && (
            <div className={styles.saleEnded}>Sale Ended</div>
          )}
        </div>
        {flashSaleImage && (
          <img src={flashSaleImage} alt="Flash sale" className={styles.topGif} />
        )}
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className={styles.card} style={{ overflow: 'hidden' }}>
                <div className={styles.imgWrap} style={{ background: '#f0f0f0', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ padding: '0.6em 0.8em', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
                  <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '80%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '50%', animation: 'shimmer 1.5s infinite' }} />
                </div>
                <div style={{ margin: '0 0.8em 0.8em', height: 34, borderRadius: 4, background: '#f0f0f0', animation: 'shimmer 1.5s infinite' }} />
              </div>
            ))
          : products.map((p, i) => (
              <motion.div
                key={p.id}
                className={styles.card}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
              >
                <div className={styles.imgWrap}>
                  <img src={getImageUrl(p.image)} alt={p.name} className={styles.productImg} />
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.info}>
                    <p className={styles.name}>
                      <Link to={`/product/${p.id}`} className={styles.productLink}>{p.name}</Link>
                    </p>
                    <p className={styles.price}>
                      {Number(p.end_user_price || p.price) === 0
                        ? 'Price on request'
                        : `₦ ${Number(p.end_user_price || p.price).toLocaleString('en-NG')}`}
                    </p>
                    {p.discount > 0 && (
                      <p className={styles.discount}>{p.discount}% OFF</p>
                    )}
                    <Stars count={4} />
                  </div>
                  <button
                    className={styles.wishlist}
                    aria-label="Add to wishlist"
                    onClick={() => addToWishlist({
                      id: p.id,
                      name: p.name,
                      price: Number(p.end_user_price || p.price) === 0
                        ? 'Price on request'
                        : `₦ ${Number(p.end_user_price || p.price).toLocaleString('en-NG')}`,
                      img: getImageUrl(p.image),
                    })}
                  >
                    <Heart size={20} />
                  </button>
                </div>

                <button
                  className={styles.addToCart}
                  disabled={p.qty !== undefined && Number(p.qty) <= 0 || p.availability === 0}
                  onClick={() => {
                    if ((p.qty !== undefined && Number(p.qty) <= 0) || p.availability === 0) return
                    
                    const price = Number(p.end_user_price || p.price)
                    if (price > 0 && isHighValue(price)) {
                      handleRequestQuote(p)
                    } else {
                      addToCart({
                        product_id: p.id,
                        name: p.name,
                        price: price === 0
                          ? 'Price on request'
                          : `₦ ${price.toLocaleString('en-NG')}`,
                        img: getImageUrl(p.image),
                      })
                    }
                  }}
                >
                  {(p.qty !== undefined && Number(p.qty) <= 0) || p.availability === 0 
                    ? 'Out of Stock' 
                    : (Number(p.end_user_price || p.price) > 0 && isHighValue(Number(p.end_user_price || p.price)))
                    ? 'Request for Quote'
                    : 'Add to Cart'}
                </button>
              </motion.div>
            ))}
      </div>
    </section>
  )
}