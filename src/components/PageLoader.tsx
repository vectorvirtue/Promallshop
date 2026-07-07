import { useEffect, useState } from 'react'
import styles from './PageLoader.module.css'
import logo from '../assets/promall1crop-2@2x.png'

export default function PageLoader() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    // hide after the bar animation completes (1.4s) + a tiny buffer
    const timer = setTimeout(() => setHidden(true), 1600)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`${styles.overlay} ${hidden ? styles.hidden : ''}`}>
      <img src={logo} alt="Promallshop" className={styles.logo} />
      <div className={styles.track}>
        <div className={styles.bar} />
      </div>
    </div>
  )
}
