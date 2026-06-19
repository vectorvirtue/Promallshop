import { Heart, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import styles from './FlashSales.module.css'
import { useCart } from '../context/CartContext'

import sharpImg    from '../assets/Sharp-AR-7024-7024D.svg'
import maxhubImg   from '../assets/6615738024026-0 2.svg'
import photonImg   from '../assets/Image (19).svg'
import headphones from '../assets/Frame 322.svg'
import codey from '../assets/Frame 324.svg'
import vestel from '../assets/VESTEL 56.svg'
import sharp from '../assets/sharp.gif'

const products = [
  {
    img: maxhubImg,
    name: 'SAMSUNG 75 INCHES FLIPCHART',
    price: '₦ 5,950,000',
    oldPrice: '₦ 6,842,500',
    discount: '15% OFF',
    stars: 4,
  },
  {
    img: photonImg,
    name: 'BELKIN BOOST CHARGE POWERBANK 10K- BLACK',
    price: '₦ 32,000',
    oldPrice: '₦ 36,800',
    discount: '15% OFF',
    stars: 5,
  },
  {
    img: headphones,
    name: 'BELKIN SOUNDFORM KIDS HEADPHONES, BLUE',
    price: '₦ 46,000',
    oldPrice: '₦ 52,900',
    discount: '15% OFF',
    stars: 4,
  },
  {
    img: sharpImg,
    name: 'SHARP AR-7024 DIGITAL MULTIFUNCTIONAL PRINTER',
    price: '₦ 770,000',
    oldPrice: '₦ 885,500',
    discount: '15% OFF',
    stars: 4,
  },
  {
    img: codey,
    name: 'MAKEBLOCK CODEY ROCKY',
    price: '₦ 600,000',
    oldPrice: '₦ 690,000',
    discount: '15% OFF',
    stars: 5,
  },
  {
    img: vestel,
    name: 'VESTEL 55 INCHES SCREEN',
    price: '₦ 1,200,000',
    oldPrice: '₦ 1,380,000',
    discount: '15% OFF',
    stars: 4,
  },
]

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

export default function FlashSales() {
  const { addToCart } = useCart()
  return (
    <section className={styles.section}>

      {/* ── top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingCart size={14} /> Ongoing
          </span>
          <h2 className={styles.title}>Flash Sales</h2>
          <p className={styles.subtitle}>Every listed new product from our trusted sellers</p>
        </div>

        {/* flash sales gif */}
        <img src={sharp} alt="Sharp printer" className={styles.topGif} />
      </div>

      {/* ── product grid ── */}
      <div className={styles.grid}>
        {products.map((p, i) => (
          <motion.div
            key={i}
            className={styles.card}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
          >
          <div className={styles.imgWrap}>
              <img src={p.img} alt={p.name} className={styles.productImg} />
            </div>

            <div className={styles.infoRow}>
              <div className={styles.info}>
                <p className={styles.name}>{p.name}</p>
                <p className={styles.price}>{p.price}</p>
                <p className={styles.oldPrice}>{p.oldPrice}</p>
                <p className={styles.discount}>{p.discount}</p>
                <Stars count={p.stars} />
              </div>
              <button className={styles.wishlist} aria-label="Add to wishlist">
                <Heart size={20} />
              </button>
            </div>

            <button
              className={styles.addToCart}
              onClick={() => addToCart({ name: p.name, price: p.price, img: p.img })}
            >
              Add to Cart
            </button>
          </motion.div>
        ))}
      </div>

    </section>
  )
}
