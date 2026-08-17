import styles from './Awards.module.css'
import { motion } from 'framer-motion'
import visaLogo from '../assets/visa.png'
import mastercardLogo from '../assets/mastercard.png'
import paystackLogo from '../assets/download (1).png'
import flutterwaveLogo from '../assets/download.png'
import verifiedStamp from '../assets/images-removebg-preview (4).png'
import guaranteedStamp from '../assets/images-removebg-preview (3).png'

export default function Awards() {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          {/* Awards Section */}
          <motion.div 
            className={styles.section}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className={styles.title}>Our Awards</h3>

            {/* Awards Row - Horizontal Layout */}
            <div className={styles.awards}>
              <motion.div 
                className={styles.awardItem}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className={styles.awardIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <div className={styles.awardContent}>
                  <span className={styles.awardTitle}>Trusted Technology Store</span>
                  <span className={styles.awardSubtitle}>in West Africa</span>
                </div>
              </motion.div>

              <motion.div 
                className={styles.awardItem}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div style={{ color: '#f18e1a' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                </div>
                <div className={styles.awardContent}>
                  <span className={styles.awardTitle}>Best Technology E-Commerce</span>
                  <span className={styles.awardSubtitle}>Platform in Africa</span>
                </div>
              </motion.div>

              <motion.div 
                className={styles.awardItem}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div style={{ color: '#f18e1a' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div className={styles.awardContent}>
                  <span className={styles.awardTitle}>Secure Payments</span>
                  <span className={styles.awardSubtitle}>Safe & Reliable</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Payment Methods Section */}
          <motion.div 
            className={styles.section}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className={styles.title}>We Accept</h3>
            <div className={styles.payments}>
              <motion.div 
                className={styles.paymentLogo}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={visaLogo} alt="Visa" />
              </motion.div>
              <motion.div 
                className={styles.paymentLogo}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={mastercardLogo} alt="Mastercard" />
              </motion.div>
              <motion.div 
                className={styles.paymentLogo}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={paystackLogo} alt="Paystack" />
              </motion.div>
              <motion.div 
                className={styles.paymentLogo}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 }}
                whileHover={{ scale: 1.05 }}
              >
                <img src={flutterwaveLogo} alt="Flutterwave" />
              </motion.div>
              <motion.div 
                className={styles.paymentMethod}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
                <span>Bank Transfer</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stamps Container - At Bottom */}
      <div className={styles.stampsContainer}>
        <motion.div 
          className={styles.stampItem}
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: -15 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
        >
          <img src={verifiedStamp} alt="Verified" className={styles.stamp} />
        </motion.div>

        <motion.div 
          className={styles.stampItem}
          initial={{ scale: 0, rotate: 180 }}
          whileInView={{ scale: 1, rotate: 15 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, type: "spring" }}
        >
          <img src={guaranteedStamp} alt="Guaranteed" className={styles.stamp} />
        </motion.div>
      </div>
    </>
  )
}
