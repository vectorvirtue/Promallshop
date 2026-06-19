import styles from './Newsletter.module.css'
import { useState } from 'react'
export default function Newsletter() {
      const [subscribed, setSubscribed] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) { setSubscribed(true); setEmail('') }
  }
  return (
    <div className={styles.container}>
      <h2> Subscribe to our Newsletter</h2>
      <hr className={styles.hr} />
      {subscribed ? (
                <p className={styles.successMsg}>Thank you for subscribing!</p>
              ) : (
      <form onSubmit={handleSubscribe} className={styles.form}>
        <input
          type="email"
          placeholder="Input your e-mail"
           value={email}
                    onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Subscribe
        </button>
      </form>)}
    </div>
  )
}