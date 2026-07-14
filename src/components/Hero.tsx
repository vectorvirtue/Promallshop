import { useState, useEffect } from "react";
import styles from "./Hero.module.css";
import { useNavigate } from "react-router-dom";
import slider1 from "../assets/Sliders (1).svg";
import slider2 from "../assets/Sliders.svg";
import { productsApi } from "../lib/api";

const IMAGE_BASE = (import.meta.env.VITE_IMAGE_BASE_URL as string) || ''

function getImageUrl(path: string) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${IMAGE_BASE}/${path.replace(/^\/+/, '')}`
}

interface ApiProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
  discount: number
}

interface ApiCategory {
  category_name: string
  products: ApiProduct[]
}

const sliderContent = [
  {
    contentpicture: slider1,
    subtitle: "Bonanza Sale",
    span: "15% OFF",
    title: "Shop Complete Yealink Androids and Windows for Your Meetings",
  },
  {
    contentpicture: slider2,
    subtitle: "Bonanza Sale",
    span: "15% OFF",
    title: "Shop Quality Keyboards on Promallshop",
  },
  {
    contentpicture: slider2,
    subtitle: "Bonanza Sale",
    span: "15% OFF",
    title: "Shop Maxhub Interactive Displays on Promallshop",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [weeklyDeals, setWeeklyDeals] = useState<ApiProduct[]>([]);
  const navigate = useNavigate();
  const goToPage = () => navigate("/shop");

  /* fetch 1 product each from Robotics, Screens, and Video Conferencing */
  useEffect(() => {
    productsApi.getAll()
      .then((res: unknown) => {
        const r = res as { success: boolean; data: ApiCategory[] }
        const cats = Array.isArray(r.data) ? r.data : []

        const pick = (keywords: string[]) => {
          const cat = cats.find(c =>
            keywords.some(kw => c.category_name.toLowerCase().includes(kw))
          )
          return cat?.products[0] ?? null
        }

        const deals = [
          pick(['robotics', 'coding']),
          pick(['screen', 'display', 'signage']),
          pick(['video conferencing', 'video conf']),
        ].filter(Boolean) as ApiProduct[]

        // fill up to 3 from any category if some weren't found
        if (deals.length < 3) {
          const all = cats.flatMap(c => c.products)
          const ids = new Set(deals.map(p => p.id))
          for (const p of all) {
            if (deals.length >= 3) break
            if (!ids.has(p.id)) { deals.push(p); ids.add(p.id) }
          }
        }

        setWeeklyDeals(deals.slice(0, 3))
      })
      .catch(() => {})
  }, [])

  /* slider auto-advance */
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % sliderContent.length);
        setVisible(true);
      }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const slide = sliderContent[current];

  const formatPrice = (p: ApiProduct) => {
    const n = Number(p.end_user_price || p.price)
    return n === 0 ? 'Price on request' : `₦ ${n.toLocaleString('en-NG')}`
  }

  return (
    <div className={styles.hero}>

      {/* ── left: slider card ── */}
      <div className={`${styles.sliderCard} ${visible ? styles.fadeIn : styles.fadeOut}`}>
        <img src={slide.contentpicture} alt={slide.title} className={styles.slideImage} />
        <div className={styles.textBlock}>
          <h2 className={styles.subtitle}>
            {slide.subtitle}{" "}
            <span style={{ fontWeight: "800" }}>{slide.span}</span>
          </h2>
          <h1 className={styles.title}>{slide.title}</h1>
          <button onClick={goToPage} className={styles.button}>Shop Now</button>
        </div>
      </div>

      {/* ── right: weekly deals panel ── */}
      <div className={styles.dealsPanel}>
        <p className={styles.dealsLabel}>Weekly sales deals</p>
        <h2 className={styles.dealsTitle}>Save UP to 20%</h2>
        <p className={styles.dealsSubtext}>
          Explore many variations of your favorite products.{" "}
          <a href="/shop">SHOP MORE</a>
        </p>

        <hr className={styles.dealsDivider} />

        {weeklyDeals.length === 0
          ? /* skeleton while loading */
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.dealItem}>
                <div style={{ width: 64, height: 64, borderRadius: 8, background: '#f0f0f0', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 10, borderRadius: 4, background: '#f0f0f0', width: '80%' }} />
                  <div style={{ height: 10, borderRadius: 4, background: '#f0f0f0', width: '50%' }} />
                </div>
              </div>
            ))
          : weeklyDeals.map((deal) => (
              <div key={deal.id} className={styles.dealItem}>
                <img
                  src={getImageUrl(deal.image)}
                  alt={deal.name}
                  className={styles.dealImage}
                />
                <div className={styles.dealInfo}>
                  <p className={styles.dealName}>{deal.name}</p>
                  <p className={styles.dealPrice}>{formatPrice(deal)}</p>
                  {deal.discount > 0 && (
                    <p className={styles.dealOldPrice}>{deal.discount}% OFF</p>
                  )}
                  <p className={styles.dealStars}>★★★★★</p>
                </div>
              </div>
            ))
        }
      </div>

    </div>
  );
}
