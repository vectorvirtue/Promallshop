import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Signup.module.css'

const API = import.meta.env.VITE_PUBLIC_API_URL as string

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // ⚠️ Forgot password endpoint not yet documented in the API spec.
      // Update the path below once the backend adds it.
      const res = await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok || data.success === false) {
        setError(data.message || 'Something went wrong. Please try again.')
        return
      }

      setSuccess(data.message || 'Password reset link sent! Check your email.')
      setEmail('')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">Home</Link>
        <span>→</span>
        <Link className={styles.link} to="/login">Login</Link>
        <span>→</span>
        <span>Forgot Password</span>
      </nav>

      <div className={styles.darkenBackground}>
        <div className={styles.formContainer}>
          <h2 className={styles.header}>Forgot Your Password?</h2>
          <p style={{ fontSize: '0.85em', color: '#7f7f7f', textAlign: 'center', marginBottom: '0.5em' }}>
            Enter your email and we'll send you a reset link.
          </p>

          <form className={styles.container} onSubmit={handleSubmit} noValidate>
            {error && <p className={styles.errorMsg}>{error}</p>}
            {success && <p className={styles.successMsg}>{success}</p>}

            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>

          <div className={styles.divider} style={{ marginTop: '1.5em' }}>
            <span className={styles.dividerLine} />
            <span className={styles.dividerText}>OR</span>
            <span className={styles.dividerLine} />
          </div>

          <p className={styles.bottomlink}>
            Remembered your password?{' '}
            <Link style={{ color: '#F18E1A', textDecoration: 'underline' }} to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
