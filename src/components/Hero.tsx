import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./Hero.module.css";
import { useNavigate } from "react-router-dom";
import slider1 from "../assets/Sliders (1).svg";
import slider2 from "../assets/Sliders.svg";
import {
  productsApi,
  getImageUrl,
  promallBannerApi,
  type PromallBanner,
} from "../lib/api";
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
  const [promallBanners, setPromallBanners] = useState<PromallBanner[]>([]);
  const navigate = useNavigate();
  const goToPage = () => navigate("/shop");

  /* fetch banners assigned to Promallshop from Django */
  useEffect(() => {
    promallBannerApi.getAll()
      .then((res) => {
        const banners = Array.isArray(res.banners) ? res.banners : [];
        setPromallBanners(banners);
        setCurrent(0);
      })
      .catch((error) => {
        console.error("❌ Failed to load Promallshop banners:", error);
        setPromallBanners([]);
      });
  }, []);

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
    const slideCount = promallBanners.length > 0
      ? promallBanners.length
      : sliderContent.length;
    if (slideCount <= 1) return;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slideCount);
        setVisible(true);
      }, 600);
    }, 4000);
    return () => clearInterval(interval);
  }, [promallBanners.length]);

  const djangoBanner = promallBanners[current];
  const fallbackSlide = sliderContent[current % sliderContent.length];

  const formatPrice = (p: ApiProduct) => {
    const n = Number(p.end_user_price || p.price)
    return n === 0 ? 'Price on request' : `₦ ${n.toLocaleString('en-NG')}`
  }

  return (
    <div className={styles.hero}>

      {/* ── left: slider card ── */}
      <div className={`${styles.sliderCard} ${visible ? styles.fadeIn : styles.fadeOut}`}>
        {djangoBanner ? (
          <>
            <img
              src={djangoBanner.image}
              alt={djangoBanner.title}
              className={styles.slideImage}
            />
            <motion.div
              className={styles.textBlock}
              key={djangoBanner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {djangoBanner.title && (
                <h2 className={styles.subtitle}>
                  {djangoBanner.title}
                </h2>
              )}
              {djangoBanner.text && (
                <h1 className={styles.title}>
                  {djangoBanner.text}
                </h1>
              )}
              {djangoBanner.link && (
                <motion.a
                  href={djangoBanner.link}
                  className={styles.button}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                >
                  Shop Now
                </motion.a>
              )}
            </motion.div>
          </>
        ) : (
          <>
            <img src={fallbackSlide.contentpicture} alt={fallbackSlide.title} className={styles.slideImage} />
            <motion.div 
              className={styles.textBlock}
              key={current}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className={styles.subtitle}>
                {fallbackSlide.subtitle}{" "}
                <span style={{ fontWeight: "800" }}>{fallbackSlide.span}</span>
              </h2>
              <h1 className={styles.title}>
                {fallbackSlide.title}
              </h1>
              <motion.button 
                onClick={goToPage} 
                className={styles.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Shop Now
              </motion.button>
            </motion.div>
          </>
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
