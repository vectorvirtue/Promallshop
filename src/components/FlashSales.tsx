import { useEffect, useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './FlashSales.module.css'
import { useCart } from '../context/CartContext'
import { productsApi } from '../lib/api'
import sharp from '../assets/sharp.gif'

const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE_URL as string) || ''

interface ApiProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  discount: number
  availability: number
}

interface ApiCategory {
  category_id: number
  category_name: string
  products: ApiProduct[]
}

function getImageUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${IMAGE_BASE}/${path.replace(/^\/+/, '')}`
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

const LIMIT = 6

export default function FlashSales() {
  const { addToCart } = useCart()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getAll()
      .then((res: unknown) => {
        const r = res as { success: boolean; data: ApiCategory[] }
        const all = (Array.isArray(r.data) ? r.data : []).flatMap(c => c.products)
        // prefer discounted products, fall back to first N
        const discounted = all.filter(p => p.discount > 0)
        const source = discounted.length >= LIMIT ? discounted : all
        setProducts(source.slice(0, LIMIT))
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingCart size={14} /> Ongoing
          </span>
          <h2 className={styles.title}>Flash Sales</h2>
          <p className={styles.subtitle}>Every listed new product from our trusted sellers</p>
        </div>
        <img src={sharp} alt="Sharp printer" className={styles.topGif} />
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
                  <button className={styles.wishlist} aria-label="Add to wishlist">
                    <Heart size={20} />
                  </button>
                </div>

                <button
                  className={styles.addToCart}
                  onClick={() => addToCart({
                    product_id: p.id,
                    name: p.name,
                    price: Number(p.end_user_price || p.price) === 0
                      ? 'Price on request'
                      : `₦ ${Number(p.end_user_price || p.price).toLocaleString('en-NG')}`,
                    img: getImageUrl(p.image),
                  })}
                >
                  Add to Cart
                </button>
              </motion.div>
            ))}
      </div>
    </section>
  )
}
