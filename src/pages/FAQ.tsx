import styles from "../legal/TOU.module.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { promallCombinedApi, type PromallCombinedResponse } from "../lib/api";

interface FaqItem {
  id: string
  q: string
  a: string
}

export default function FAQ() {
  const [open, setOpen] = useState<string | null>(null)
  const [cmsFaqs, setCmsFaqs] = useState<FaqItem[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    promallCombinedApi.getAll<PromallCombinedResponse>()
      .then((response) => {
        const items = Array.isArray(response.website_faqs)
          ? response.website_faqs
              .filter(faq => faq && typeof faq.question === 'string' && faq.question.trim() && typeof faq.answer === 'string' && faq.answer.trim())
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
              .map((faq, index) => ({ id: `cms-${faq.id}-${index}`, q: faq.question, a: faq.answer }))
          : []

        if (!cancelled) {
          setCmsFaqs(items)
          setStatus('ready')
        }
      })
      .catch((cause: unknown) => {
        console.error('Failed to load website FAQs:', cause)
        if (!cancelled) {
          setCmsFaqs([])
          setStatus('error')
        }
      })

    return () => { cancelled = true }
  }, [])

  const faqGroups = cmsFaqs.length > 0
    ? [{ id: 'general-questions', title: 'General questions', items: cmsFaqs }]
    : []

  return (
    <>
      <Helmet>
        <title>FAQs About IT Equipment, Orders and Delivery | Promallshop</title>
        <meta name="description" content="Find answers about IT equipment in Nigeria, product availability, quotations, discounts, ordering, payment, delivery and returns at Promallshop." />
        <link rel="canonical" href={`${window.location.origin}/faqs`} />
        {cmsFaqs.length > 0 && <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqGroups.flatMap(group => group.items).map(faq => ({
            '@type': 'Question',
            name: faq.q,
            acceptedAnswer: { '@type': 'Answer', text: faq.a },
          })),
        })}</script>}
      </Helmet>

      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link className={styles.link} to="/">Home</Link>
        <span aria-hidden="true">→</span>
        <span aria-current="page">FAQ</span>
      </nav>
      <div className={styles.hero}>
        <h3>Frequently Asked Questions</h3>
        <h1 className={styles.h1}>Here is How we <span className={styles.span}>Help You</span></h1>
      </div>

      <main className={styles.container}>
        {status === 'loading' && <p role="status">Loading FAQs…</p>}
        {status === 'error' && <p role="alert">FAQs could not be loaded. Please try again later.</p>}
        {status === 'ready' && cmsFaqs.length === 0 && <p role="status">No FAQs are available right now.</p>}
        {faqGroups.map(group => (
          <section key={group.id} aria-labelledby={`${group.id}-title`}>
            <h2 id={`${group.id}-title`}>{group.title}</h2>
            <div className={styles.faqContainer}>
              <div className={styles.faqlist}>
                {group.items.map(faq => {
                  const id = `${group.id}-${faq.id}`
                  const isOpen = open === id

                  return (
                    <div key={faq.id} className={styles.faqItem}>
                      <button
                        id={`${id}-question`}
                        type="button"
                        className={styles.faqQuestion}
                        aria-expanded={isOpen}
                        aria-controls={`${id}-answer`}
                        onClick={() => setOpen(previous => previous === id ? null : id)}
                      >
                        <span aria-hidden="true" style={{ fontSize: 22, color: '#0B0B0B', flexShrink: 0 }}>{isOpen ? '−' : '+'}</span>
                        <span>{faq.q}</span>
                      </button>
                      <hr />
                      <div id={`${id}-answer`} className={styles.faqAnswer} hidden={!isOpen}>
                        <p>{faq.a}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        ))}
      </main>
    </>
  )
}
