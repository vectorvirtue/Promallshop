import styles from './Whychoose.module.css'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

const sections = [
  {
    heading: 'Why Businesses in Nigeria and Ghana Choose Promallshop',
    bullets: [
      'Genuine products from trusted global technology brands',
      'A wide range of IT equipment for businesses and organizations',
      'High-quality computer accessories for productivity and communication',
      'Competitive pricing on advanced technology products',
      'Reliable technology solutions for offices, schools, and institutions',
      'Access to modern collaboration and communication tools',
    ],
    text: 'Our goal is to help businesses and professionals adopt modern technology solutions that improve productivity, communication, and efficiency.',
  },
  {
    heading: 'Video Conferencing Solutions for Modern Workplaces',
    bullets: [
      'Conference cameras and HD webcams',
      'Professional microphones and speakerphones',
      'All-in-one video conferencing systems',
      'Meeting room collaboration devices',
    ],
    text: 'We supply equipment from trusted brands such as Logitech, Polycom, Yealink, Norden, and Vbet, ensuring crystal-clear audio and high-definition video communication for meetings, training sessions, and remote collaboration. These solutions are ideal for corporate boardrooms, training rooms, remote teams, and government organizations.',
  },
  {
    heading: 'Coding and Robotics Kits for STEM Learning',
    bullets: [
      'Makeblock robotics and coding kits',
      'Twin Robotics educational tools',
      'Arduino starter and advanced kits',
    ],
    text: 'These tools help students develop valuable skills in coding, robotics engineering, automation, electronics, and creative problem solving. They are perfect for schools, STEM academies, coding bootcamps, and technology training centers.',
  },
  {
    heading: 'Interactive Displays and Digital Signage Screens',
    bullets: [
      'Multi-touch interactive displays',
      'Wireless presentation systems',
      'Digital signage screens for retail and corporate communication',
      'Smart collaboration displays for meetings and classrooms',
    ],
    text: 'We supply innovative display technology from trusted brands such as Samsung, MAXHUB, LG, and Sharp, enabling organizations to deliver engaging presentations, collaborative learning experiences, and modern workplace communication.',
  },
  {
    heading: 'Computer Accessories for Offices and Home Workspaces',
    bullets: [
      'Professional headsets for meetings and calls',
      'High-definition webcams',
      'Wireless keyboards and precision mice',
      'USB hubs and connectivity adapters',
      'Laptop accessories and computer peripherals',
    ],
    text: 'These accessories are ideal for corporate offices, remote workers, home workspaces, and professionals who require reliable productivity tools.',
  },
  {
    heading: 'Networking, Security, and Power Solutions',
    bullets: [
      'Networking equipment and enterprise routers',
      'Surveillance cameras and security systems',
      'Backup power solutions',
      'Office connectivity and network devices',
    ],
    text: 'These solutions ensure businesses maintain secure networks, reliable connectivity, and uninterrupted operations.',
  },
]

const SEO_TITLE = "Nigeria's No.1 Tech Store — IT Equipment & Computer Accessories | Promallshop"
const SEO_DESC = "Promallshop is Nigeria and Ghana's leading tech store for IT equipment, video conferencing systems, computer accessories, coding kits, IP phones, screens, and more. Trusted brands: Logitech, Yealink, MAXHUB, Huawei, Samsung, LG, Sharp."
const SEO_KEYWORDS = "Promallshop, IT equipment Nigeria, computer accessories Ghana, video conferencing Nigeria, Logitech Nigeria, Yealink Nigeria, MAXHUB, coding kits Nigeria, robotics kits, IP phones Nigeria, interactive displays Nigeria, headsets Nigeria, tech store Lagos"

export default function Choose() {
  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESC} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="robots" content="index, follow" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://promallshop.com" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESC} />
        <meta property="og:image" content="https://promallshop.com/og-image.jpg" />
        <meta property="og:locale" content="en_NG" />
        <meta property="og:site_name" content="Promallshop" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESC} />

        {/* Canonical */}
        <link rel="canonical" href="https://promallshop.com" />

        {/* Structured data — Organization */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Promallshop",
          "url": "https://promallshop.com",
          "logo": "https://promallshop.com/logo.png",
          "description": SEO_DESC,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "5B Adedeji Close, Opebi Ikeja",
            "addressLocality": "Lagos",
            "addressCountry": "NG"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+234-703-264-7755",
            "contactType": "customer service",
            "email": "sales@promallshop.com"
          },
          "sameAs": [
            "https://www.facebook.com/promallshop",
            "https://www.instagram.com/promallshop"
          ]
        })}</script>

        {/* Structured data — WebSite with SearchAction */}
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Promallshop",
          "url": "https://promallshop.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://promallshop.com/shop?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}</script>
      </Helmet>

      <motion.article 
        className={styles.container} 
        aria-label="About Promallshop"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Promallshop — No. 1 Shopping Destination For IT Solutions
        </motion.h2>
        <motion.p 
          className={styles.intro}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Welcome to <strong>Promallshop</strong>, a trusted <strong>tech store for IT equipment and computer accessories in West Africa.</strong>.
          We provide advanced technology solutions designed for businesses, schools, government organizations, and individuals
          who need reliable digital tools for productivity and communication.
        </motion.p>

        {sections.map((s, index) => (
          <motion.section 
            key={s.heading} 
            className={styles.choices}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <h3 className={styles.header}>{s.heading}</h3>
            <ul className={styles.margin}>
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            <p>{s.text}</p>
          </motion.section>
        ))}

        <motion.section 
          className={styles.choices}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className={styles.header}>Enjoy 15% Off Your First Order</h3>
          <p>
            New customers can enjoy an exclusive <strong>15% discount on their first purchase at Promallshop</strong> —
            on video conferencing systems, interactive displays, robotics kits, computer accessories, networking equipment, and more.
            Promallshop offers premium technology products at competitive prices for businesses, schools, and professionals across Nigeria and Ghana.
          </p>
        </motion.section>

        <motion.section 
          className={styles.choices} 
          style={{ marginBottom: '2em' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className={styles.header}>Our Trusted Technology Partners</h3>
          <p>
            Promallshop collaborates with leading global technology brands including{' '}
            <strong>MAXHUB, Huawei, Logitech, Yealink, Samsung, LG, Sharp, Bosch, Polycom, Sennheiser, Absen, Hikvision, Twin Robotics, Makeblock, and Arduino</strong>{' '}
            to ensure customers receive genuine IT equipment and high-quality computer accessories backed by global quality standards and trusted manufacturer support.
          </p>
        </motion.section>
      </motion.article>
    </>
  )
}

