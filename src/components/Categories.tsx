import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './Categories.module.css'

import codingRobotics    from '../assets/coding-and-robotics-kits.gif'
import computerPeripherals from '../assets/computer-peripherals.gif'
import headsets          from '../assets/headsets.gif'
import ipPhones          from '../assets/ip-phones.gif'
import officeEquipments  from '../assets/office-equipments.gif'
import professionalImaging from '../assets/professional-imaging-solutions.gif'
import screens           from '../assets/screens.gif'
import businessTech      from '../assets/business-technology-solutions.gif'
import videoConf         from '../assets/video-conferencing-solutions.gif'
import videoAcc          from '../assets/video-conferencing-accessories.gif'

const categories = [
  { img: codingRobotics,    label: 'Coding & Robotics Kits',        slug: 'coding-and-robotics-kits' },
  { img: computerPeripherals, label: 'Computer Peripherals',         slug: 'computer-peripherals' },
  { img: headsets,          label: 'Headsets',                       slug: 'headsets' },
  { img: ipPhones,          label: 'IP Phones',                      slug: 'ip-phones' },
  { img: officeEquipments,  label: 'Office Equipments',              slug: 'office-equipments' },
  { img: professionalImaging, label: 'Professional Imaging',         slug: 'professional-imaging-solutions' },
  { img: screens,           label: 'Screens',                        slug: 'screens' },
  { img: businessTech,      label: 'Business Technology',            slug: 'business-technology-solutions' },
  { img: videoConf,         label: 'Video Conferencing',             slug: 'video-conferencing-solutions' },
  { img: videoAcc,          label: 'Video Conferencing Accessories', slug: 'vc-accessories' },
]

// split into rows of 7 for desktop
const row1 = categories.slice(0, 7)
const row2 = categories.slice(7, 14)

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

const CategoryItem = ({ cat, isLast }: { cat: { img: string; label: string; slug: string }; isLast: boolean }) => (
  <motion.div
    className={`${styles.category} ${isLast ? styles.categoryLast : ''}`}
    variants={itemVariants}
  >
    <Link to={`/shop?category=${cat.slug}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
      <motion.img
        src={cat.img}
        alt={cat.label}
        className={styles.categoryImage}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      />
      <h3 className={styles.categoryTitle}>{cat.label}</h3>
    </Link>
  </motion.div>
)

export default function Categories() {
  return (
    <div className={styles.categories}>
      <motion.h2
        className={styles.header}
        initial={{ opacity: 0, y: -16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
      >
        Our Popular Categories
      </motion.h2>

      {/* desktop: two rows of 7 */}
      <div className={styles.desktopGrid}>
        <motion.div
          className={styles.categoryGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {row1.map((cat, i) => <CategoryItem key={i} cat={cat} isLast={false} />)}
        </motion.div>
        <motion.div
          className={styles.categoryGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {row2.map((cat, i) => <CategoryItem key={i} cat={cat} isLast={false} />)}
        </motion.div>
      </div>

      {/* mobile: single grid of 3 columns */}
      <motion.div
        className={styles.mobileGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {categories.map((cat, i) => (
          <CategoryItem key={i} cat={cat} isLast={i === categories.length - 1} />
        ))}
      </motion.div>
    </div>
  )
}
