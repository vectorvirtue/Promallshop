import styles from './Shop.module.css'
import logitechgif from '../assets/ad-banner.gif'
import maxhubImg   from '../assets/6615738024026-0 2.svg'
import { Heart, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Pagination } from 'antd'
import { useState, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'

const categoryList = [
  {
    label: 'Video Conferencing',
    sub: ['Logitech Video Conferencing', 'Logitech Video Conferencing', 'Logitech Video Conferencing', 'Logitech Video Conferencing ',' Logitech Video Conferencing'],
  },
  {
    label: 'Screens',
    sub: ['Interactive Flat Panels', 'Non Interactive Flat Panels', 'Signage Screens'],
  },
  {
    label: 'Computer Peripherals',
    
  },
  {
    label: 'Home Automation',
  
  },
  {
    label: 'Phone Accessories',
  
  },
  {
    label: 'Office Equipments',
  },
  {
    label: 'Coding & Robotics Kits',
  },
   {
    label: 'Professional Imaging Solutions',
  },
   {
    label: 'VC Accessories',
  },
]
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
    img: maxhubImg,
    name: 'SAMSUNG 75 INCHES FLIPCHART',
    price: '₦ 5,950,000',
    oldPrice: '₦ 6,842,500',
    discount: '15% OFF',
    stars: 4,
  },
   {
    img: maxhubImg,
    name: 'SAMSUNG 75 INCHES FLIPCHART',
    price: '₦ 5,950,000',
    oldPrice: '₦ 6,842,500',
    discount: '15% OFF',
    stars: 4,
  },
   {
    img: maxhubImg,
    name: 'SAMSUNG 75 INCHES FLIPCHART',
    price: '₦ 5,950,000',
    oldPrice: '₦ 6,842,500',
    discount: '15% OFF',
    stars: 4,
  },
   {
    img: maxhubImg,
    name: 'SAMSUNG 75 INCHES FLIPCHART',
    price: '₦ 5,950,000',
    oldPrice: '₦ 6,842,500',
    discount: '15% OFF',
    stars: 4,
  },
   {
    img: maxhubImg,
    name: 'SAMSUNG 75 INCHES FLIPCHART',
    price: '₦ 5,950,000',
    oldPrice: '₦ 6,842,500',
    discount: '15% OFF',
    stars: 4,
  },]
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
export default function Shop(){
 const { addToCart } = useCart()
 const [currentPage, setCurrentPage] = useState(1)
 const [openCat, setOpenCat] = useState<string | null>(null)
 const [activeCat, setActiveCat] = useState<string | null>(null)
 const [mobileCatOpen, setMobileCatOpen] = useState(false)
 const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

 /* price range state */
 const MIN_PRICE = 0
 const MAX_PRICE = 16_000_000
 const [priceMin, setPriceMin] = useState(MIN_PRICE)
 const [priceMax, setPriceMax] = useState(MAX_PRICE)
 const [appliedMin, setAppliedMin] = useState(MIN_PRICE)
 const [appliedMax, setAppliedMax] = useState(MAX_PRICE)

 const pageSize = 6

  const indexOfLastProduct = currentPage * pageSize
  const indexOfFirstProduct = indexOfLastProduct - pageSize
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)

  function toggleCat(label: string) {
    const isOpen = openCat === label
    setOpenCat(isOpen ? null : label)
    setActiveCat(isOpen ? null : label)
  }

  const formatPrice = (n: number) => '₦ ' + n.toLocaleString('en-NG')

  /* ── custom pointer-based dual slider ── */
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'min' | 'max' | null>(null)
  // keep latest values in refs so event listeners always see current state
  const priceMinRef = useRef(priceMin)
  const priceMaxRef = useRef(priceMax)
  priceMinRef.current = priceMin
  priceMaxRef.current = priceMax

  const getPct = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return 0
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  const pctToValue = (pct: number) =>
    Math.round((MIN_PRICE + pct * (MAX_PRICE - MIN_PRICE)) / 50_000) * 50_000

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return
    const val = pctToValue(getPct(e.clientX))
    if (dragging.current === 'min') {
      setPriceMin(Math.min(val, priceMaxRef.current - 50_000))
    } else {
      setPriceMax(Math.max(val, priceMinRef.current + 50_000))
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    dragging.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }, [handlePointerMove])

  const startDrag = (thumb: 'min' | 'max') => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragging.current = thumb
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const minPct = ((priceMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
  const maxPct = ((priceMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100

  /* reusable price filter panel */
  const PriceFilter = () => (
    <div className={styles.priceFilterPanel}>
      <p className={styles.priceFilterHint}>Drag handles to set price range</p>

      <div className={styles.rangeTrack} ref={trackRef}>
        {/* grey base */}
        <div className={styles.rangeBase} />
        {/* orange fill */}
        <div
          className={styles.rangeHighlight}
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        {/* min thumb */}
        <div
          className={styles.rangeThumb}
          style={{ left: `${minPct}%` }}
          onPointerDown={startDrag('min')}
        />
        {/* max thumb */}
        <div
          className={styles.rangeThumb}
          style={{ left: `${maxPct}%` }}
          onPointerDown={startDrag('max')}
        />
      </div>

      <div className={styles.priceLabels}>
        <span>{formatPrice(priceMin)}</span>
        <span>{formatPrice(priceMax)}</span>
      </div>

      <button
        className={styles.button}
        style={{ width: '100%', marginTop: '0.75em', padding: '0.6em 1em', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.85em' }}
        onClick={() => { setAppliedMin(priceMin); setAppliedMax(priceMax) }}
      >
        Apply
      </button>
      {(appliedMin !== MIN_PRICE || appliedMax !== MAX_PRICE) && (
        <button
          style={{ width: '100%', marginTop: '0.4em', background: 'none', border: 'none', color: '#F18E1A', cursor: 'pointer', fontSize: '0.8em', fontFamily: 'inherit' }}
          onClick={() => { setPriceMin(MIN_PRICE); setPriceMax(MAX_PRICE); setAppliedMin(MIN_PRICE); setAppliedMax(MAX_PRICE) }}
        >
          Clear filter
        </button>
      )}
    </div>
  )
    return(
        <>
        <Helmet>
          <title>
            VC Solutions, Accessories and More — Promallshop
          </title>
        </Helmet>
         <nav className={styles.breadcrumb}>
            <Link className={styles.link} to="/">Home</Link><span>→</span>
            <span>Products</span>
           
          </nav>
       <h2 className={styles.header}>
        All Products
       </h2>

       {/* ── mobile-only filter/category bar ── */}
       <div className={styles.mobileBar}>
         <button
           className={styles.mobileBarBtn}
           onClick={() => { setMobileCatOpen(o => !o); setMobileFilterOpen(false) }}
         >
           Categories <ChevronDown size={14} style={{ marginLeft: 4, transition: 'transform 0.2s', transform: mobileCatOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
         </button>
         <button
           className={`${styles.mobileBarBtn} ${styles.mobileBarBtnDark}`}
           onClick={() => { setMobileFilterOpen(o => !o); setMobileCatOpen(false) }}
         >
           Filters <SlidersHorizontal size={14} style={{ marginLeft: 4 }} />
         </button>
       </div>

       {/* mobile categories dropdown */}
       <AnimatePresence>
         {mobileCatOpen && (
           <motion.div
             className={styles.mobileDropdown}
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.25 }}
           >
             <div className={styles.dropdownPanel}>
               <p className={styles.dropdownPanelTitle}>Browse Categories</p>
               {categoryList.map((cat) => (
               <div key={cat.label} className={styles.catItem}>
                 <button
                   className={`${styles.catBtn} ${activeCat === cat.label ? styles.catBtnActive : ''}`}
                   onClick={() => toggleCat(cat.label)}
                 >
                   <span>{cat.label}</span>
                   <motion.span animate={{ rotate: openCat === cat.label ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
                     <ChevronDown size={14} />
                   </motion.span>
                 </button>
                 <AnimatePresence initial={false}>
                   {openCat === cat.label && cat.sub && (
                     <motion.ul className={styles.subList} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                       {cat.sub.map((s) => <li key={s} className={styles.subItem}>{s}</li>)}
                     </motion.ul>
                   )}
                 </AnimatePresence>
               </div>
             ))}
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* mobile filter dropdown */}
       <AnimatePresence>
         {mobileFilterOpen && (
           <motion.div
             className={styles.mobileDropdown}
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             transition={{ duration: 0.25 }}
           >
             <div className={styles.dropdownPanel}>
               <p className={styles.dropdownPanelTitle}>Filter by Price</p>
               <PriceFilter />
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       <div className={styles.container}>
   <aside className={styles.aside}>
   <div className={styles.one}>
       <h5 className={styles.head}>
    Price Filter
   </h5>
   <div className={styles.two}>
     <PriceFilter />
   </div>
   </div>

   <div className={styles.categories}>
       <h5 className={styles.head}>
   Categories
   </h5>
   <div className={styles.two}>
     {categoryList.map((cat) => (
       <div key={cat.label} className={styles.catItem}>
         <button
           className={`${styles.catBtn} ${activeCat === cat.label ? styles.catBtnActive : ''}`}
           onClick={() => toggleCat(cat.label)}
         >
           <span>{cat.label}</span>
           <motion.span
             animate={{ rotate: openCat === cat.label ? 180 : 0 }}
             transition={{ duration: 0.25 }}
             style={{ display: 'flex' }}
           >
             <ChevronDown size={14} />
           </motion.span>
         </button>

         <AnimatePresence initial={false}>
           {openCat === cat.label && (
             <motion.ul
               className={styles.subList}
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.25, ease: 'easeInOut' }}
             >
               {cat.sub.map((s) => (
                 <li key={s} className={styles.subItem}>{s}</li>
               ))}
             </motion.ul>
           )}
         </AnimatePresence>
       </div>
     ))}
   </div>
   </div>
   <img src={logitechgif} alt="" />
   </aside>
   <div className={styles.productContainer}>
    <h5 className={styles.head}>
   Products
   </h5>
     <div className={styles.grid}>
        {currentProducts.map((p, i) => (
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
              onClick={() => addToCart({ name: p.name, price: p.price, oldPrice: p.oldPrice, img: p.img })}
            >
              Add to Cart
            </button>
          </motion.div>
        ))}
      </div>
      <div className={styles.paginationWrapper}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={products.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false} // Prevents changing items-per-page dropdown unless you want it
            />
          </div>
   </div>
       </div>
        </>
    )
}