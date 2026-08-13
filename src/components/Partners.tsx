import styles from './Partners.module.css'
import { motion } from 'framer-motion'

import hikvision  from '../assets/Hikvision.svg'
import huawei     from '../assets/huawei_logo.png'
import canon      from '../assets/canon.png'
import dahua      from '../assets/dahua.png'
import logitech   from '../assets/Logitech.jpg'
import makeblock  from '../assets/makeblock.png'
import maxhub     from '../assets/maxhub.jpg'
import polycom    from '../assets/polycom.jpg'
import samsung    from '../assets/samsung.png'
import unilumin   from '../assets/UNILUMIN.svg'
import vt         from '../assets/vt.webp'
import yealink    from '../assets/yealink.png'

const partners = [
  { name: 'Hikvision',  logo: hikvision },
  { name: 'Huawei',     logo: huawei },
  { name: 'Canon',      logo: canon },
  { name: 'Dahua',      logo: dahua },
  { name: 'Logitech',   logo: logitech },
  { name: 'Makeblock',  logo: makeblock },
  { name: 'Maxhub',     logo: maxhub },
  { name: 'Polycom',    logo: polycom },
  { name: 'Samsung',    logo: samsung },
  { name: 'Unilumin',   logo: unilumin },
  { name: 'VT',         logo: vt },
  { name: 'Yealink',    logo: yealink },
]

// duplicate for seamless infinite loop
const track = [...partners, ...partners]

export default function Partners() {
  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2 
        className={styles.title}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Brand Partners
      </motion.h2>

      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeTrack}>
          {track.map((p, i) => (
            <div key={i} className={styles.logoWrap}>
              <img src={p.logo} alt={p.name} className={styles.logo} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
