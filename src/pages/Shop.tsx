import styles from './Shop.module.css'
import logitechgif from '../assets/ad-banner.gif'
import { Heart, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Pagination } from 'antd'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { productsApi, getImageUrl, quoteApi, subcategoriesApi } from '../lib/api'
import { productPath } from '../lib/slugs'
import { useWishlist } from '../lib/useWishlist'
import { useQuoteForm } from '../context/QuoteFormContext'
import shop from '../assets/shop.gif'
import shopSocialImage from '../assets/promall1crop-2@2x.png'
interface ApiProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  discount: number
  category_id?: number | string
  subcategory_id?: number | string
  categoryOnlineDiscount?: number
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
  faq?: string
  online_discount: number
  product_count: number
  products: ApiProduct[]
}


function FaqAccordion({ html }: { html: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  // Format: <p>Question<br>Answer line 1<br>Answer line 2<br>***</p>
  // Each <p> is one FAQ item. First segment = question, rest (before ***) = answer.
  const pairs = useMemo(() => {
    const decodeHtml = (value: string) => {
      const textarea = document.createElement('textarea')
      textarea.innerHTML = value
      return textarea.value
    }

    const normalized = decodeHtml(html)
    const div = document.createElement('div')
    div.innerHTML = normalized
    const items: { question: string; answer: string }[] = []

    let currentItem: { question: string; answer: string } | null = null

    const flushItem = () => {
      if (currentItem?.question && currentItem.answer.trim()) {
        items.push({ ...currentItem, answer: currentItem.answer.trim() })
      }
      currentItem = null
    }

    const serializeNodes = (nodes: Node[]) => {
      const container = document.createElement('div')
      nodes.forEach(node => container.append(node.cloneNode(true)))
      return container.innerHTML.trim()
    }

    const contentBlocks = Array.from(div.querySelectorAll('p, h1, h2, h3, h4, h5, h6'))
    for (const node of contentBlocks) {
      const segments: Node[][] = [[]]
      if (node.tagName === 'P') {
        Array.from(node.childNodes).forEach(child => {
          if (child instanceof HTMLElement && child.tagName === 'BR') {
            segments.push([])
          } else {
            segments[segments.length - 1].push(child)
          }
        })
      } else {
        segments[0] = Array.from(node.childNodes)
      }

      for (const segment of segments) {
        const segmentHtml = serializeNodes(segment)
        const segmentText = segment.map(child => child.textContent ?? '').join('').trim()
        if (!segmentText) continue

        if (/^\*{3,}$/.test(segmentText)) {
          flushItem()
          continue
        }

        const segmentContainer = document.createElement('div')
        segmentContainer.innerHTML = segmentHtml
        const strong = segmentContainer.querySelector('strong')
        const strongText = strong?.textContent?.trim() ?? ''
        const questionText = /\?$/.test(strongText)
          ? strongText
          : !strong && /\?$/.test(segmentText)
            ? segmentText
            : ''

        if (questionText) {
          flushItem()
          if (strong) strong.remove()
          currentItem = { question: questionText, answer: segmentContainer.innerHTML.trim() }
        } else if (currentItem) {
          const answerBlock = node.tagName === 'P' ? `<p>${segmentHtml}</p>` : segmentHtml
          currentItem.answer += `${currentItem.answer ? ' ' : ''}${answerBlock}`
        }
      }
    }

    flushItem()

    if (items.length === 0) {
      const lines = normalized.replace(/\r/g, '').split('\n')
      let currentQuestion: string | null = null
      let currentAnswer: string[] = []

      const flush = () => {
        if (!currentQuestion) return
        const answer = currentAnswer.join('\n').trim()
        if (answer) {
          items.push({ question: currentQuestion, answer })
        }
      }

      for (const line of lines) {
        const trimmed = line.trim()
        const headingMatch = trimmed.match(/^#{1,6}\s*(?:\[(.+?)\]\([^)]*\)|(.+))$/)

        if (headingMatch) {
          flush()
          currentQuestion = (headingMatch[1] || headingMatch[2] || '').trim()
          currentAnswer = []
          continue
        }

        if (!currentQuestion) {
          if (!trimmed || /^\*{3,}$/.test(trimmed) || /^-+$/.test(trimmed)) continue
          if (/\?$/.test(trimmed) || /^\d+\.?\s*.*\?$/.test(trimmed)) {
            currentQuestion = trimmed.replace(/^\d+\.?\s*/, '')
          }
          continue
        }

        if (/^\*{3,}$/.test(trimmed) || /^-+$/.test(trimmed)) {
          flush()
          currentQuestion = null
          currentAnswer = []
          continue
        }

        if (trimmed) {
          currentAnswer.push(trimmed)
        }
      }

      flush()
    }

    return items
  }, [html])

  if (pairs.length === 0) return null

  return (
    <section className={styles.categoryFaq}>
      <h2>Frequently Asked Questions</h2>
      <div className={styles.faqList}>
        {pairs.map((item, i) => (
          <div key={i} className={styles.faqItem}>
            <button
              className={`${styles.faqQuestion} ${openIndex === i ? styles.faqQuestionOpen : ''}`}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            >
              <span>{item.question.replace(/<[^>]*>/g, '')}</span>
              <motion.span
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexShrink: 0 }}
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {openIndex === i && (
                <motion.div
                  className={styles.faqAnswer}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div dangerouslySetInnerHTML={{ __html: item.answer }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  )
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

interface PriceFilterProps {
  trackRef: React.RefObject<HTMLDivElement | null>
  minPct: number
  maxPct: number
  priceMin: number
  priceMax: number
  minPrice: number
  maxPrice: number
  formatPrice: (value: number) => string
  startDrag: (thumb: 'min' | 'max') => (e: React.PointerEvent<HTMLDivElement>) => void
  resetPrice: () => void
}

function PriceFilter({
  trackRef,
  minPct,
  maxPct,
  priceMin,
  priceMax,
  minPrice,
  maxPrice,
  formatPrice,
  startDrag,
  resetPrice,
}: PriceFilterProps) {
  return (
    <div className={styles.priceFilterPanel}>
      <p className={styles.priceFilterHint}>Drag handles to set price range</p>
      <div className={styles.rangeTrack} ref={trackRef}>
        <div className={styles.rangeBase} />
        <div
          className={styles.rangeHighlight}
          style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
        />
        <div
          className={styles.rangeThumb}
          style={{ left: `${minPct}%` }}
          onPointerDown={startDrag('min')}
        />
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

      {(priceMin !== minPrice || priceMax !== maxPrice) && (
        <button
          style={{ width: '100%', marginTop: '0.75em', background: 'none', border: 'none', color: '#F18E1A', cursor: 'pointer', fontSize: '0.8em', fontFamily: 'inherit', fontWeight: 600 }}
          onClick={resetPrice}
        >
          Clear filter
        </button>
      )}
    </div>
  )
}

export default function Shop(){
 const { addToCart } = useCart()
 const { addToWishlist } = useWishlist()
 const { openQuoteForm } = useQuoteForm()
 const { category: categoryParam, subcategory: _subcategoryParam, term: searchTermParam } = useParams<{ category?: string; subcategory?: string; term?: string }>()
 const [searchParams] = useSearchParams()
 const searchQuery = (searchTermParam || searchParams.get('q') || '').trim().toLowerCase()
 const [currentPage, setCurrentPage] = useState(1)
 const [openCat, setOpenCat] = useState<string | null>(null)
 const [activeCat, setActiveCat] = useState<string | null>(null)
 const [mobileCatOpen, setMobileCatOpen] = useState(false)
 const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [hoveredCat, setHoveredCat] = useState<number | null>(null)
  const [hoveredCatY, setHoveredCatY] = useState(0)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

 /* api state */
 const [categories, setCategories] = useState<ApiCategory[]>([])
 const [products, setProducts] = useState<ApiProduct[]>([])
 const [loadingProducts, setLoadingProducts] = useState(true)
 const [fetchError, setFetchError] = useState('')
 const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
 const [selectedSubcategory, setSelectedSubcategory] = useState<{ id: number; name: string } | null>(null)
 const [quoteThreshold, setQuoteThreshold] = useState(2000000)
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<number, { id: number; name: string; slug: string }[]>>({})

 const fetchDone = useRef(false)

 useEffect(() => {
   if (fetchDone.current) return
   fetchDone.current = true

   quoteApi.getThreshold()
     .then(res => setQuoteThreshold(res.threshold))
     .catch(() => setQuoteThreshold(2000000))

   setLoadingProducts(true)
   productsApi.getAll()
     .then((res: unknown) => {
       const r = res as { success: boolean; data: ApiCategory[] }
       const cats = Array.isArray(r.data) ? r.data.map(category => ({
         ...category,
         products: category.products.map(product => ({
           ...product,
           categoryOnlineDiscount: Number(category.online_discount) || 0,
         })),
       })) : []
       setCategories(cats)

       // If URL has a category slug, pre-select it — do this here so no separate
       // useEffect can ever overwrite a user's subsequent click
       const slug = categoryParam
       const matched = slug ? cats.find(c =>
         c.category_slug === slug ||
         c.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug
       ) : null

       if (matched) {
         setSelectedCategory(matched.category_id)
         setActiveCat(matched.category_name)
         setOpenCat(matched.category_name)
         setProducts(matched.products)
       } else {
         setProducts(cats.flatMap(c => c.products))
       }
     })
     .catch((err) => {
       console.error('Products fetch error:', err)
       setFetchError('failed')
     })
     .finally(() => setLoadingProducts(false))
 }, [])

  useEffect(() => {
    subcategoriesApi.getGrouped()
      .then((res: unknown) => {
        const r = res as { data?: unknown; success?: boolean }
        const raw = Array.isArray(r.data) ? r.data : Array.isArray(res) ? res as unknown[] : []
        const data = raw as Array<{ category_id: string | number; subcategories: Array<{ id: number; name: string; slug: string }> }>
        const map: Record<number, { id: number; name: string; slug: string }[]> = {}
        data.forEach(group => {
          if (group.subcategories?.length) {
            map[Number(group.category_id)] = group.subcategories.map(s => ({ id: s.id, name: s.name, slug: s.slug }))
          }
        })
        setSubcategoriesMap(map)
      })
      .catch(() => {})
  }, [])



 /* price range state */
 const MIN_PRICE = 0
 const MAX_PRICE = 20_000_000
 const [priceMin, setPriceMin] = useState(MIN_PRICE)
 const [priceMax, setPriceMax] = useState(MAX_PRICE)

 const pageSize = 8

 const parseProductPrice = (value: string | number) => {
   if (typeof value === 'number') return value
   const normalized = value.replace(/[^0-9.-]/g, '')
   return normalized ? Number(normalized) : 0
 }

  /* price-filtered products */
  const filteredProducts = products.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery)) return false
    const price = parseProductPrice(p.end_user_price || p.price)
    // Products without a price are included only while the range includes zero.
    if (price === 0) return priceMin === MIN_PRICE
    return price >= priceMin && price <= priceMax
  })

  const indexOfLastProduct = currentPage * pageSize
  const indexOfFirstProduct = indexOfLastProduct - pageSize
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  function toggleCat(cat: ApiCategory) {
    const isCurrentlyActive = activeCat === cat.category_name
    if (isCurrentlyActive) {
      setActiveCat(null)
      setOpenCat(null)
      setSelectedCategory(null)
      setSelectedSubcategory(null)
      setProducts(categories.flatMap(c => c.products))
      setCurrentPage(1)
    } else {
      setActiveCat(cat.category_name)
      setOpenCat(cat.category_name)
      setSelectedCategory(cat.category_id)
      setSelectedSubcategory(null)
      setProducts(cat.products)
      setCurrentPage(1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function matchesSubcategory(product: ApiProduct, subcategoryId: number) {
    const ids = [product.subcategory_id, product.category_id]
    return ids.some(id => Number(id) === subcategoryId)
  }

  function handleSubcategoryClick(sub: { id: number; name: string; slug: string }, categoryId: number) {
    setHoveredCat(null)
    setSelectedSubcategory(sub)
    const matchedCat = categories.find(c => c.category_id === categoryId)
    if (matchedCat) {
      setActiveCat(matchedCat.category_name)
      setOpenCat(matchedCat.category_name)
      setSelectedCategory(matchedCat.category_id)
      const filteredProducts = matchedCat.products.filter(product => matchesSubcategory(product, sub.id))
      setProducts(filteredProducts)
      setCurrentPage(1)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatPrice = (n: number) => '₦ ' + n.toLocaleString('en-NG')

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

  /* ── custom pointer-based dual slider ── */
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<'min' | 'max' | null>(null)
  // keep latest values in refs so event listeners always see current state
  const priceMinRef = useRef(priceMin)
  const priceMaxRef = useRef(priceMax)

  useEffect(() => {
    priceMinRef.current = priceMin
    priceMaxRef.current = priceMax
  }, [priceMin, priceMax])

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

  function handlePointerUp() {
    dragging.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  const startDrag = (thumb: 'min' | 'max') => (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragging.current = thumb
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const minPct = ((priceMin - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
  const maxPct = ((priceMax - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100

  const priceFilterProps = {
    trackRef,
    minPct,
    maxPct,
    priceMin,
    priceMax,
    minPrice: MIN_PRICE,
    maxPrice: MAX_PRICE,
    formatPrice,
    startDrag,
    resetPrice: () => { setPriceMin(MIN_PRICE); setPriceMax(MAX_PRICE) },
  }

  /* canonical + social URLs follow the current route, so /shop and
     /shop/:category each declare themselves */
  const shopUrl = `${window.location.origin}/shop`
  /* imported rather than hardcoded — the asset lives in src/assets, so Vite
     hashes it and the URL resolves wherever the app is deployed */
  const shopImage = new URL(shopSocialImage, window.location.origin).toString()
    return(
        <>
         <img className={styles.gif} src={shop} alt="Belkin gif" />
        <Helmet>
          <title>
            Nigeria’s Top Tech Store: VC Solutions, Accessories, and More | Promallshop
          </title>
          <meta
            name="description"
            content="Find top video conferencing solutions, headsets, webcams, keyboards, coding & robotic kits, and accessories at Promallshop. Best deals today!"
          />
          <meta
            name="keywords"
            content="Wireless Headsets, Gaming Headsets, Noise-canceling Headphones, Bluetooth Headsets, Logitech H390 USB Headset, Best Webcams for Streaming, Logitech Webcams, Video Conferencing Tools, Video Conferencing Solutions, Mechanical Keyboards, Ergonomic Keyboards, Gaming Keyboards, Wireless Keyboard and Mouse, Curved Monitors, Samsung Odyssey Monitors, Touchscreen Displays, Interactive Touchscreen Displays, Digital Signage, Wireless Presentation Devices, Logitech Video Conferencing Accessories, Wireless Mouse for Gaming, Programmable Mouse, Gaming Mice, Best Coding and Robotics Kits, Programmable Robot Kits for Adults, Programmable Robot Kits for Beginners, Arduino Kits, Mobile Phone Accessories, Powerbanks, Belkin Accessories, Headphones, AirPods, Car Chargers, USB Cables, Accessories, Mouse, Office Equipment, Toner Cartridge, Printer, Toner, Cartridge, Sublimation Printer, Printing Near Me, DTF Printer, Printer Ink, Office, Equipment, Scanner, Yealink, Huawei, Samsung, Hikvision, Belkin, Logitech, Video Conferencing, Shop, Technology"
          />

          <meta property="og:url" content={shopUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="PROMALLSHOP ECOMMERCE STORE" />
          <meta
            property="og:description"
            content="Shop headsets, IT accessories, webcams, keyboards, coding kits, home automation, and office equipment at Promallshop. Discover deals on the latest tech."
          />
          <meta property="og:image" content={shopImage} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@promallshop" />
          <meta name="twitter:site:id" content="1709918300" />
          <meta name="twitter:creator" content="@promallshop" />
          <meta name="twitter:title" content="Promallshop Online Shopping" />
          <meta name="twitter:image" content={shopImage} />
          <meta name="twitter:url" content={shopUrl} />

          <link rel="canonical" href={shopUrl} />
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
                   {/* mobile catItem has no hover */}
                  <button
                    className={`${styles.catBtn} ${activeCat === cat.category_name ? styles.catBtnActive : ""}`}
                 >
                   <span className={styles.catText}>
                     <span>{cat.category_name.toUpperCase()}</span>
                     <span className={styles.catCount} style={{ listStyle: 'none', fontWeight: 600, color: 'rgb(241, 142, 26)', padding: '0.4em 1.5em', fontSize: '0.8em' }}>{cat.product_count} products</span>
                   </span>
                   <motion.span animate={{ rotate: openCat === cat.category_name ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ display: 'flex' }}>
                     <ChevronDown size={14} />
                   </motion.span>
                 </button>
                 <AnimatePresence initial={false}>
                   {openCat === cat.category_name && (
                     <motion.div className={styles.subList} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                        {(subcategoriesMap[cat.category_id] || []).map(sub => (
                          <li key={sub.id} className={styles.subItem} style={{ listStyle: 'none' }} onClick={() => handleSubcategoryClick(sub, cat.category_id)}>{sub.name}</li>
                        ))}
                       <li className={styles.subItem} style={{ listStyle: 'none', fontWeight: 600, color: '#F18E1A', padding: '0.4em 1.5em' }}>{cat.product_count} products</li>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
             ))}
             {selectedCategory !== null && (
               <button
                 onClick={() => { setActiveCat(null); setOpenCat(null); setSelectedCategory(null); setSelectedSubcategory(null); setProducts(categories.flatMap(c => c.products)); setCurrentPage(1) }}
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
               <PriceFilter {...priceFilterProps} />
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
    <PriceFilter {...priceFilterProps} />
   </div>
   </div>

   <div className={styles.categories}>
       <h5 className={styles.head}>
   Categories
   </h5>
   <div className={styles.two}>
       {categories.map((cat) => (
         <div
           key={cat.category_id}
           className={styles.catItem}
           onMouseEnter={(e) => {
             if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
             setHoveredCat(cat.category_id)
             setHoveredCatY(e.currentTarget.getBoundingClientRect().top)
           }}
           onMouseLeave={() => {
             closeTimerRef.current = setTimeout(() => setHoveredCat(null), 120)
           }}
         >
           <button
             className={`${styles.catBtn} ${activeCat === cat.category_name ? styles.catBtnActive : ""}`}
             onClick={() => toggleCat(cat)}
           >
             <span className={styles.catText}>
               <span>{cat.category_name.toUpperCase()}</span>
               <span className={styles.catCount} style={{ listStyle: 'none', fontWeight: 600, color: 'rgb(241, 142, 26)', padding: '0.4em 1.5em', fontSize: '0.8em' }}>{cat.product_count} products</span>
             </span>
             <motion.span
               animate={{ rotate: openCat === cat.category_name ? 180 : 0 }}
               transition={{ duration: 0.25 }}
               style={{ display: "flex" }}
             >
               <ChevronDown size={14} />
             </motion.span>
           </button>
         </div>
       ))}
       {selectedCategory !== null && (
         <button
           onClick={() => { setActiveCat(null); setOpenCat(null); setSelectedCategory(null); setSelectedSubcategory(null); setProducts(categories.flatMap(c => c.products)); setCurrentPage(1) }}
           style={{ width: "100%", marginTop: "0.5em", background: "none", border: "none", color: "#F18E1A", cursor: "pointer", fontSize: "0.8em", fontFamily: "inherit", fontWeight: 600 }}
         >
           Clear filter
         </button>
       )}
     
   </div>
   </div>
   <img src={logitechgif} alt="" />
   </aside>
    {/* Subcategory popup — floats over products */}
    <AnimatePresence>
      {hoveredCat !== null && (subcategoriesMap[hoveredCat] || []).length > 0 && (
        <motion.div
          className={styles.subPopup}
          style={{ top: hoveredCatY }}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15 }}
          onMouseEnter={() => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
          }}
          onMouseLeave={() => {
            closeTimerRef.current = setTimeout(() => setHoveredCat(null), 120)
          }}
        >
          {(subcategoriesMap[hoveredCat] || []).map(sub => (
            <li
              key={sub.id}
              className={styles.subItem}
              style={{ listStyle: "none" }}
              onClick={() => handleSubcategoryClick(sub, hoveredCat!)}
            >
              {sub.name}
            </li>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
   <div className={styles.productContainer}>
           

    <h5 className={styles.head}>
      {selectedSubcategory ? selectedSubcategory.name : 'Products'}
      {selectedSubcategory && (
        <button
          onClick={() => {
            setSelectedSubcategory(null)
            if (selectedCategory !== null) {
              const cat = categories.find(c => c.category_id === selectedCategory)
              setProducts(cat?.products ?? [])
            } else {
              setProducts(categories.flatMap(c => c.products))
            }
            setCurrentPage(1)
          }}
          style={{ marginLeft: '1em', fontSize: '0.7em', fontWeight: 400, background: 'none', border: 'none', color: '#F18E1A', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ✕ clear
        </button>
      )}
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
           {fetchError
             ? 'Products Coming Soon'
             : priceMin !== MIN_PRICE || priceMax !== MAX_PRICE
               ? 'No products match this price range'
               : 'Products Coming Soon'}
         </p>
         <p style={{ fontSize: '0.85em', color: '#7f7f7f' }}>
           {fetchError || (priceMin === MIN_PRICE && priceMax === MAX_PRICE)
             ? "We're stocking up. Check back shortly."
             : 'Try adjusting the slider or clear the price filter.'}
         </p>
         {!fetchError && (priceMin !== MIN_PRICE || priceMax !== MAX_PRICE) && (
           <button
             onClick={() => { setPriceMin(MIN_PRICE); setPriceMax(MAX_PRICE) }}
             style={{ marginTop: '0.75em', padding: '0.55em 1em', border: '1px solid #F18E1A', borderRadius: 5, background: '#fff', color: '#F18E1A', cursor: 'pointer', fontWeight: 600 }}
           >
             Clear price filter
           </button>
         )}
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

      {/* Category Description and FAQ — full page width */}
      {selectedCategory && (() => {
        const selectedCat = categories.find(cat => cat.category_id === selectedCategory);
        if (!selectedCat) return null;

        return (
          <div className={styles.categoryInfoWrapper}>
            {selectedCat.category_description && (
              <div className={styles.categoryDescription}>
                <h2>About {selectedCat.category_name}</h2>
                <div dangerouslySetInnerHTML={{ __html: selectedCat.category_description }} />
              </div>
            )}

            {selectedCat.faq && <FaqAccordion html={selectedCat.faq} />}
          </div>
        );
      })()}
      
        </>
    )
}
