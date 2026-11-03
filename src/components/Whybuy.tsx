import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuoteForm } from '../context/QuoteFormContext'
import { promallCombinedApi, type PromallCombinedResponse, type PromallSection1 } from '../lib/api'
import styles from './Whybuy.module.css'

const reasons = [
  {
    title: 'A Wide Range of Technology Products',
    text: 'Discover IT equipment and computer accessories across multiple categories, helping you source products for offices, classrooms, meeting rooms and personal workspaces.',
  },
  {
    title: 'Solutions for Businesses and Individuals',
    text: 'Whether you are an individual buyer, a small business, a large organisation, an educational institution or an IT reseller, explore products suited to your purchasing requirements.',
  },
  {
    title: 'Technology from Recognised Brands',
    text: 'Compare available products from established technology manufacturers and review their specifications before making a purchase.',
  },
  {
    title: 'Convenient Technology Procurement',
    text: 'Find products across different technology categories in one place. For business and institutional requirements, contact our team to discuss quantities, product specifications and quotation requests.',
  },
  {
    title: 'Serving Customers Across Nigeria',
    text: 'Promallshop supports technology purchasing for customers in Nigeria. Check product listings and confirm delivery coverage, payment options, stock availability and applicable terms before ordering.',
  },
]

export function FirstOrderOffer() {
  const [offer, setOffer] = useState<PromallSection1 | null>(null)

  useEffect(() => {
    let cancelled = false

    promallCombinedApi.getAll<PromallCombinedResponse>()
      .then((response) => {
        const section = response.promallsection1
        if (!section || ![section.title, section.subtitle, section.description]
          .every(value => typeof value === 'string' && value.trim())) return

        if (!cancelled) setOffer(section)
      })
      .catch((cause: unknown) => {
        console.error('Failed to load first-order promotion:', cause)
      })

    return () => { cancelled = true }
  }, [])

  if (!offer) return null

  const paragraphs = offer.description.split(/\r?\n\s*\r?\n/).map(text => text.trim()).filter(Boolean)
  let offerLink: string | undefined
  if (typeof offer.link === 'string' && offer.link.trim()) {
    try {
      const url = new URL(offer.link, window.location.origin)
      if (['http:', 'https:'].includes(url.protocol)) offerLink = url.href
    } catch {
      // Optional links must not prevent the promotion text from rendering.
    }
  }

  return (
    <section className={styles.offer} aria-labelledby="first-order-title">
      <div className={styles.offerCopy}>
        <p className={styles.eyebrow}>{offer.title}</p>
        <h2 id="first-order-title">{offer.subtitle}</h2>
        {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>
      {offerLink && (
        <Link className={styles.primaryLink} to={offerLink}>Shop Now <span aria-hidden="true">&rarr;</span></Link>
      )}
    </section>
  )
}

export default function Whybuy() {
  const { openQuoteForm } = useQuoteForm()

  return (
    <div className={styles.container}>
      <section className={styles.reasons} aria-labelledby="why-promallshop-title">
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Discover. Compare. Quote. Procure. Deploy.</p>
          <h2 id="why-promallshop-title">Why Choose Promallshop for IT Equipment in Nigeria?</h2>
        </div>
        <ol className={styles.reasonsList}>
          {reasons.map((reason, index) => (
            <li key={reason.title} className={styles.reason}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.procurement} aria-labelledby="business-equipment-title">
        <div className={styles.procurementCopy}>
          <p className={styles.procurementEyebrow}>For businesses and organisations</p>
          <h2 id="business-equipment-title">Buy IT Equipment for Your Business or Organisation</h2>
          <p>
            Looking for technology products for an office upgrade, a school project, a new
            meeting room or a business procurement requirement? Promallshop helps you discover
            available IT products, compare specifications and identify equipment suited to your needs.
          </p>
          <p>
            For larger orders or specialised technology requirements, contact our team with
            your preferred brands, product categories, quantities and intended application to request a quotation.
          </p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.primaryLink} to="/shop">Explore Products <span aria-hidden="true">&rarr;</span></Link>
          <button className={styles.secondaryButton} type="button" onClick={() => openQuoteForm()}>Request a Quote</button>
          <Link className={styles.contactLink} to="/contact">Contact Our Team <span aria-hidden="true">&rarr;</span></Link>
        </div>
      </section>
    </div>
  )
}
