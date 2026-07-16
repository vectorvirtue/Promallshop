import { useEffect, useState } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './Featured.module.css'
import { useCart } from '../context/CartContext'
import { productsApi, getImageUrl } from '../lib/api'

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
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
      {/* ── top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingCart size={14} /> This {currentMonth}
          </span>
          <h2 className={styles.title}>Featured Products</h2>
          <p className={styles.subtitle}>Every listed new product from our trusted sellers</p>
        </div>

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
                  <button className={styles.wishlist} aria-label="Add to wishlist">
                    <Heart size={20} />
                  </button>
                </div>

                <button
                  className={styles.addToCart}
                  disabled={p.qty !== undefined && Number(p.qty) <= 0 || p.availability === 0}
                  onClick={() => {
                    if ((p.qty !== undefined && Number(p.qty) <= 0) || p.availability === 0) return
                    addToCart({
                      product_id: p.id,
                      name: p.name,
                      price: Number(p.end_user_price || p.price) === 0
                        ? 'Price on request'
                        : `₦ ${Number(p.end_user_price || p.price).toLocaleString('en-NG')}`,
                      img: getImageUrl(p.image),
                    })
                  }}
                >
                  {(p.qty !== undefined && Number(p.qty) <= 0) || p.availability === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </motion.div>
            ))}
      </div>
    </section>
  )
}
