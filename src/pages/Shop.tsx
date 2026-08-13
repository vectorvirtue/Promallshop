import styles from './Shop.module.css'
import logitechgif from '../assets/ad-banner.gif'
import { Heart, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Pagination } from 'antd'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { productsApi, getImageUrl, quoteApi } from '../lib/api'
import { useWishlist } from '../lib/useWishlist'
import { useSearchParams } from 'react-router-dom'
import RequestQuoteModal from '../components/RequestQuoteModal'
interface ApiProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  discount: number
  availability: number
  qty?: number | string
  sku?: string
  description?: string
}

interface ApiCategory {
  category_id: number
  category_name: string
  category_slug: string
  category_description: string
  online_discount: number
  product_count: number
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
  hidden:  { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.07, ease: 'easeOut' as const },
  }),
}

export default function Shop(){
 const { addToCart } = useCart()
 const { addToWishlist } = useWishlist()
 const [searchParams] = useSearchParams()
 const [currentPage, setCurrentPage] = useState(1)
 const [openCat, setOpenCat] = useState<string | null>(null)
 const [activeCat, setActiveCat] = useState<string | null>(null)
 const [mobileCatOpen, setMobileCatOpen] = useState(false)
 const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

 /* api state */
 const [categories, setCategories] = useState<ApiCategory[]>([])
 const [products, setProducts] = useState<ApiProduct[]>([])
 const [loadingProducts, setLoadingProducts] = useState(true)
 const [fetchError, setFetchError] = useState('')
 const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
 const [quoteThreshold, setQuoteThreshold] = useState(2000000)
 const [quoteModalOpen, setQuoteModalOpen] = useState(false)
 const [selectedProduct, setSelectedProduct] = useState<ApiProduct | null>(null)

 useEffect(() => {
   // Fetch quote threshold
   quoteApi.getThreshold()
     .then(res => setQuoteThreshold(res.threshold))
     .catch(() => setQuoteThreshold(2000000))

   setLoadingProducts(true)
   productsApi.getAll()
     .then((res: unknown) => {
       const r = res as { success: boolean; data: ApiCategory[] }
       const cats = Array.isArray(r.data) ? r.data : []
       setCategories(cats)
       // flatten all products from all categories by default
       const allProducts = cats.flatMap(c => c.products)
       setProducts(allProducts)
       console.log('Categories received:', cats.length, 'Total products:', allProducts.length)
     })
     .catch((err) => {
       console.error('Products fetch error:', err)
       setFetchError('failed')
     })
     .finally(() => setLoadingProducts(false))
 }, [])

 /* filter by selected category */
 useEffect(() => {
   if (selectedCategory === null) {
     const allProducts = categories.flatMap(c => c.products)
     setProducts(allProducts)
   } else {
     const cat = categories.find(c => c.category_id === selectedCategory)
     setProducts(cat?.products ?? [])
   }
   setCurrentPage(1)
 }, [selectedCategory, categories])

 /* pre-select category from URL param ?category=slug */
 useEffect(() => {
   const slug = searchParams.get('category')
   if (!slug || categories.length === 0) return
   const matched = categories.find(c =>
     c.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug ||
     c.category_slug === slug
   )
   if (matched) {
     setSelectedCategory(matched.category_id)
     setActiveCat(matched.category_name)
   }
 }, [searchParams, categories])

 /* price range state */
 const MIN_PRICE = 0
 const MAX_PRICE = 20_000_000
 const [priceMin, setPriceMin] = useState(MIN_PRICE)
 const [priceMax, setPriceMax] = useState(MAX_PRICE)

 const pageSize = 6

  /* price-filtered products */
  const filteredProducts = products.filter(p => {
    const price = parseFloat(String(p.end_user_price || p.price)) || 0
    // products with price 0 always show (price not set yet)
    if (price === 0) return true
    return price >= priceMin && price <= priceMax
  })

  const indexOfLastProduct = currentPage * pageSize
  const indexOfFirstProduct = indexOfLastProduct - pageSize
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  function toggleCat(categoryId: number, label: string) {
    const isOpen = openCat === label
    setOpenCat(isOpen ? null : label)
    setActiveCat(isOpen ? null : label)
    setSelectedCategory(isOpen ? null : categoryId)
  }

  const formatPrice = (n: number) => '₦ ' + n.toLocaleString('en-NG')

  const handleRequestQuote = (product: ApiProduct) => {
    setSelectedProduct(product)
    setQuoteModalOpen(true)
  }

  const isHighValue = (price: number) => price >= quoteThreshold

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

      {(priceMin !== MIN_PRICE || priceMax !== MAX_PRICE) && (
        <button
          style={{ width: '100%', marginTop: '0.75em', background: 'none', border: 'none', color: '#F18E1A', cursor: 'pointer', fontSize: '0.8em', fontFamily: 'inherit', fontWeight: 600 }}
          onClick={() => { setPriceMin(MIN_PRICE); setPriceMax(MAX_PRICE) }}
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
               {categories.map((cat) => (
               <div key={cat.category_id} className={styles.catItem}>
                 <button
                   className={`${styles.catBtn} ${activeCat === cat.category_name ? styles.catBtnActive : ''}`}
                   onClick={() => toggleCat(cat.category_id, cat.category_name)}
                 >
                   <span>{cat.category_name}</span>
                   <motion.span animate={{ rotate: openCat === cat.category_name ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
                     <ChevronDown size={14} />
                   </motion.span>
                 </button>
                 <AnimatePresence initial={false}>
                   {openCat === cat.category_name && (
                     <motion.div className={styles.subList} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                       <li className={styles.subItem} style={{ listStyle: 'none', fontWeight: 600, color: '#F18E1A' }}>{cat.product_count} products</li>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             ))}
             {selectedCategory !== null && (
               <button
                 onClick={() => { setSelectedCategory(null); setActiveCat(null); setOpenCat(null) }}
                 style={{ width: '100%', padding: '0.5em', background: 'none', border: 'none', color: '#F18E1A', cursor: 'pointer', fontSize: '0.8em', fontFamily: 'inherit', fontWeight: 600 }}
               >
                 Clear filter
               </button>
             )}
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
     {categories.map((cat) => (
       <div key={cat.category_id} className={styles.catItem}>
         <button
           className={`${styles.catBtn} ${activeCat === cat.category_name ? styles.catBtnActive : ''}`}
           onClick={() => toggleCat(cat.category_id, cat.category_name)}
         >
           <span>{cat.category_name}</span>
           <motion.span
             animate={{ rotate: openCat === cat.category_name ? 180 : 0 }}
             transition={{ duration: 0.25 }}
             style={{ display: 'flex' }}
           >
             <ChevronDown size={14} />
           </motion.span>
         </button>
         <AnimatePresence initial={false}>
           {openCat === cat.category_name && (
             <motion.div
               className={styles.subList}
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: 'auto', opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.25, ease: 'easeInOut' }}
             >
               <li
                 className={styles.subItem}
                 style={{ listStyle: 'none', fontWeight: 600, color: '#F18E1A', padding: '0.4em 1.5em' }}
               >
                 {cat.product_count} products
               </li>
             </motion.div>
           )}
         </AnimatePresence>
       </div>
     ))}
     {selectedCategory !== null && (
       <button
         onClick={() => { setSelectedCategory(null); setActiveCat(null); setOpenCat(null) }}
         style={{ width: '100%', marginTop: '0.5em', background: 'none', border: 'none', color: '#F18E1A', cursor: 'pointer', fontSize: '0.8em', fontFamily: 'inherit', fontWeight: 600 }}
       >
         Clear filter
       </button>
     )}
   </div>
   </div>
   <img src={logitechgif} alt="" />
   </aside>
   <div className={styles.productContainer}>
    <h5 className={styles.head}>
   Products
   </h5>

     {loadingProducts && (
       <div className={styles.grid}>
         {Array.from({ length: 6 }).map((_, i) => (
           <div key={i} className={styles.card} style={{ overflow: 'hidden' }}>
             <div className={styles.imgWrap} style={{ background: '#f0f0f0', animation: 'shimmer 1.5s infinite' }} />
             <div style={{ padding: '0.6em 0.8em', display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
               <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '80%', animation: 'shimmer 1.5s infinite' }} />
               <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '50%', animation: 'shimmer 1.5s infinite' }} />
               <div style={{ height: 12, borderRadius: 6, background: '#f0f0f0', width: '35%', animation: 'shimmer 1.5s infinite' }} />
             </div>
             <div style={{ margin: '0 0.8em 0.8em', height: 34, borderRadius: 4, background: '#f0f0f0', animation: 'shimmer 1.5s infinite' }} />
           </div>
         ))}
       </div>
     )}

     {!loadingProducts && (fetchError || filteredProducts.length === 0) && (
       <div style={{ padding: '3em', textAlign: 'center' }}>
         <p style={{ fontSize: '1.1em', fontWeight: 700, color: '#0b0b0b', marginBottom: '0.4em' }}>
           Products Coming Soon
         </p>
         <p style={{ fontSize: '0.85em', color: '#7f7f7f' }}>
           We're stocking up. Check back shortly.
         </p>
       </div>
     )}

     {!loadingProducts && !fetchError && filteredProducts.length > 0 && (
       <>
     <div className={styles.grid}>
        {currentProducts.map((p, i) => (
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
              <img
                src={getImageUrl(p.image)}
                alt={p.name}
                className={styles.productImg}
              />
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
              disabled={Number(p.qty) <= 0 || p.availability === 0}
              onClick={() => {
                if (Number(p.qty) <= 0 || p.availability === 0) return
                
                const priceNum = Number(p.end_user_price || p.price)
                if (priceNum > 0 && isHighValue(priceNum)) {
                  handleRequestQuote(p)
                } else {
                  addToCart({
                    product_id: p.id,
                    name: p.name,
                    price: priceNum === 0
                      ? 'Price on request'
                      : `₦ ${priceNum.toLocaleString('en-NG')}`,
                    img: getImageUrl(p.image),
                  })
                }
              }}
            >
              {Number(p.qty) <= 0 || p.availability === 0 
                ? 'Out of Stock' 
                : (Number(p.end_user_price || p.price) > 0 && isHighValue(Number(p.end_user_price || p.price)))
                ? 'Request for Quote'
                : 'Add to Cart'}
            </button>
          </motion.div>
        ))}
      </div>
      <div className={styles.paginationWrapper}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredProducts.length}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
            />
          </div>
      </>
     )}
   </div>
       </div>

       {/* Request Quote Modal */}
       {selectedProduct && (
         <RequestQuoteModal
           isOpen={quoteModalOpen}
           onClose={() => {
             setQuoteModalOpen(false)
             setSelectedProduct(null)
           }}
           productName={selectedProduct.name}
           productId={selectedProduct.id}
           productPrice={
             Number(selectedProduct.end_user_price || selectedProduct.price) === 0
               ? 'Price on request'
               : `₦ ${Number(selectedProduct.end_user_price || selectedProduct.price).toLocaleString('en-NG')}`
           }
         />
       )}
        </>
    )
}