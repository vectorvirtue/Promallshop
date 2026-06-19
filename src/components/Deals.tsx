import { useEffect, useState } from 'react'
import { ShoppingBagIcon, Heart } from 'lucide-react'
import styles from './Deal.module.css'

// ── CHANGE THIS DATE to reset the countdown ──────────────────
const DEAL_END = new Date('2026-06-08T23:59:59')
// ─────────────────────────────────────────────────────────────

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export default function Deals() {
  const [time, setTime] = useState(() => getTimeLeft(DEAL_END))

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(DEAL_END)), 1000)
    return () => clearInterval(id)
  }, [])

  const units = [
    { label: 'Days',    value: pad(time.days) },
    { label: 'Hours',   value: pad(time.hours) },
    { label: 'Minutes', value: pad(time.minutes) },
    { label: 'Seconds', value: pad(time.seconds) },
  ]

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.topLeft}>
          <span className={styles.ongoingBadge}>
            <ShoppingBagIcon size={14} /> Today's Deal
          </span>
          <h2 className={styles.title}>Yealink Flagship Smart Video Phone VP59</h2>
          <h3 className={styles.subtitle}>Get one Belkin Power Surge free</h3>

          {/* countdown */}
          <div className={styles.countdown}>
            {units.map((u, i) => (
              <>
                <div key={u.label} className={styles.unit}>
                  <span className={styles.unitLabel}>{u.label}</span>
                  <span className={styles.unitValue}>{u.value}</span>
                </div>
                {i < units.length - 1 && (
                  <span key={`sep-${i}`} className={styles.colon}>:</span>
                )}
              </>
            ))}
          </div>

          {/* actions */}
          <div className={styles.actions}>
            <button className={styles.buyBtn}>BUY NOW</button>
            <button className={styles.wishlist} aria-label="Add to wishlist">
              <Heart size={22} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
