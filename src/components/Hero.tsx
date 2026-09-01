import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./Hero.module.css";
import { useNavigate } from "react-router-dom";
import { productsApi, getImageUrl, promallBannerApi } from "../lib/api";
import type { PromallBanner } from "../lib/api";
import { Link } from "react-router-dom";

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

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [weeklyDeals, setWeeklyDeals] = useState<ApiProduct[]>([]);
  const [banners, setBanners] = useState<PromallBanner[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const navigate = useNavigate();
  const goToPage = () => navigate("/shop");

  /* ── fetch Django banners ── */
  useEffect(() => {
    promallBannerApi
      .getAll()
      .then((res) => {
        const received = Array.isArray(res.banners)
          ? [...res.banners].sort(
              (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0)
            )
          : [];
        setBanners(received);
        setCurrent(0);
      })
      .catch(() => {
        setBanners([]);
      })
      .finally(() => {
        setBannersLoading(false);
      });
  }, []);

  /* ── fetch weekly deal products ── */
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

  /* ── slider auto-advance (only when Django banners are loaded) ── */
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % banners.length);
        setVisible(true);
      }, 600);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const formatPrice = (p: ApiProduct) => {
    const n = Number(p.end_user_price || p.price)
    return n === 0 ? 'Price on request' : `₦ ${n.toLocaleString('en-NG')}`
  }

  const currentBanner = banners[current];

  /* ── slider card background ── */
  const sliderStyle = bannersLoading
    ? { background: '#1a1a2e' }
    : currentBanner
      ? { backgroundImage: `url(${currentBanner.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { background: '#1a1a2e' }; // no banners — plain dark card

  return (
    <div className={styles.hero}>

      {/* ── left: slider card ── */}
      <div
        className={`${styles.sliderCard} ${visible ? styles.fadeIn : styles.fadeOut}`}
        style={sliderStyle}
      >
        {bannersLoading ? (
          /* skeleton while fetching */
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '40%', height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.1)' }} />
          </div>
        ) : currentBanner ? (
          /* Django banner content */
          <motion.div
            className={styles.textBlock}
            key={currentBanner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {currentBanner.title && (
              <h2 className={styles.subtitle}>{currentBanner.title}</h2>
            )}
            {currentBanner.text && (
              <h1 className={styles.title}>{currentBanner.text}</h1>
            )}
            {currentBanner.link ? (
              <a href={currentBanner.link} className={styles.button}>
                Shop Now
              </a>
            ) : (
              <motion.button
                onClick={goToPage}
                className={styles.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </motion.button>
            )}
          </motion.div>
        ) : null /* no banners — render nothing */}

        {/* dot indicators — only when multiple banners */}
        {!bannersLoading && banners.length > 1 && (
          <div style={{ position: 'absolute', bottom: '1em', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.4em', zIndex: 2 }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  border: 'none',
                  background: i === current ? '#F18E1A' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.3s ease',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── right: weekly deals panel ── */}
      <motion.div
        className={styles.dealsPanel}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className={styles.dealsLabel}>Weekly sales deals</p>
        <h2 className={styles.dealsTitle}>Save UP to 20%</h2>
        <p className={styles.dealsSubtext}>
          Explore many variations of your favorite products.{" "}
          <a href="/shop">SHOP MORE</a>
        </p>

        <hr className={styles.dealsDivider} />

        {weeklyDeals.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.dealItem}>
                <div style={{ width: 64, height: 64, borderRadius: 8, background: '#f0f0f0', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 10, borderRadius: 4, background: '#f0f0f0', width: '80%' }} />
                  <div style={{ height: 10, borderRadius: 4, background: '#f0f0f0', width: '50%' }} />
                </div>
              </div>
            ))
          : weeklyDeals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
              >
                <Link to={`/product/${deal.id}`} className={styles.dealItem} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                </Link>
              </motion.div>
            ))
        }
      </motion.div>

    </div>
  );
}
