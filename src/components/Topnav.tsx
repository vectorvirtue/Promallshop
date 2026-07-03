import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './Topnav.module.css'

const countries = [
  {
    value: 'nigeria',
    label: 'Nigeria',
    flag: (
      <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <rect width="7"  height="14" fill="#008751" />
        <rect x="7" width="6"  height="14" fill="#fff" />
        <rect x="13" width="7" height="14" fill="#008751" />
      </svg>
    ),
  },
  {
    value: 'ghana',
    label: 'Ghana',
    flag: (
      <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="5"  fill="#006B3F" />
        <rect y="5" width="20" height="4" fill="#FCD116" />
        <rect y="9" width="20" height="5" fill="#CE1126" />
        <polygon points="10,4 11.5,8.5 7,6 13,6 8.5,8.5" fill="#000" />
      </svg>
    ),
  },
  {
    value: 'kenya',
    label: 'Kenya',
    flag: (
      /* Kenya: black / red / green horizontal stripes, white edges on red, Maasai shield */
      <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <rect width="20" height="14" fill="#006600" />
        <rect y="3.5" width="20" height="7" fill="#000" />
        <rect y="4.5" width="20" height="5" fill="#BB0000" />
        <rect y="4.5" width="20" height="0.8" fill="#fff" />
        <rect y="8.7" width="20" height="0.8" fill="#fff" />
        {/* simplified Maasai shield */}
        <ellipse cx="10" cy="7" rx="2" ry="3.5" fill="#fff" />
        <ellipse cx="10" cy="7" rx="1.2" ry="2.8" fill="#BB0000" />
        <rect x="9.6" y="3.5" width="0.8" height="7" fill="#000" />
        <rect x="8" y="6.6" width="4" height="0.8" fill="#000" />
      </svg>
    ),
  },
  {
    value: 'cotedivoire',
    label: "Côte d'Ivoire",
    flag: (
      /* Côte d'Ivoire: orange / white / green vertical stripes */
      <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <rect width="7"  height="14" fill="#F77F00" />
        <rect x="7" width="6"  height="14" fill="#fff" />
        <rect x="13" width="7" height="14" fill="#009A44" />
      </svg>
    ),
  },
]

export default function Topnav() {
  const [selected, setSelected] = useState(countries[0])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className={styles.nav}>
      <a className={styles.phone} href="tel:+2347032647755">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true">
          <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.364 1.213z" />
        </svg>
        +2347032647755
      </a>
      {/* WhatsApp icon */}
      <a href="https://wa.me/2347044016336" target="_blank" rel="noopener noreferrer" className={styles.waIcon}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" aria-label="WhatsApp">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>   
      </a>

      <div className={styles.frame}>
        Bonanza sale for all stock and free express delivery on most items - OFF 15%
        <a href="" className={styles.shopNow}>SHOP NOW</a>
      </div>

      {/* custom country dropdown */}
      <div className={styles.dropdownWrapper} ref={ref}>
        <button
          className={styles.dropdownTrigger}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className={styles.flagWrap}>{selected.flag}</span>
          <span>{selected.label}</span>
          <svg
            className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
            width="12" height="12" viewBox="0 0 12 12" fill="none"
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <AnimatePresence>
          {open && (
            <motion.ul
              className={styles.dropdownMenu}
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {countries.map((c) => (
                <li
                  key={c.value}
                  role="option"
                  aria-selected={c.value === selected.value}
                  className={`${styles.dropdownItem} ${c.value === selected.value ? styles.dropdownItemActive : ''}`}
                  onClick={() => { setSelected(c); setOpen(false) }}
                >
                  <span className={styles.flagWrap}>{c.flag}</span>
                  <span>{c.label}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
