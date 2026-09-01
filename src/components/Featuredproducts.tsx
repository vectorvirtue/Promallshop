import { useEffect, useState } from 'react'
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './Featured.module.css'
import { useCart } from '../context/CartContext'
import { productsApi, getImageUrl, quoteApi } from '../lib/api'
import { useWishlist } from '../lib/useWishlist'
import { useQuoteForm } from '../context/QuoteFormContext'
// import sales from '../assets/deliver.gif'

const PROMALL_PROXY_URL =
  (import.meta.env.VITE_PROMALL_PROXY_URL as string) ||
  'http://127.0.0.1:8001/proxy'

type AffiliateBanner = {
  id: number
  image?: string        // field name used by flash_sales model pattern
  media_file?: string   // field name used by gifs model pattern
  link?: string
  display_order?: number
  is_active?: boolean
  is_live?: boolean
}
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
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' as const },
  }),
}

const LIMIT = 12

const toTitleCase = (str: string) =>
  str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())

const currentMonth = new Date().toLocaleString('default', { month: 'long' })

export default function FeaturedProducts() {
  const { addToCart } = useCart()
  const { addToWishlist } = useWishlist()
  const { openQuoteForm } = useQuoteForm()
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)
  const [quoteThreshold, setQuoteThreshold] = useState(2000000)
  const [affiliateBanner, setAffiliateBanner] = useState<{ src: string; link: string } | null>(null)

  useEffect(() => {
    // Fetch affiliate banner from combined endpoint — same pattern as Categories.tsx / FlashSales.tsx
    const url = import.meta.env.DEV
      ? '/vite-proxy/combined/promallshop/'
      : `${PROMALL_PROXY_URL}/combined/promallshop/`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.affiliate_banners) && data.affiliate_banners.length > 0) {
          // Log the actual shape so field names are visible in the browser console
          console.log('[affiliate_banners] first entry keys:', Object.keys(data.affiliate_banners[0]))
          console.log('[affiliate_banners] first entry:', data.affiliate_banners[0])

          const sorted: AffiliateBanner[] = [...data.affiliate_banners].sort(
            (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
          )
          // Pick first active entry, or first entry if none are flagged active
          const entry = sorted.find(b => b.is_active || b.is_live) ?? sorted[0]

          // Resolve image: try "image" field first, then "media_file" (matches both backend patterns)
          const rawSrc = entry.image ?? entry.media_file ?? ''
          const src = getImageUrl(rawSrc)

          if (src) {
            setAffiliateBanner({ src, link: entry.link ?? '' })
          }
        }
      })
      .catch(() => {
        // silently ignore — section renders without the banner
      })
    // Fetch quote threshold
    quoteApi.getThreshold()
      .then(res => setQuoteThreshold(res.threshold))
      .catch(() => setQuoteThreshold(2000000))

    productsApi.getAll()
      .then((res: unknown) => {
        const r = res as { success: boolean; data: ApiCategory[] }
        const cats = Array.isArray(r.data) ? r.data : []
        setCategories(cats)
        // only show in-stock products
        const inStock = cats.flatMap(c => c.products).filter(
          p => p.availability !== 0 && (p.qty === undefined || Number(p.qty) > 0)
        )
        setAllProducts(inStock)
      })
      .catch(() => {
        setCategories([])
        setAllProducts([])
      })
      .finally(() => setLoading(false))
  }, [])

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

  const filtered = (() => {
    if (active === 'All') return allProducts.slice(0, LIMIT)
    const cat = categories.find(c => c.category_name === active)
    const inStock = (cat?.products ?? []).filter(
      p => p.availability !== 0 && (p.qty === undefined || Number(p.qty) > 0)
    )
    return inStock.slice(0, LIMIT)
  })()

  // build filter tabs: All + ALL category names that have products (no limit)
  const filterTabs = [
    'All',
    ...categories
      .filter(c => c.products.length > 0)
      .map(c => c.category_name),
  ]

  return (
    <section className={styles.section}>
      {/* ── affiliate banner (backend-driven) ── */}
      {affiliateBanner && (
        affiliateBanner.link ? (
          <a href={affiliateBanner.link} target="_blank" rel="noopener noreferrer">
            <img src={affiliateBanner.src} alt="Become a Promallshop Reseller" className={styles.topGif} />
          </a>
        ) : (
          <img src={affiliateBanner.src} alt="Become a Promallshop Reseller" className={styles.topGif} />
        )
      )}

      {/* ── top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingCart size={14} /> This {currentMonth}
          </span>
          <h2 className={styles.title}>Featured Products</h2>
          <p className={styles.subtitle}>Every listed new product from our trusted sellers</p>
        </div>

        <div className={styles.filtersWrap}>
          <div className={styles.filters}>
            {filterTabs.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${active === f ? styles.filterActive : ''}`}
                onClick={() => setActive(f)}
              >
                {f === 'All' ? 'All' : toTitleCase(f.length > 20 ? f.slice(0, 18) + '…' : f)}
              </button>
            ))}
          </div>
          {/* ── swipe indicator ── */}
          <div className={styles.swipeIndicator}>
            <ChevronLeft size={16} />
            <span>Swipe to see more categories</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </div>

      {/* ── product grid ── */}
      <div className={styles.grid}>
        {loading
          ? Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className={styles.card} style={{ overflow: 'hidden' }}>
                <div className={styles.imgWrap} style={{ background: '#f0f0f0', animation: 'shimmer 1.5s infinite' }} />
                <div style={{ padding: '0.6em 0.8em', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
                  <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '80%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '50%', animation: 'shimmer 1.5s infinite' }} />
                  <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '35%', animation: 'shimmer 1.5s infinite' }} />
                </div>
                <div style={{ margin: '0 0.8em 0.8em', height: 34, borderRadius: 4, background: '#f0f0f0', animation: 'shimmer 1.5s infinite' }} />
              </div>
            ))
          : filtered.map((p, i) => (
              <motion.div
                key={p.id}
                className={styles.card}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
              >
                {/* image */}
                <div className={styles.imgWrap}>
                  <img src={getImageUrl(p.image)} alt={p.name} className={styles.productImg} />
                </div>

                {/* info + heart */}
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
                      <p className={styles.oldPrice}>{p.discount}% OFF</p>
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
      {/* <div className={styles.section} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
      <img src={sales} alt="Delivery gif" className={styles.gif}/>
    </div> */}
    </section>
  )
}
