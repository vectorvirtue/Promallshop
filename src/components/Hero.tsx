import { useState, useEffect } from "react";
import styles from "./Hero.module.css";
import { useNavigate } from "react-router-dom";
import slider1 from "../assets/Sliders (1).svg";
import slider2 from "../assets/Sliders.svg";
import dealImg1 from "../assets/64a5ac358868e-01 1.svg";
import dealImg2 from "../assets/Sharp-AR-7024-7024D.svg";
import dealImg3 from "../assets/65bd1f891f37c-0 1.svg";

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

const weeklyDeals = [
  {
    img: dealImg1,
    name: "MAXHUB 575FA - 75 Inches",
    price: "₦ 5,200,000",
    oldPrice: "₦ 5,200,000",
    stars: "★★★★★",
  },
  {
    img: dealImg2,
    name: "SHARP AR-7024 Printer",
    price: "₦ 770,000",
    oldPrice: "₦ 885,500",
    stars: "★★★★☆",
  },
  {
    img: dealImg3,
    name: "Photon Artificial Intelligence Kit",
    price: "₦ 1,236,750",
    oldPrice: "₦ 1,459,365",
    stars: "★★★★★",
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
const goToPage = () => navigate("/shop");
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

  return (
    <div className={styles.hero}>

      {/* ── left: slider card with text overlaid on image ── */}
      <div className={`${styles.sliderCard} ${visible ? styles.fadeIn : styles.fadeOut}`}>
        {/* full-bleed slide image */}
        <img
          src={slide.contentpicture}
          alt={slide.title}
          className={styles.slideImage}
        />

        {/* text overlay */}
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

        {weeklyDeals.map((deal, i) => (
          <div key={i} className={styles.dealItem}>
            <img src={deal.img} alt={deal.name} className={styles.dealImage} />
            <div className={styles.dealInfo}>
              <p className={styles.dealName}>{deal.name}</p>
              <p className={styles.dealPrice}>{deal.price}</p>
              <p className={styles.dealOldPrice}>{deal.oldPrice}</p>
              <p className={styles.dealStars}>{deal.stars}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
