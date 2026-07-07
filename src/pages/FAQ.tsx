import styles from "../legal/TOU.module.css";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";

const faqs = [
  {
    q: 'How do I place an order?',
    a: 'Click on ADD TO CART to add this product to your cart, Click on Cart in the top right corner, Click on PROCEED TO CHECKOUT',
  },
  {
    q: 'Are there any hidden costs or charges if I order from Promallshop?',
    a: 'There are no hidden costs or charges when you order from Promallshop. All costs are 100% visible before and at the end of the checkout process.',
  },
  {
    q: 'How do I know if my order has been confirmed?',
    a: "We'll send you an email and SMS notifications once your order has been confirmed.",
  },
  {
    q: 'What are the conditions for returning a product and what is the procedure?',
    a: 'When you shop on Promallshop, you can be rest assured that you can return your product if your product is eligible for return. To learn more about our return policy, please read our Terms and Conditions.',
  },
  {
    q: 'Which Payment methods do you support?',
    a: 'We currenly support online payment, Bank transfer and Cheque payment',
  },
  {
    q: 'I missed the delivery. What happens now?',
    a: 'Not to worry, we will try to reschedule your order the next business day. We will make a total of 2 attempt to deliver the package, before canceling your order. We will also notify you about the status of your delivery via email ans SMS You can check the status of your order anytime.'
  },
  {
    q: 'Can I use two payment methods when ordering online?',
    a: 'Sorry, we only accept one payment method per order',
  },
  {
    q: 'To where do you ship? How long does it take you to process an order before it is dispatched?',
    a: 'Delivery is available in most locations across the country. Ordered goods are delivered within 2 to 4 days within across the Country',
  },
  {
    q: 'Will somebody contact me before delivering the package to my location?',
    a: 'Yes, our delivery agent will contact you to confirm your availability and exact location. Also, we will send you an email with details of the delivery agent when your package is out for delivery.',
  },
]
export default function FAQ(){
      const [open, setOpen] = useState<number | null>(null)

    return(
        
        <>
              <Helmet><title>FAQs — Promallshop </title></Helmet>

       <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">
          Home
        </Link>
        <span>→</span>
        <span>FAQ</span>
        </nav>
             <div className={styles.hero}>
<h3>Frequently Asked Questions </h3>
<h1>Here is How we <span className={styles.span}>Help You</span></h1>
      </div>

      <div className={styles.container}>
<h2>
    General questions
</h2>

<div className={styles.faqContainer}>
<div className={styles.faqlist}>
    
 {faqs.map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <button className={styles.faqQuestion} onClick={() => setOpen(open === i ? null : i)}>
                 <span style={{ fontSize: 22, color: '#0B0B0B', flexShrink: 0 }}>{open === i ? '−' : '+'}</span>
                <span>{faq.q}</span>
               
              </button>
              <hr />
              {open === i && <div className={styles.faqAnswer}><p>{faq.a}</p></div>}
            </div>
          ))}

</div>
</div>
      </div>

  </>
    )}