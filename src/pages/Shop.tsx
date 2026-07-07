import styles from './Shop.module.css'
import logitechgif from '../assets/ad-banner.gif'
import maxhubImg   from '../assets/6615738024026-0 2.svg'
import { Heart, ChevronDown } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Pagination } from 'antd'
import { useState  } from 'react'
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
 const pageSize = 6

  const indexOfLastProduct = currentPage * pageSize
  const indexOfFirstProduct = indexOfLastProduct - pageSize
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)

  function toggleCat(label: string) {
    const isOpen = openCat === label
    setOpenCat(isOpen ? null : label)
    setActiveCat(isOpen ? null : label)
  }
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

       <div className={styles.container}>
   <aside className={styles.aside}>
   <div className={styles.one}>
       <h5 className={styles.head}>
    Price Filter
   </h5>
   <div className={styles.two}>
     <h5 className={styles.info}>
        Move Slider to choose the price range.
     </h5>
     <div className={styles.slider}>

     </div>
     <div className={styles.prices}>
        Price: <span> ₦ 0</span> - ₦ 16,000,000 
     </div>
     <button className={styles.button}>
        Apply
     </button>
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