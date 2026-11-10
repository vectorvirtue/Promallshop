import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ChevronDown, FileText, UserPlus } from 'lucide-react'
import affiliateHeader from '../assets/affiliate-header.png'
import { AFFILIATE_PROGRAM_PATH, AFFILIATE_PROGRAM_URL } from '../lib/links'
import styles from './Affiliate.module.css'

const signupUrl = `${AFFILIATE_PROGRAM_URL}/signup`

const affiliateFaqs = [
  {
    id: 'earnings',
    question: 'How do I track my earnings?',
    answer: 'You can monitor your sales and commission earnings through your affiliate dashboard.',
  },
  {
    id: 'registration',
    question: 'Are there any registration fees?',
    answer: 'No, joining the Promallshop Affiliate Program is completely free.',
  },
  {
    id: 'products',
    question: 'Can I promote any product?',
    answer: 'Yes! You can promote any product available on Promallshop.',
  },
  {
    id: 'payments',
    question: 'When do I get paid?',
    answer: 'Withdrawals are processed monthly once you reach the ₦10,000 minimum balance.',
  },
  {
    id: 'website',
    question: 'Do I need a website to join?',
    answer: 'No, you can share your affiliate link on social media, WhatsApp, emails, or any other platform.',
  },
]

export default function Affiliate() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  return (
    <>
      <Helmet>
        <title>Promallshop Affiliate Program — Earn Commissions on Every Sale</title>
        <meta name="description" content="Join the Promallshop Affiliate Program and earn up to 10% commission on product sales. Withdraw earnings monthly with a minimum of ₦10,000." />
        <link rel="canonical" href={`${window.location.origin}${AFFILIATE_PROGRAM_PATH}`} />
      </Helmet>

      <main className={styles.page}>
        <h1 className={styles.hero}>
          <img src={affiliateHeader} width={1440} height={225} alt="Affiliate Program — Earn More with Every Sale" />
        </h1>

        <div className={styles.content}>
          <section className={styles.section} aria-labelledby="affiliate-how-it-works">
            <h2 id="affiliate-how-it-works">How It Works</h2>
            <p>
              The Promallshop Affiliate Program allows you to earn commissions simply by sharing your unique affiliate link.
              When a customer purchases any product using your link, you earn a commission ranging from{' '}
              <span className={styles.highlight}>0.5%</span> to <span className={styles.highlight}>10%</span>,
              depending on the product category.
            </p>
          </section>

          <section className={styles.section} aria-labelledby="affiliate-steps">
            <h2 id="affiliate-steps">Steps to Get Started</h2>
            <ol>
              <li><span className={styles.highlight}>Sign Up for Free –</span> Register as an affiliate on Promallshop.</li>
              <li><span className={styles.highlight}>Get Your Unique Link –</span> Receive a personalized affiliate link.</li>
              <li><span className={styles.highlight}>Share &amp; Promote –</span> Share your link on social media, blogs, websites, or directly with potential buyers.</li>
              <li><span className={styles.highlight}>Earn Commission –</span> Each successful purchase through your link earns you a percentage of the sale.</li>
              <li><span className={styles.highlight}>Withdraw Your Earnings –</span> Get paid monthly once your earnings reach <span className={styles.highlight}>₦10,000</span>.</li>
            </ol>
          </section>

          <section className={styles.section} aria-labelledby="affiliate-withdrawal">
            <h2 id="affiliate-withdrawal">Withdrawal Process</h2>
            <ol>
              <li>Affiliate commissions are calculated at the end of each month.</li>
              <li>You can request a withdrawal once your earnings reach a minimum of <span className={styles.highlight}>₦10,000</span>.</li>
              <li>Payments are processed directly into your registered bank account.</li>
              <li>Payouts are made within the first week of the following month.</li>
            </ol>
          </section>

          <section className={styles.section} aria-labelledby="affiliate-benefits">
            <h2 id="affiliate-benefits">Affiliate Benefits</h2>
            <ol>
              <li>Earn up to <span className={styles.highlight}>10% commission</span> per sale.</li>
              <li><span className={styles.highlight}>Monthly Payouts</span> with just <span className={styles.highlight}>₦10,000 minimum withdrawal.</span></li>
              <li><span className={styles.highlight}>Marketing Materials Provided –</span> Banners, product images, and promotional content.</li>
              <li><span className={styles.highlight}>Performance Bonuses –</span> Unlock exclusive rewards based on your sales performance.</li>
            </ol>
          </section>

          <section className={styles.section} aria-labelledby="affiliate-join">
            <h2 id="affiliate-join">Join Now &amp; Start Earning!</h2>
            <p>
              Ready to turn your audience into income?{' '}
              <a href={signupUrl} className={styles.signupText}>Sign up today</a>{' '}
              and start earning commissions with Promallshop&apos;s Affiliate Program.
            </p>
            <div className={styles.actions}>
              <a href={signupUrl} className={`${styles.action} ${styles.signupButton}`}>
                <UserPlus size={24} aria-hidden="true" /> Sign Up Now
              </a>
              <a href="/affiliate/affiliate-terms.pdf" className={styles.action} download>
                <FileText size={22} aria-hidden="true" /> Terms &amp; Conditions
              </a>
              <a href="/affiliate/affiliate-guidelines.pdf" className={styles.action} download>
                <FileText size={22} aria-hidden="true" /> Guidelines
              </a>
            </div>
          </section>

          <section className={styles.faqSection} aria-labelledby="affiliate-faqs">
            <h2 id="affiliate-faqs">Frequently Asked Questions</h2>
            <div className={styles.faqList}>
              {affiliateFaqs.map(faq => {
                const isOpen = openFaq === faq.id
                const questionId = `affiliate-${faq.id}-question`
                const answerId = `affiliate-${faq.id}-answer`

                return (
                  <div className={styles.faqItem} key={faq.id}>
                    <h3>
                      <button
                        type="button"
                        id={questionId}
                        className={styles.faqQuestion}
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        onClick={() => setOpenFaq(previous => previous === faq.id ? null : faq.id)}
                      >
                        <span>{faq.question}</span>
                        <ChevronDown size={20} aria-hidden="true" />
                      </button>
                    </h3>
                    <div id={answerId} className={styles.faqAnswer} role="region" aria-labelledby={questionId} hidden={!isOpen}>
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
