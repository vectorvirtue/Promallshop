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

type CategoryGif = {
  id: number
  category_id: number
  category_name: string
  gif_url: string
  is_active: boolean
}

interface CategoryTile {
  img: string
  fallbackImg?: string
  label: string
  slug: string
}

const staticCategories: CategoryTile[] = [
  { img: codingRobotics,      label: 'Coding & Robotics Kits',        slug: 'coding-and-robotics-kits' },
  { img: computerPeripherals, label: 'Computer Peripherals',           slug: 'computer-peripherals' },
  { img: headsets,            label: 'Headsets',                       slug: 'headsets' },
  { img: ipPhones,            label: 'IP Phones',                      slug: 'ip-phones' },
  { img: officeEquipments,    label: 'Office Equipments',              slug: 'office-equipments' },
  { img: professionalImaging, label: 'Professional Imaging',           slug: 'professional-imaging-solutions' },
  { img: screens,             label: 'Screens',                        slug: 'screens' },
  { img: businessTech,        label: 'Business Technology',            slug: 'business-technology-solutions' },
  { img: videoConf,           label: 'Video Conferencing Solutions',   slug: 'video-conferencing-solutions' },
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
const StaticCategoryItem = ({ cat }: { cat: CategoryTile }) => {
  const [image, setImage] = useState(cat.img)

  useEffect(() => {
    setImage(cat.img)
  }, [cat.img])

  return (
    <motion.div className={styles.category} variants={itemVariants}>
      <Link
        to={`/shop/${cat.slug}`}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
      >
        <motion.img
          src={image}
          onError={() => {
            if (cat.fallbackImg && image !== cat.fallbackImg) {
              setImage(cat.fallbackImg)
            }
          }}
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
}

const categorySlug = (name: string) => name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')

const addCacheBuster = (url: string, timestamp: number) => {
  const [urlWithoutHash, hash] = url.split('#', 2)
  const [base, query] = urlWithoutHash.split('?', 2)
  const params = new URLSearchParams(query)
  params.set('v', String(timestamp))
  return `${base}?${params.toString()}${hash ? `#${hash}` : ''}`
}

export default function Categories() {
  const [categoryGifs, setCategoryGifs] = useState<CategoryGif[]>([])

  useEffect(() => {
    const url = import.meta.env.DEV
      ? '/vite-proxy/combined/promallshop/'
      : `${PROMALL_PROXY_URL}/combined/promallshop/`

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success' && Array.isArray(data.category_gifs)) {
          const timestamp = Date.now()
          setCategoryGifs(
            data.category_gifs
              .filter((gif: CategoryGif) => gif.is_active && gif.gif_url)
              .map((gif: CategoryGif) => ({
                ...gif,
                gif_url: addCacheBuster(gif.gif_url, timestamp),
              }))
          )
        }
      })
      .catch(() => {
        // silently ignore — category tiles still render without backend GIFs
      })
  }, [])

  const gifsBySlug = new Map(categoryGifs.map((gif) => [categorySlug(gif.category_name), gif]))
  const staticSlugs = new Set(staticCategories.map((category) => category.slug))

  const allTiles = [
    ...staticCategories.map((cat) => ({
      cat: {
        ...cat,
        fallbackImg: cat.img,
        img: gifsBySlug.get(cat.slug)?.gif_url || cat.img,
      },
    })),
    ...categoryGifs
      .filter((gif) => !staticSlugs.has(categorySlug(gif.category_name)))
      .map((gif) => ({
        cat: {
          img: gif.gif_url,
          label: gif.category_name,
          slug: categorySlug(gif.category_name),
        },
      })),
  ]

  // Desktop: split into rows of 7
  const row1 = allTiles.slice(0, 7)
  const row2 = allTiles.slice(7)

  const renderTile = (item: typeof allTiles[number]) =>
    <StaticCategoryItem key={item.cat.slug} cat={item.cat} />

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
          {row1.map(renderTile)}
        </motion.div>

        {row2.length > 0 && (
          <motion.div
            className={styles.categoryGrid}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {row2.map(renderTile)}
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
        {allTiles.map(renderTile)}
      </motion.div>
    </div>
  )
}
