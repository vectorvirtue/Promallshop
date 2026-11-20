import { Link } from 'react-router-dom'
import { getImageUrl, type PartnerCatalog } from '../lib/api'
import { partnerPath } from '../lib/links'
import styles from './Partners.module.css'

export default function Partners({ partners }: { partners: PartnerCatalog }) {
  const logos = partners.status === 'ready'
    ? partners.brands.flatMap(brand => {
        if (typeof brand.image !== 'string' || !brand.image.trim()) return []

        return [{ slug: brand.slug, name: brand.title?.trim() || brand.slug, src: getImageUrl(brand.image) }]
      })
    : []
  const hasMarquee = logos.length > 1

  return (
    <section className={styles.container} aria-labelledby="technology-brands-title">
      <h2 className={styles.title} id="technology-brands-title">Brand Partners</h2>

      {partners.status === 'loading' && <p role="status">Loading brand partners…</p>}
      {partners.status === 'error' && <p role="status">Brand partners could not be loaded.</p>}
      {partners.status === 'ready' && logos.length === 0 && <p>No brand partners are available right now.</p>}

      {logos.length > 0 && (
        <div className={`${styles.marqueeWrapper} ${hasMarquee ? styles.animated : ''}`}>
          <div className={styles.marqueeTrack}>
            {(hasMarquee ? [false, true] : [false]).map(duplicate => (
              <div
                key={duplicate ? 'duplicate' : 'original'}
                className={`${styles.logoGroup} ${duplicate ? styles.duplicate : ''}`}
                aria-hidden={duplicate || undefined}
              >
                {logos.map(logo => (
                  <Link
                    key={logo.slug}
                    to={partnerPath(logo.slug)}
                    className={styles.logoLink}
                    aria-label={`View ${logo.name} details`}
                    tabIndex={duplicate ? -1 : undefined}
                  >
                    <img src={logo.src} alt={logo.name} className={styles.logo} loading="lazy" />
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
