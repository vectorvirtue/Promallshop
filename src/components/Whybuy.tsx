import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuoteForm } from '../context/QuoteFormContext'
import {
  promallCombinedApi,
  type PromallCombinedResponse,
  type PromallSection1,
  type PromallSection3,
} from '../lib/api'
import styles from './Whybuy.module.css'

function splitParagraphs(text: string): string[] {
  return text.split(/\r?\n\s*\r?\n/).map(paragraph => paragraph.trim()).filter(Boolean)
}

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

  const paragraphs = splitParagraphs(offer.description)
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
  const [content, setContent] = useState<PromallSection3 | null>(null)

  useEffect(() => {
    let cancelled = false

    promallCombinedApi.getAll<PromallCombinedResponse>()
      .then((response) => {
        const section = response.promallsection3
        if (!section || ![section.title, section.subtitle]
          .every(value => typeof value === 'string' && value.trim())) return

        const subsections = Array.isArray(section.subsections)
          ? section.subsections
              .filter(item => item && typeof item.title === 'string' && item.title.trim()
                && typeof item.description === 'string' && item.description.trim())
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          : []

        if (!cancelled) setContent({ ...section, subsections })
      })
      .catch((cause: unknown) => {
        console.error('Failed to load reasons to choose Promallshop:', cause)
      })

    return () => { cancelled = true }
  }, [])

  return (
    <div className={styles.container}>
      {content && (
        <section className={styles.reasons} aria-labelledby="why-promallshop-title">
          <div className={styles.heading}>
            <p className={styles.eyebrow}>{content.title}</p>
            <h2 id="why-promallshop-title">{content.subtitle}</h2>
          </div>
          {content.subsections.length > 0 && (
            <ol className={styles.reasonsList}>
              {content.subsections.map((reason, index) => (
                <li key={reason.id} className={styles.reason}>
                  <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div className={styles.reasonCopy}>
                    <h3>{reason.title}</h3>
                    {splitParagraphs(reason.description).map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

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
