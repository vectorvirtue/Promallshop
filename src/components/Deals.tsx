import { useEffect, useState } from 'react'
import { ShoppingBagIcon, Heart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'  // <-- ADD THIS
import styles from './Deal.module.css'
import { getTimeLeft } from '../lib/countdown'
import type { TimeLeft } from '../lib/countdown'
import { getImageUrl } from '../lib/api'
import { useWishlist } from '../lib/useWishlist'

const PROMALL_PROXY_URL =
  (import.meta.env.VITE_PROMALL_PROXY_URL as string) ||
  'http://127.0.0.1:8001/proxy'

interface TodayDeal {
  id: number
  title: string
  subtitle: string
  image: string
  product_id: number 
  display_order: number
  start_datetime: string
  end_datetime: string
  is_live: boolean
  seconds_remaining: number
}

export default function Deals() {
  const navigate = useNavigate()   // <-- ADD THIS
  const { addToWishlist } = useWishlist()
  const [deal, setDeal] = useState<TodayDeal | null>(null)
  const [endTarget, setEndTarget] = useState<Date | null>(null)
  const [time, setTime] = useState<TimeLeft>({ d: '00', h: '00', m: '00', s: '00' })

  useEffect(() => {
    const url = import.meta.env.DEV
      ? '/vite-proxy/combined/promallshop/'
      : `${PROMALL_PROXY_URL}/combined/promallshop/`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const deals: TodayDeal[] = Array.isArray(data?.today_deals)
          ? data.today_deals
          : []

        const d = deals.find((item) => item.is_live) ?? null

        if (d) {
          setDeal(d)
          const target = new Date(Date.now() + d.seconds_remaining * 1000)
          setEndTarget(target)
          setTime(getTimeLeft(target))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!endTarget) return
    const id = setInterval(() => setTime(getTimeLeft(endTarget)), 1000)
    return () => clearInterval(id)
  }, [endTarget])

  if (!deal) return null

  const imageUrl = getImageUrl(deal.image)

  // HANDLE BUY NOW CLICK - ADD THIS FUNCTION
  const handleBuyNow = () => {
    if (deal.product_id) {
      navigate(`/product/${deal.product_id}`)
    } else {
      console.warn('No product linked to this deal')
    }
  }

  return (
    <section className={styles.section}>
      <img src={imageUrl} alt="" className={styles.bgImage} />
      <div className={styles.bgOverlay} />

      <div className={styles.container}>
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingBagIcon size={14} /> Today's Deal
          </span>
          <h2 className={styles.title}>{deal.title}</h2>
          {deal.subtitle && <p className={styles.subtitle}>{deal.subtitle}</p>}

          {/* countdown as a single string */}
          <div className={styles.countdown}>
            {time.d} : {time.h} : {time.m} : {time.s}
          </div>

          <div className={styles.actions}>
            <button className={styles.buyBtn} onClick={handleBuyNow}>  {/* <-- ADD onClick */}
              BUY NOW
            </button>
            <button
              className={styles.wishlist}
              aria-label="Add to wishlist"
              onClick={() =>
                addToWishlist({
                  id: deal.id,
                  name: deal.title,
                  price: "Today's Deal",
                  img: imageUrl,
                })
              }
            >
              <Heart size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}