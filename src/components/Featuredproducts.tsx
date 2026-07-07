import { useState } from 'react'
import { ShoppingCart, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import styles from './Featured.module.css'
import { useCart } from '../context/CartContext'

import headsetImg  from '../assets/840760832c.svg'
import codeyImg    from '../assets/64c255a985357-0 1.svg'
import mouseImg    from '../assets/60f5808d72fc3-0 1.svg'
import samsungImg  from '../assets/6615738024026-0 2.svg'
import codey2Img   from '../assets/Frame 324.svg'
import vestelImg   from '../assets/VESTEL 56.svg'

type Badge = 'New' | 'Hot' | 'Special'

interface Product {
  img: string
  name: string
  category: string
  price: string
  oldPrice: string
  stars: number
  badge: Badge
  filterKey: string
}

const products: Product[] = [
  {
    img: headsetImg,
    name: 'VT HEADSET X300 BT',
    category: 'Headsets',
    price: '₦ 120,000',
    oldPrice: '₦ 175,000',
    stars: 4,
    badge: 'New',
    filterKey: 'Headsets',
  },
  {
    img: codeyImg,
    name: '14 In 1 Solar Robot Kit',
    category: 'Coding and Robotics Kit',
    price: '₦ 200,000',
    oldPrice: '₦ 230,000',
    stars: 5,
    badge: 'Hot',
    filterKey: 'VC Accessories',
  },
  {
    img: mouseImg,
    name: 'LOGITECH M190 Full-Size Wireless Mouse',
    category: 'Mouse',
    price: '₦ 14,000',
    oldPrice: '₦ 16,100',
    stars: 4,
    badge: 'Special',
    filterKey: 'Mouse',
  },
  {
    img: samsungImg,
    name: 'SAMSUNG 75 INCHES FLIPCHART',
    category: 'Screens',
    price: '₦ 5,950,000',
    oldPrice: '₦ 6,842,500',
    stars: 4,
    badge: 'Hot',
    filterKey: 'Screens',
  },
 
  {
    img: codey2Img,
    name: 'MAKEBLOCK CODEY ROCKY',
    category: 'Coding and Robotics Kit',
    price: '₦ 600,000',
    oldPrice: '₦ 690,000',
    stars: 5,
    badge: 'Special',
    filterKey: 'VC Accessories',
  },
  {
    img: vestelImg,
    name: 'VESTEL 55 INCHES SCREEN',
    category: 'Screens',
    price: '₦ 1,200,000',
    oldPrice: '₦ 1,380,000',
    stars: 4,
    badge: 'New',
    filterKey: 'Screens',
  },
     {
    img: headsetImg,
    name: 'VT HEADSET X300 BT',
    category: 'Headsets',
    price: '₦ 120,000',
    oldPrice: '₦ 175,000',
    stars: 4,
    badge: 'New',
    filterKey: 'Headsets',
  },
  {
    img: codeyImg,
    name: '14 In 1 Solar Robot Kit',
    category: 'Coding and Robotics Kit',
    price: '₦ 200,000',
    oldPrice: '₦ 230,000',
    stars: 5,
    badge: 'Hot',
    filterKey: 'VC Accessories',
  },
  {
    img: mouseImg,
    name: 'LOGITECH M190 Full-Size Wireless Mouse',
    category: 'Mouse',
    price: '₦ 14,000',
    oldPrice: '₦ 16,100',
    stars: 4,
    badge: 'Special',
    filterKey: 'Mouse',
  },
  {
    img: samsungImg,
    name: 'SAMSUNG 75 INCHES FLIPCHART',
    category: 'Screens',
    price: '₦ 5,950,000',
    oldPrice: '₦ 6,842,500',
    stars: 4,
    badge: 'Hot',
    filterKey: 'Screens',
  },
 
  {
    img: codey2Img,
    name: 'MAKEBLOCK CODEY ROCKY',
    category: 'Coding and Robotics Kit',
    price: '₦ 600,000',
    oldPrice: '₦ 690,000',
    stars: 5,
    badge: 'Special',
    filterKey: 'VC Accessories',
  },
   {
    img: vestelImg,
    name: 'VESTEL 55 INCHES SCREEN',
    category: 'Screens',
    price: '₦ 1,200,000',
    oldPrice: '₦ 1,380,000',
    stars: 4,
    badge: 'New',
    filterKey: 'Screens',
  },

]

const filters = [
  'All',
  'Office Equipments',
  'VC Accessories',
  'Video Conferencing',
  'Mouse',
  'Screens',
  'Keyboards',
  'Headsets',
  'Webcams',
]

const badgeColors: Record<Badge, string> = {
  New: '#142B80',
  Hot: '#e53e3e',
  Special: '#F18E1A',
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

export default function FeaturedProducts() {
  const [active, setActive] = useState('All')
  const { addToCart } = useCart()

  const filtered = active === 'All'
    ? products
    : products.filter((p) => p.filterKey === active)

  return (
    <section className={styles.section}>

      {/* ── top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingCart size={14} /> This month
          </span>
          <h2 className={styles.title}>Featured Products</h2>
          <p className={styles.subtitle}>Every listed new product from our trusted sellers</p>
        </div>

        <div className={styles.filters}>
          {filters.map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${active === f ? styles.filterActive : ''}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── product grid ── */}
      <div className={styles.grid}>
        {filtered.map((p, i) => (
          <motion.div
            key={p.name}
            className={styles.card}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
            {/* image + badge */}
            <div className={styles.imgWrap}>
              <img src={p.img} alt={p.name} className={styles.productImg} />
              <span
                className={styles.badge}
                style={{ background: badgeColors[p.badge] }}
              >
                {p.badge}
              </span>
            </div>

            {/* info + heart */}
            <div className={styles.infoRow}>
              <div className={styles.info}>
                <p className={styles.name}>{p.name}</p>
                <p className={styles.categoryLabel}>{p.category}</p>
                <p className={styles.price}>{p.price}</p>
                <p className={styles.oldPrice}>{p.oldPrice}</p>
                <Stars count={p.stars} />
              </div>
              <button className={styles.wishlist} aria-label="Add to wishlist">
                <Heart size={20} />
              </button>
            </div>

            <button
              className={styles.addToCart}
              onClick={() => addToCart({ name: p.name, price: p.price, oldPrice: p.oldPrice, img: p.img })}
            >
              Add to Cart
            </button>
          </motion.div>
        ))}
      </div>

    </section>
  )
}
