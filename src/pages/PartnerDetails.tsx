import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useParams } from 'react-router-dom'
import { getImageUrl, partnerBrandsApi, type PartnerBrand } from '../lib/api'
import { partnerPath } from '../lib/links'
import styles from './PartnerDetails.module.css'

type PartnerResult =
  | { slug: string; status: 'ready'; brand: PartnerBrand }
  | { slug: string; status: 'missing' | 'error' }

export default function PartnerDetails() {
  const { slug } = useParams<{ slug: string }>()
  const [result, setResult] = useState<PartnerResult | null>(null)
  const currentResult = result?.slug === slug ? result : null

  useEffect(() => {
    if (!slug) return

    const controller = new AbortController()

    partnerBrandsApi.getBySlug(slug, controller.signal)
      .then(brand => {
        if (controller.signal.aborted) return

        setResult(brand ? { slug, status: 'ready', brand } : { slug, status: 'missing' })
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ slug, status: 'error' })
      })

    return () => controller.abort()
  }, [slug])

  if (slug && !currentResult) {
    return (
      <main className={`${styles.page} ${styles.status}`}>
        <Helmet><title>Brand Partners | Promallshop</title></Helmet>
        <p role="status">Loading partner details…</p>
      </main>
    )
  }

  if (currentResult?.status !== 'ready') {
    const message = currentResult?.status === 'error'
      ? 'Partner details could not be loaded. Please try again later.'
      : 'Details for this partner are not available yet.'

    return (
      <main className={`${styles.page} ${styles.status}`}>
        <Helmet><title>Brand Partners | Promallshop</title></Helmet>
        <h1>Partner details unavailable</h1>
        <p role="status">{message}</p>
        <Link to="/" className={styles.backLink}>Return to homepage</Link>
      </main>
    )
  }

  const partner = currentResult.brand
  const name = partner.title?.trim() || partner.slug
  const logo = getImageUrl(partner.image?.trim() || '')
  const partnerType = partner.partner_type?.trim()
  const summary = partner.short_description?.trim()
  const description = partner.description?.trim()
  const faqs = Array.isArray(partner.faqs)
    ? partner.faqs
        .filter(faq => faq && typeof faq.question === 'string' && faq.question.trim() && typeof faq.answer === 'string' && faq.answer.trim())
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    : []

  return (
    <main className={styles.page}>
      <Helmet>
        <title>{partner.meta_title?.trim() || `${name} | Promallshop Brand Partners`}</title>
        <meta name="description" content={partner.meta_description?.trim() || summary || `${name} is a Promallshop brand partner.`} />
        <link rel="canonical" href={`${window.location.origin}${partnerPath(partner.slug)}`} />
      </Helmet>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <nav aria-label="Breadcrumb">
            <Link to="/" className={styles.breadcrumb}>Home</Link>
            <span className={styles.separator} aria-hidden="true">/</span>
            <span className={styles.current} aria-current="page">{name}</span>
          </nav>
          {partnerType && <p className={styles.type}>{partnerType}</p>}
          <h1>{name}</h1>
          {summary && <p>{summary}</p>}
        </div>
      </header>

      {(description || logo) && (
        <div className={styles.content}>
          {description && (
            <section className={styles.description} aria-labelledby="partner-about-title">
              <h2 id="partner-about-title">About {name}</h2>
              <p>{description}</p>
            </section>
          )}
          {logo && <div className={styles.imageWrap}><img src={logo} alt={`${name} logo`} /></div>}
        </div>
      )}

      {faqs.length > 0 && (
        <section className={styles.faqSection} aria-labelledby="partner-faqs-title">
          <h2 id="partner-faqs-title">Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            {faqs.map((faq, index) => (
              <details key={`${faq.id}-${index}`} className={styles.faqItem}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
