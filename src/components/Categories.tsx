import { motion, type Variants } from 'framer-motion'
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
  { img: codingRobotics,    label: 'Coding & Robotics Kits' },
  { img: computerPeripherals, label: 'Computer Peripherals' },
  { img: headsets,          label: 'Headsets' },
  { img: ipPhones,          label: 'IP Phones' },
  { img: officeEquipments,  label: 'Office Equipments' },
  { img: professionalImaging, label: 'Professional Imaging' },
  { img: screens,           label: 'Screens' },
  { img: businessTech,      label: 'Business Technology' },
  { img: videoConf,         label: 'Video Conferencing' },
  { img: videoAcc,          label: 'Video Conferencing Accessories' },
  { img: codingRobotics,    label: 'Coding & Robotics Kits' },
  { img: computerPeripherals, label: 'Computer Peripherals' },
  { img: headsets,          label: 'Headsets' },
  { img: ipPhones,          label: 'IP Phones' },
]

// split into rows of 7
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

      {/* row 1 */}
      <motion.div
        className={styles.categoryGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {row1.map((cat, i) => (
          <motion.div key={i} className={styles.category} variants={itemVariants}>
            <motion.img
              src={cat.img}
              alt={cat.label}
              className={styles.categoryImage}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            />
            <h3 className={styles.categoryTitle}>{cat.label}</h3>
          </motion.div>
        ))}
      </motion.div>

      {/* row 2 */}
      <motion.div
        className={styles.categoryGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {row2.map((cat, i) => (
          <motion.div key={i} className={styles.category} variants={itemVariants}>
            <motion.img
              src={cat.img}
              alt={cat.label}
              className={styles.categoryImage}
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            />
            <h3 className={styles.categoryTitle}>{cat.label}</h3>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
