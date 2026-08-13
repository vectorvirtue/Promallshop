import styles from './Newsletter.module.css'
import { motion } from 'framer-motion'
import { useState } from 'react'
export default function Newsletter() {
      const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubscribe = (e: React.SyntheticEvent) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }
  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2 
        className={styles.h2}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Subscribe to our Newsletter
      </motion.h2>
      <hr className={styles.hr} />
      {subscribed ? (
        <motion.p 
          className={styles.successMsg}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          Thank you for subscribing!
        </motion.p>
      ) : (
        <motion.form 
          onSubmit={handleSubscribe} 
          className={styles.form}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <input
            type="email"
            placeholder="Input your e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <motion.button 
            type="submit" 
            className={styles.button}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Subscribe
          </motion.button>
        </motion.form>
      )}
    </motion.div>
  )
}