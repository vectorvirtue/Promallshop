import { Link } from 'react-router-dom'
import styles from './Footer.module.css'
import logo from '../assets/Promall1crop 2.svg'

const usefulLinks = [
  {
    link: 'About Us',
    path: '/about-us'
  },
  {
    link: 'Contact Us',
    path: '/contact'
  },
  {
    link: 'Terms Of Use',
    path: '/terms-of-use'
  },
  {
    link: 'Privacy Policy',
    path: '/privacy-policy'
  },
  {
    link: 'FAQs',
    path: '/faqs'
  },
  {
    link: 'Track My Order',
    path: '/track-order'
  }
]

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        {/* ── col 1: brand ── */}
        <div className={styles.brand}>
          <img src={logo} alt="Promallshop" className={styles.logo} />
          <p className={styles.brandText}>
            Promallshop is an e-commerce platform dealing in IT Solutions such
            as Video Conferencing, Keyboards, Mouse, Headsets and so many
            others for your everyday use.
          </p>
        </div>

        {/* ── col 2: useful links ── */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Useful Links</h3>
          <ul className={styles.linkList}>
            {usefulLinks.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className={styles.link}>
                  {l.link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── col 3: contact ── */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Contact Us</h3>
          <ul className={styles.contactList}>
            <li>
              <span className={styles.contactLabel}>Address:</span> 5B Adedeji
              Close, Opebi Ikeja, Lagos.
            </li>
            <li>
              <span className={styles.contactLabel}>Phone:</span> +234 703 264 7755
            </li>
            <li>
              <span className={styles.contactLabel}>Email:</span>{' '}
              <a href="mailto:sales@promallshop.com" className={styles.link}>
                sales@promallshop.com
              </a>
            </li>
          </ul>
        </div>

        {/* ── col 4: socials ── */}
        <div className={styles.col}>
          <h3 className={styles.colTitle}>Socials</h3>
          <ul className={styles.socialList}>
            <li>
              <a 
                href="https://www.instagram.com/promallshop_ng" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.socialLink}
              >
                {/* Instagram Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
                </svg>
                Instagram
              </a>
            </li>
            <li>
              <a 
                href="https://web.facebook.com/Promallshop/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.socialLink}
              >
                {/* Facebook Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
                Facebook
              </a>
            </li>
            <li>
              <a 
                href="https://wa.me/2347044016336" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={styles.socialLink}
              >
                {/* WhatsApp Icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7
                    8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8
                    8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* bottom bar */}
      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Promallshop. All rights reserved.</p>
      </div>
    </footer>
  )
}