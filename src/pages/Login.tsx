import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import styles from './Signup.module.css'
import Breadcrumb from '../components/Breadcrumb'
import { useAuth } from '../context/AuthContext'
import { clearLoginRedirect, getLoginRedirect } from '../lib/redirect'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, isLoading, error } = useAuth()
  const redirectTo = getLoginRedirect()

  // read the registration message stored by Signup — persists across refreshes
  const registrationMsg = localStorage.getItem('registration_msg')

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      await signIn(form.email, form.password, form.remember)
      localStorage.removeItem('registration_msg')
      clearLoginRedirect()
      navigate(redirectTo)
    } catch {
      /* error surfaced from useAuth().error */
    }
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Login' }]} />
      <div className={styles.darkenBackground}>
        <div className={styles.formContainer}>
          <h2 className={styles.header}>Sign in to Your Account</h2>

          <form className={styles.container} onSubmit={handleSubmit} noValidate>
            <div className={styles.divider}>
              <span className={styles.dividerLine} />
              <span className={styles.dividerText}>OR</span>
              <span className={styles.dividerLine} />
            </div>

            {registrationMsg && (
              <p className={styles.successMsg}>{registrationMsg}</p>
            )}
            {error && <p className={styles.errorMsg}>{error}</p>}

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

            <p className={styles.between}>
              <label className={styles.rememberMe}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handle}
                />
                Remember me
              </label>
              <Link style={{ color: '#0B0B0B', textDecoration: 'none' }} to="/forgotpassword">
                Forgot Password?
              </Link>
            </p>

            <button className={styles.button} type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className={styles.bottomlink}>
            Don't have an account?{' '}
            <Link
              style={{ color: '#F18E1A', textDecoration: 'underline' }}
              to="/signup"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
