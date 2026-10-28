import styles from "../legal/TOU.module.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import {
  promallCombinedApi,
  type PromallCombinedResponse,
  type WebsiteFaq,
} from "../lib/api";

export default function FAQ(){
  const [open, setOpen] = useState<number | null>(null)
  const [faqs, setFaqs] = useState<WebsiteFaq[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    promallCombinedApi.getAll<PromallCombinedResponse>()
      .then((response) => {
        const items = Array.isArray(response.website_faqs)
          ? [...response.website_faqs]
              .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          : []
        setFaqs(items)
      })
      .catch((cause: unknown) => {
        console.error('Failed to load website FAQs:', cause)
        setError('Unable to load FAQs right now.')
      })
      .finally(() => setLoading(false))
  }, [])

    return(
        
        <>
              <Helmet>
                <title>FAQs — Promallshop </title>
                <meta name="description" content="Find answers to common questions about ordering, payment, delivery, and returns at Promallshop." />
                <link rel="canonical" href={`${window.location.origin}/faqs`} />
                <script type="application/ld+json">{JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faqs.map(f => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                  })),
                })}</script>
              </Helmet>

       <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">
          Home
        </Link>
        <span>→</span>
        <span>FAQ</span>
        </nav>
             <div className={styles.hero}>
<h3>Frequently Asked Questions </h3>
<h1 className={styles.h1}>Here is How we <span className={styles.span}>Help You</span></h1>
      </div>

      <div className={styles.container}>
<h2>
    General questions
</h2>

<div className={styles.faqContainer}>
<div className={styles.faqlist}>
    
 {loading ? (
   <p role="status">Loading FAQs…</p>
 ) : error ? (
   <p role="status">{error}</p>
 ) : faqs.length === 0 ? (
   <p>No FAQs available.</p>
 ) : faqs.map((faq, i) => (
   <div key={faq.id} className={styles.faqItem}>
     <button className={styles.faqQuestion} onClick={() => setOpen(open === i ? null : i)}>
       <span style={{ fontSize: 22, color: '#0B0B0B', flexShrink: 0 }}>{open === i ? '−' : '+'}</span>
       <span>{faq.question}</span>
     </button>
     <hr />
     {open === i && <div className={styles.faqAnswer}><p>{faq.answer}</p></div>}
   </div>
 ))}

</div>
</div>
      </div>

  </>
    )}