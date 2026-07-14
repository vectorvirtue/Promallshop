import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './PageLoader.module.css'
import logo from '../assets/promall1crop-2@2x.png'

export default function PageLoader() {
  const [visible, setVisible] = useState(true)
  const [hidden, setHidden] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    // reset on every route change
    setVisible(true)
    setHidden(false)

    const hideTimer = setTimeout(() => setHidden(true), 1600)
    const removeTimer = setTimeout(() => setVisible(false), 2000)

    return () => {
      clearTimeout(hideTimer)
      clearTimeout(removeTimer)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div className={`${styles.overlay} ${hidden ? styles.hidden : ''}`}>
      <img src={logo} alt="Promallshop" className={styles.logo} />
      <div className={styles.track}>
        <div className={styles.bar} />
      </div>
    </div>
  )
}
