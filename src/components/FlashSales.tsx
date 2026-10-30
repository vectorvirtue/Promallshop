import { useEffect, useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './FlashSales.module.css'
import { useCart } from '../context/CartContext'
import { productsApi, getImageUrl, quoteApi, promallCombinedApi } from '../lib/api'
import { useWishlist } from '../lib/useWishlist'
import { useQuoteForm } from '../context/QuoteFormContext'
import { productPath } from '../lib/slugs'

interface ApiProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  tag?: string | null
  discount: number
  categoryOnlineDiscount?: number
  availability: number
  qty?: string | number
}

interface ApiCategory {
  category_id: number
  category_name: string
  online_discount?: number
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

interface AffiliateBannerData {
  id: number
  title?: string
  image?: string
  media_file?: string
  placement: string
  display_order?: number
  is_active?: boolean
  is_live?: boolean
  link?: string
  affiliate_url?: string
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
  const [flashSideBanner, setFlashSideBanner] = useState<AffiliateBannerData | null>(null)
  const [flashSale, setFlashSale] = useState<FlashSaleData | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    promallCombinedApi.getAll<{
      status?: string
      flash_sales?: FlashSaleData[]
      affiliate_banners?: AffiliateBannerData[]
    }>()
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.flash_sales)) {
          // Use first live entry, or first entry if none are explicitly live
          const live = data.flash_sales.find((f: FlashSaleData) => f.is_live)
            ?? data.flash_sales[0]
          if (live) {
            setFlashSale(live)
            setSecondsLeft(live.seconds_remaining || 0)
          }
        }
        const banner = Array.isArray(data.affiliate_banners)
          ? data.affiliate_banners
              .filter(item =>
                item.placement === 'flash_side' &&
                item.is_active !== false &&
                item.is_live !== false &&
                Boolean(item.image || item.media_file)
              )
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))[0]
          : undefined
        setFlashSideBanner(banner ?? null)
      })
      .catch((cause: unknown) => {
        console.error('Failed to load flash sale banner:', cause)
      })

    // Fetch quote threshold
    quoteApi.getThreshold()
      .then(res => setQuoteThreshold(res.threshold))
      .catch(() => setQuoteThreshold(2000000))

    productsApi.getAll()
      .then((res: unknown) => {
        const r = res as { success: boolean; data: ApiCategory[] }
        const all = (Array.isArray(r.data) ? r.data : []).flatMap(c =>
          c.products.map(product => ({
            ...product,
            categoryOnlineDiscount: Number(c.online_discount) || 0,
          }))
        )
        // only in-stock products
        const inStock = all.filter(p => p.availability !== 0 && (p.qty === undefined || Number(p.qty) > 0))
        const hot = inStock.filter(p => p.tag?.trim().toLowerCase() === 'hot')
        const discounted = inStock.filter(p => (p.categoryOnlineDiscount ?? p.discount) > 0)
        const seen = new Set<number>()
        const prioritized = [...hot, ...discounted, ...inStock].filter(product => {
          if (seen.has(product.id)) return false
          seen.add(product.id)
          return true
        })
        setProducts(prioritized.slice(0, LIMIT))
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

  const formatSaleDateTime = (value: string) => {
    const date = new Date(value)
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
  }

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
          {flashSale && (
            <div className={styles.saleSchedule}>
              {formatSaleDateTime(flashSale.start_datetime) && (
                <span><strong>Starts</strong> {formatSaleDateTime(flashSale.start_datetime)}</span>
              )}
              {formatSaleDateTime(flashSale.end_datetime) && (
                <span><strong>Ends</strong> {formatSaleDateTime(flashSale.end_datetime)}</span>
              )}
            </div>
          )}
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
        {flashSideBanner && (
          (() => {
            const image = (
              <img
                src={getImageUrl(flashSideBanner.image ?? flashSideBanner.media_file ?? '')}
                alt={flashSideBanner.title || 'Flash sale'}
                className={styles.topGif}
              />
            )
            const href = flashSideBanner.link ?? flashSideBanner.affiliate_url
            return href
              ? <a href={href} target="_blank" rel="noopener noreferrer">{image}</a>
              : image
          })()
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
                  {p.tag?.trim().toLowerCase() === 'hot' && (
                    <span className={styles.hotBadge}>Hot</span>
                  )}
                </div>

                <div className={styles.infoRow}>
                  <div className={styles.info}>
                    {(() => {
                      const currentPrice = Number(p.end_user_price || p.price)
                      const discount = p.categoryOnlineDiscount ?? p.discount ?? 0
                      const formerPrice = discount > 0 && currentPrice > 0
                        ? Math.round(currentPrice / (1 - discount / 100))
                        : 0
                      return (
                        <>
                    <p className={styles.name}>
                      <Link to={`${productPath(p.name, p.id)}`} className={styles.productLink}>{p.name}</Link>
                    </p>
                    <p className={styles.price}>
                      {currentPrice === 0
                        ? 'Price on request'
                        : `₦ ${currentPrice.toLocaleString('en-NG')}`}
                    </p>
                    {formerPrice > 0 && (
                      <p className={styles.oldPrice}>₦ {formerPrice.toLocaleString('en-NG')}</p>
                    )}
                    {discount > 0 && (
                      <p className={styles.discount}>{discount}% OFF</p>
                    )}
                    <Stars count={4} />
                        </>
                      )
                    })()}
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