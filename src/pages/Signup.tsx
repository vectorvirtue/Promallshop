import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import styles from './Signup.module.css'
import { authApi } from '../lib/api'

export default function SignUp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await authApi.register({
        name: form.name,
        phone: form.phone,
        email: form.email,
        password: form.password,
      })
      console.log('Registration response:', response)
      // store the success message from the API — login page will display it
      const msg = (response as { message?: string }).message || 'Account created! You can now log in.'
      localStorage.setItem('registration_msg', msg)
      navigate(`/login${redirectTo !== '/' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">Home</Link>
        <span>→</span>
        <span>Create Account</span>
      </nav>

      <div className={styles.darkenBackground}>
        <div className={styles.formContainer}>
          <h2 className={styles.header}>Create an Account</h2>

          <form className={styles.container} onSubmit={handleSubmit} noValidate>
            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>OR</span>
              <span className={styles.dividerLine} />
            </div>

            {error && <p className={styles.errorMsg}>{error}</p>}

            <input
              className={styles.input}
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handle}
              required
            />
            <input
              className={styles.input}
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={form.phone}
              onChange={handle}
              required
            />
            <input
              className={styles.input}
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handle}
              required
            />

            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handle}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className={styles.inputWrap}>
              <input
                className={styles.input}
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handle}
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowConfirm(v => !v)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? 'Creating Account…' : 'Create Account'}
            </button>
          </form>

          <p className={styles.bottomlink}>
            Already have an account?{' '}
            <Link style={{ color: '#F18E1A', textDecoration: 'underline' }} to="/login">
              Login
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
