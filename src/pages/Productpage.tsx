import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Star, ChevronDown, ChevronUp, ShoppingCart, ShieldCheck, Truck, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../lib/useWishlist'
import RequestQuoteModal from '../components/RequestQuoteModal'
import styles from './Productpage.module.css'
import { getMonthEndTarget, getTimeLeft as getCountdownTimeLeft } from '../lib/countdown'
import { getImageUrl, checkHasOrderedBefore, deliveryCostApi, quoteApi, type DeliveryCost } from '../lib/api'

const API = import.meta.env.VITE_PUBLIC_API_URL as string

interface Product {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  images?: string[]
  discount: number
  short_description: string
  description: string
  warranty: string
  model: string
  sku: string
  qty: number
  faq: string
  video_url: string
  availability: number
  brand_id: string | null
  category_id: string
  alternative_products: string | null
  complementary_products: string | null
}

interface SimilarProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  discount: number
}

interface ApiCategory {
  category_id: number
  category_name: string
  products: SimilarProduct[]
}

function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <span className={styles.stars}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={size} fill={i < count ? '#F18E1A' : 'none'} color={i < count ? '#F18E1A' : '#ddd'} />
      ))}
    </span>
  )
}

function formatPrice(val: string | number) {
  const n = Number(val)
  return n === 0 ? 'Price on request' : `₦ ${n.toLocaleString('en-NG')}`
}

function parseFaq(raw: string): { q: string; a: string }[] {
  if (!raw) return []
  return raw.split('***').map(block => {
    const lines = block.trim().split('\n').filter(Boolean)
    return { q: lines[0] ?? '', a: lines.slice(1).join(' ').trim() }
  }).filter(f => f.q)
}

/* ── countdown uses shared month-end utility ── */

/* ── fetch multiple products by ID in parallel ── */
async function fetchProductsByIds(ids: string): Promise<SimilarProduct[]> {
  const parsed = ids
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  if (parsed.length === 0) return []

  const results = await Promise.allSettled(
    parsed.map(pid =>
      fetch(`${API}/products/${pid}`, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
      }).then(r => r.json())
    )
  )

  return results
    .filter((r): r is PromiseFulfilledResult<{ success: boolean; data: SimilarProduct }> =>
      r.status === 'fulfilled' && r.value?.success && r.value?.data
    )
    .map(r => r.value.data)
}

/* ── reusable product strip with nav arrows ── */
interface ProductStripProps {
  title: string
  products: SimilarProduct[]
  stripRef: React.RefObject<HTMLDivElement | null>
  onScroll: (dir: 'left' | 'right') => void
  addToCart: (item: { product_id: number; name: string; price: string; img: string }) => void
  addToWishlist: (item: { id: number; name: string; price: string; img: string }) => void
}

