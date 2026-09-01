import { useEffect, useState } from 'react'
import { motion, type Variants } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './Categories.module.css'

import codingRobotics      from '../assets/coding-and-robotics-kits.gif'
import computerPeripherals from '../assets/computer-peripherals.gif'
import headsets            from '../assets/headsets.gif'
import ipPhones            from '../assets/ip-phones.gif'
import officeEquipments    from '../assets/office-equipments.gif'
import professionalImaging from '../assets/professional-imaging-solutions.gif'
import screens             from '../assets/screens.gif'
import businessTech        from '../assets/business-technology-solutions.gif'
import videoConf           from '../assets/video-conferencing-solutions.gif'
import videoAcc            from '../assets/video-conferencing-accessories.gif'

const PROMALL_PROXY_URL =
  (import.meta.env.VITE_PROMALL_PROXY_URL as string) ||
  'http://127.0.0.1:8001/proxy'

type GifTile = {
  id: number
  title: string
  media_file: string
  link: string
  display_order: number
}

const staticCategories = [
  { img: codingRobotics,      label: 'Coding & Robotics Kits',        slug: 'coding-and-robotics-kits' },
  { img: computerPeripherals, label: 'Computer Peripherals',           slug: 'computer-peripherals' },
  { img: headsets,            label: 'Headsets',                       slug: 'headsets' },
  { img: ipPhones,            label: 'IP Phones',                      slug: 'ip-phones' },
  { img: officeEquipments,    label: 'Office Equipments',              slug: 'office-equipments' },
  { img: professionalImaging, label: 'Professional Imaging',           slug: 'professional-imaging-solutions' },
  { img: screens,             label: 'Screens',                        slug: 'screens' },
  { img: businessTech,        label: 'Business Technology',            slug: 'business-technology-solutions' },
  { img: videoConf,           label: 'Video Conferencing',             slug: 'video-conferencing-solutions' },
  { img: videoAcc,            label: 'Video Conferencing Accessories', slug: 'vc-accessories' },
]

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

// A plain category tile — links to the shop filtered by slug
const StaticCategoryItem = ({ cat }: { cat: typeof staticCategories[number] }) => (
  <motion.div className={styles.category} variants={itemVariants}>
    <Link
      to={`/shop?category=${cat.slug}`}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
    >
      <motion.img
        src={cat.img}
        // alt="" because the <h3> below already provides the accessible label
        alt=""
        className={styles.categoryImage}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      />
      <h3 className={styles.categoryTitle}>{cat.label}</h3>
    </Link>
  </motion.div>
)

// A backend GIF tile — optionally links to gif.link; same visual as StaticCategoryItem
const GifCategoryItem = ({ gif }: { gif: GifTile }) => {
  const inner = (
    <>
      <motion.img
        src={gif.media_file}
        alt=""
        className={styles.categoryImage}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      />
      <h3 className={styles.categoryTitle}>{gif.title}</h3>
    </>
  )

  return (
    <motion.div className={styles.category} variants={itemVariants}>
      {gif.link ? (
        <a
          href={gif.link}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
        >
          {inner}
        </a>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {inner}
        </div>
      )}
    </motion.div>
  )
}

export default function Categories() {
  const [gifTiles, setGifTiles] = useState<GifTile[]>([])

  useEffect(() => {
    const url = import.meta.env.DEV
      ? '/vite-proxy/combined/promallshop/'
      : `${PROMALL_PROXY_URL}/combined/promallshop/`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.gifs)) {
          const sorted = [...data.gifs].sort(
            (a: GifTile, b: GifTile) => (a.display_order ?? 0) - (b.display_order ?? 0)
          )
          setGifTiles(sorted)
        }
      })
      .catch(() => {
        // silently ignore — category tiles still render without backend GIFs
      })
  }, [])

  // All tiles: static categories first, then backend GIF tiles appended
  const allTiles = [
    ...staticCategories.map((cat) => ({ type: 'static' as const, cat })),
    ...gifTiles.map((gif) => ({ type: 'gif' as const, gif })),
  ]

  // Desktop: split into rows of 7
  const row1 = allTiles.slice(0, 7)
  const row2 = allTiles.slice(7)

  const renderTile = (item: typeof allTiles[number], i: number) =>
    item.type === 'static'
      ? <StaticCategoryItem key={`s-${i}`} cat={item.cat} />
      : <GifCategoryItem key={`g-${item.gif.id}`} gif={item.gif} />

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

      {/* desktop: rows of 7 */}
      <div className={styles.desktopGrid}>
        <motion.div
          className={styles.categoryGrid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {row1.map((item, i) => renderTile(item, i))}
        </motion.div>

        {row2.length > 0 && (
          <motion.div
            className={styles.categoryGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {row2.map((item, i) => renderTile(item, i + 7))}
          </motion.div>
        )}
      </div>

      {/* mobile: single 3-column grid */}
      <motion.div
        className={styles.mobileGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {allTiles.map((item, i) => renderTile(item, i))}
      </motion.div>
    </div>
  )
}