function ProductStrip({ title, products, stripRef, onScroll, addToCart, addToWishlist }: ProductStripProps) {
  return (
    <div className={styles.similarSection}>
      <div className={styles.similarHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {products.length > 0 && (
          <div className={styles.similarNav}>
            <button className={styles.similarNavBtn} onClick={() => onScroll('left')} aria-label="Scroll left">
              <ChevronLeft size={18} />
            </button>
            <button className={styles.similarNavBtn} onClick={() => onScroll('right')} aria-label="Scroll right">
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <p style={{ fontSize: '0.85em', color: '#aaa', padding: '0.5em 0' }}>
          No products found in this section.
        </p>
      ) : (
        <div className={styles.similarGrid} ref={stripRef}>
          {products.map(p => {
            const price = formatPrice(p.end_user_price || p.price)
            return (
              <div key={p.id} className={styles.similarCard}>
                <div className={styles.similarImgWrap}>
                  <img src={getImageUrl(p.image)} alt={p.name} className={styles.similarProductImg} />
                  {p.discount > 0 && (
                    <span className={styles.similarDiscountBadge}>{p.discount}% OFF</span>
                  )}
                </div>
                <div className={styles.similarInfoRow}>
                  <div className={styles.similarInfo}>
                    <p className={styles.similarName}>
                      <Link to={`/product/${p.id}`} className={styles.similarNameLink}>{p.name}</Link>
                    </p>
                    <p className={styles.similarPrice}>{price}</p>
                    <span className={styles.similarStars}>★★★★★</span>
                  </div>
                  <button
                    className={styles.similarWishlist}
                    aria-label="Add to wishlist"
                    onClick={() => addToWishlist({ id: p.id, name: p.name, price, img: getImageUrl(p.image) })}
                  >
                    <Heart size={18} />
                  </button>
                </div>
                <button
                  className={styles.similarAddToCart}
                  onClick={() => addToCart({ product_id: p.id, name: p.name, price, img: getImageUrl(p.image) })}
                >
                  Add to Cart
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Productpage() {
  const { id } = useParams<{ id: string }>()
  const { addToCart } = useCart()
  const { addToWishlist } = useWishlist()
  const navigate = useNavigate()

  const [product, setProduct] = useState<Product | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [alternative, setAlternative] = useState<SimilarProduct[]>([])
  const [complementary, setComplementary] = useState<SimilarProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImg, setActiveImg] = useState('')
  const [qty, setQty] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'faq'>('description')
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)
  const [countdown, setCountdown] = useState(() => getCountdownTimeLeft(getMonthEndTarget()))
  const [quoteThreshold, setQuoteThreshold] = useState(2000000)
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)

  const alternativeRef = useRef<HTMLDivElement>(null)
  const complementaryRef = useRef<HTMLDivElement>(null)

  /* ── delivery cost for right panel (defaults to Lagos, Nigeria) ── */
  const [shippingData, setShippingData] = useState<DeliveryCost | null>(null)
  const [shippingLoading, setShippingLoading] = useState(true)

  const scroll = useCallback((ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }, [])

  /* check first-time buyer via API */
  useEffect(() => {
    checkHasOrderedBefore().then(hasOrdered => setIsFirstTimeBuyer(!hasOrdered))
  }, [])

  /* fetch quote threshold */
  useEffect(() => {
    quoteApi.getThreshold()
      .then(res => setQuoteThreshold(res.threshold))
      .catch(() => setQuoteThreshold(2000000))
  }, [])

  /* fetch default delivery cost — use DEFAULT record as general estimate */
  useEffect(() => {
    setShippingLoading(true)
    deliveryCostApi
      .get()
      .then((res) => {
        const defaultRecord =
          res.data?.find(d => d.name.toUpperCase() === 'DEFAULT') ??
          res.data?.find(d => !d.state) ??
          res.data?.[0] ??
          null
        setShippingData(defaultRecord)
      })
      .catch(() => setShippingData(null))
      .finally(() => setShippingLoading(false))
  }, [])

  /* countdown tick */
  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdownTimeLeft(getMonthEndTarget())), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError('')
    setCategoryName('')
    setAlternative([])
    setComplementary([])

    async function load() {
      try {
        const res = await fetch(`${API}/products/${id}`, {
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
        })
        const json = await res.json()
        console.log('Product response:', res.status, json)
        if (!json.success || !json.data) throw new Error(json.message || 'Product not found')
        const rawProd: Product = json.data
        // parse comma-separated image field into images array for gallery
        const imageList = rawProd.image
          ? rawProd.image.split(',').map(s => getImageUrl(s.trim())).filter(Boolean)
          : []
        const prod: Product = {
          ...rawProd,
          images: imageList.length > 0 ? imageList : undefined,
        }
        setProduct(prod)
        setActiveImg(imageList[0] ?? getImageUrl(rawProd.image))

        // fetch alternative and complementary in parallel
        const [altProducts, compProducts] = await Promise.all([
          prod.alternative_products ? fetchProductsByIds(prod.alternative_products) : Promise.resolve([]),
          prod.complementary_products ? fetchProductsByIds(prod.complementary_products) : Promise.resolve([]),
        ])

        // resolve category name from grouped endpoint
        const catRes = await fetch(`${API}/products/grouped`, {
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }
        })
        const catJson = await catRes.json()
        const cats: ApiCategory[] = Array.isArray(catJson.data) ? catJson.data : []
        const matched = cats.find(c => String(c.category_id) === String(prod.category_id))
        if (matched) setCategoryName(matched.category_name)

        setAlternative(altProducts)
        setComplementary(compProducts)
      } catch (err) {
        console.error('Product page error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load product')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return (
    <div className={styles.loadingWrap}>
      <div className={styles.loadingBar} />
      <p>Loading product...</p>
    </div>
  )

  if (error || !product) return (
    <div className={styles.errorWrap}>
      <p>{error || 'Product not found'}</p>
      <button onClick={() => navigate('/shop')} className={styles.backBtn}>← Back to Shop</button>
    </div>
  )

  const faqs = parseFaq(product.faq)
  const price = formatPrice(product.end_user_price || product.price)
  const priceNum = Number(product.end_user_price || product.price)
  const isHighValue = priceNum >= quoteThreshold
  const hasDiscount = product.discount > 0
  const originalPriceNum = hasDiscount ? Math.round(priceNum / (1 - product.discount / 100)) : 0
  const originalPrice = hasDiscount ? formatPrice(originalPriceNum) : null
  const shipping = shippingData ? parseFloat(shippingData.amount) || 0 : 0
  const total = priceNum > 0 ? priceNum + shipping : 0
  const minDays = shippingData?.min_delivery_period ?? 3
  const maxDays = shippingData?.max_delivery_period ?? 5
  const catLabel = categoryName
    ? categoryName.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
    : 'Promallshop'

  const youtubeId = product.video_url
    ? product.video_url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1]
    : null

  /* thumbnail list — use product.images if present, otherwise just the main image */
  const thumbList = product.images && product.images.length > 0 ? product.images : [product.image]

  return (
    <>
      <nav className={styles.breadcrumb}>
        <Link to="/" className={styles.breadLink}>Home</Link>
        <span>→</span>
        <Link to="/shop" className={styles.breadLink}>Shop</Link>
        <span>→</span>
        <span className={styles.breadCurrent}>{product.name}</span>
      </nav>

      <div className={styles.page}>

        {/* ══════════════ TOP SECTION ══════════════ */}
        <div className={styles.topSection}>

          {/* ── COL 1: gallery ── */}
          <div className={styles.gallery}>
            {/* vertical thumbnail strip */}
            <div className={styles.thumbStrip}>
              {thumbList.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${activeImg === getImageUrl(img) ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(getImageUrl(img))}
                >
                  <img src={getImageUrl(img)} alt={`view ${i + 1}`} />
                </button>
              ))}
            </div>

            {/* main image */}
            <div className={styles.mainImg}>
              {hasDiscount && <span className={styles.hotBadge}>Hot</span>}
              <img src={activeImg || getImageUrl(product.image)} alt={product.name} />
            </div>

            {/* availability below image */}
            <div className={styles.availNote}>
              <p className={styles.availTitle}>Availability</p>
              <p className={styles.availText}>
                Please contact us at{' '}
                <a href="tel:+2347032647755" className={styles.availLink}>+234 703 264 7755</a>
                {' '}or{' '}
                <a href="mailto:sales@promallshop.com" className={styles.availLink}>sales@promallshop.com</a>
                {' '}for availability and best prices!
              </p>
            </div>
          </div>

          {/* ── COL 2: product info ── */}
          <div className={styles.info}>
            <p className={styles.catLabel}>{catLabel}</p>
            <h1 className={styles.productName}>{product.name}</h1>

            {product.short_description && (
              <div>
                <p className={styles.shortDesc}>
                  {showFullDesc
                    ? product.short_description
                    : product.short_description.slice(0, 120) + (product.short_description.length > 120 ? '…' : '')}
                </p>
                {product.short_description.length > 120 && (
                  <button
                    className={styles.readMoreBtn}
                    onClick={() => setShowFullDesc(v => !v)}
                  >
                    {showFullDesc ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* stars + wishlist */}
            <div className={styles.ratingRow}>
              <Stars count={4} size={18} />
              <button
                className={styles.heartBtn}
                aria-label="Add to wishlist"
                onClick={() => addToWishlist({ id: product.id, name: product.name, price, img: getImageUrl(product.image) })}
              >
                <Heart size={18} />
              </button>
            </div>

            {/* price row */}
            <div className={styles.priceRow}>
              {hasDiscount && originalPrice && (
                <span className={styles.oldPrice}>{originalPrice}</span>
              )}
              {hasDiscount && (
                <span className={styles.discountTag}>{product.discount}% OFF</span>
              )}
            </div>

            {/* warranty + stock */}
            <div className={styles.badgeRow}>
              {product.warranty && (
                <span className={styles.badge}>
                  <CheckCircle2 size={13} /> {product.warranty} months Warranty
                </span>
              )}
              <span className={`${styles.badge} ${product.qty > 0 ? styles.badgeGreen : styles.badgeRed}`}>
                <ShoppingCart size={13} />
                {product.qty > 0 ? `${product.qty} in Stock` : 'Out of Stock'}
              </span>
            </div>

            <hr className={styles.hr} />

            {/* brand / model */}
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category </span>
                <span className={styles.metaVal}>{catLabel}</span>
              </div>
              {product.model && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Model</span>
                  <span className={styles.metaVal}>{product.model}</span>
                </div>
              )}
            </div>

            <hr className={styles.hr} />

            {/* qty + buttons */}
            <div className={styles.qtyRow}>
              <span className={styles.qtyLabel}>Qty</span>
              <div className={styles.qtyCtrl}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>‹</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)}>›</button>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.addBtn}
                disabled={product.qty <= 0}
                onClick={() => {
                  if (product.qty <= 0) return
                  if (priceNum > 0 && isHighValue) {
                    setQuoteModalOpen(true)
                  } else {
                    addToCart({ product_id: product.id, name: product.name, price, img: getImageUrl(product.image) }, qty)
                  }
                }}
              >
                {product.qty <= 0 ? 'Out of Stock' : (priceNum > 0 && isHighValue) ? 'Request for Quote' : 'Add to Cart'}
              </button>
              <button
                className={styles.buyBtn}
                disabled={product.qty <= 0}
                onClick={() => {
                  if (product.qty <= 0) return
                  if (priceNum > 0 && isHighValue) {
                    setQuoteModalOpen(true)
                  } else {
                    addToCart({ product_id: product.id, name: product.name, price, img: getImageUrl(product.image) }, qty)
                    navigate('/checkout')
                  }
                }}
              >
                {(priceNum > 0 && isHighValue) ? 'Request for Quote' : 'Buy Now'}
              </button>
            </div>

            {/* perks bar */}
            <div className={styles.perksBar}>
              <div className={styles.perk}><ShieldCheck size={18} /><span>Guaranteed Product</span></div>
              <div className={styles.perkDivider} />
              <div className={styles.perk}><ShoppingCart size={18} /><span>24/7 Support</span></div>
              <div className={styles.perkDivider} />
              <div className={styles.perk}><Truck size={18} /><span>Fast Delivery</span></div>
            </div>
          </div>

          {/* ── COL 3: right panel ── */}
          <div className={styles.rightPanel}>
            {/* promo banner — first-time buyers see discount offer, returning customers see loyalty message */}
            {isFirstTimeBuyer ? (
              <div className={styles.promoBanner}>
                <p className={styles.promoText}>Hurry! Order now and get 15% discount on your purchase 🛍️</p>
                <div className={styles.countdown}>
                  {[
                    { label: 'Days',    val: countdown.d },
                    { label: 'Hours',   val: countdown.h },
                    { label: 'Minutes', val: countdown.m },
                    { label: 'Seconds', val: countdown.s },
                  ].map((u, i, arr) => (
                    <span key={u.label} style={{ display: 'contents' }}>
                      <div className={styles.cdUnit}>
                        <span className={styles.cdLabel}>{u.label}</span>
                        <span className={styles.cdVal}>{u.val}</span>
                      </div>
                      {i < arr.length - 1 && <span className={styles.cdColon}>:</span>}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <p className={styles.promoText}>
                  Thank you for choosing Promallshop again. 
                </p>
               
            </>
            )}

            {/* price + discount */}
            <div className={styles.panelPriceRow}>
              <span className={styles.panelPrice}>{price}</span>
              {hasDiscount && <span className={styles.panelDiscount}>{product.discount}% OFF</span>}
            </div>

            {/* payment summary */}
            {priceNum > 0 && (
              <>
                <p className={styles.panelSummaryTitle}>
                  Estimated delivery fee <span className={styles.panelLocation}>(standard rate)</span>
                </p>
                <table className={styles.summaryTable}>
                  <tbody>
                    <tr>
                      <td>Item Cost</td>
                      <td>{price}</td>
                    </tr>
                    <tr>
                      <td>Shipping Fees</td>
                      <td>
                        {shippingLoading
                          ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                          : shippingData
                            ? formatPrice(shipping)
                            : '—'
                        }
                      </td>
                    </tr>
                    <tr className={styles.summaryTotal}>
                      <td>Total Costs</td>
                      <td>
                        {shippingLoading
                          ? <Loader2 size={13} style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                          : formatPrice(total)
                        }
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p className={styles.deliveryDate}>
                  Estimated delivery date{' '}
                  <strong>
                    {new Date(Date.now() + minDays * 86400000).toLocaleDateString('en-NG', { month: 'long', day: 'numeric' })}
                    {' – '}
                    {new Date(Date.now() + maxDays * 86400000).toLocaleDateString('en-NG', { month: 'long', day: 'numeric' })}
                  </strong>
                </p>

                <table className={styles.shippingTable}>
                  <tbody>
                    <tr><td>Ships from</td><td>Promallshop HQ</td></tr>
                    <tr><td>Packaged at</td><td>Promallshop HQ</td></tr>
                    <tr><td>Customer service</td><td>promallshop.com</td></tr>
                  </tbody>
                </table>
              </>
            )}
          </div>

        </div>
        {/* ══════════════ END TOP SECTION ══════════════ */}

        {/* ── TABS ── */}
        <div className={styles.tabs}>
          {(['description', 'specs', 'faq'] as const).map(tab => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'description' ? 'Description' : tab === 'specs' ? 'Specifications' : 'FAQ'}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'description' && (
            <div className={styles.descText}>
              {product.sku
                ? product.sku.split('***').map((line, i) => <p key={i}>{line.trim()}</p>)
                : <p style={{ color: '#7f7f7f' }}>No description available.</p>
              }
            </div>
          )}
          {activeTab === 'specs' && (
            <div className={styles.descHtml} dangerouslySetInnerHTML={{ __html: product.description || '<p>No specifications available.</p>' }} />
          )}
          {activeTab === 'faq' && (
            <div className={styles.faqList}>
              {faqs.length === 0
                ? <p style={{ color: '#7f7f7f' }}>No FAQs available.</p>
                : faqs.map((f, i) => (
                    <div key={i} className={styles.faqItem}>
                      <button className={styles.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        <span>{f.q}</span>
                        {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {openFaq === i && <p className={styles.faqA}>{f.a}</p>}
                    </div>
                  ))
              }
            </div>
          )}
        </div>

        {/* ── VIDEO ── */}
        {youtubeId && (
          <div className={styles.videoSection}>
            <h3 className={styles.sectionTitle}>Product Video</h3>
            <div className={styles.videoWrap}>
              <iframe src={`https://www.youtube.com/embed/${youtubeId}`} title={product.name} allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          </div>
        )}

        {/* ── ALTERNATIVE PRODUCTS ── */}
        <ProductStrip
          title="Alternative Products"
          products={alternative}
          stripRef={alternativeRef}
          onScroll={dir => scroll(alternativeRef, dir)}
          addToCart={addToCart}
          addToWishlist={addToWishlist}
        />

        {/* ── COMPLEMENTARY PRODUCTS ── */}
        <ProductStrip
          title="Complementary Products"
          products={complementary}
          stripRef={complementaryRef}
          onScroll={dir => scroll(complementaryRef, dir)}
          addToCart={addToCart}
          addToWishlist={addToWishlist}
        />

      </div>

      {/* Request Quote Modal */}
      {product && (
        <RequestQuoteModal
          isOpen={quoteModalOpen}
          onClose={() => setQuoteModalOpen(false)}
          productName={product.name}
          productId={product.id}
          productPrice={price}
        />
      )}
    </>
  )
}