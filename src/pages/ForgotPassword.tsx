import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import styles from './Signup.module.css'
import Breadcrumb from '../components/Breadcrumb'
import { authApi } from '../lib/api'

type Step = 'email' | 'code' | 'password' | 'success'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Step 1: Send reset code to email
  const handleRequestCode = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await authApi.forgotPassword(email)
      if (result.success) {
        setStep('code')
      } else {
        setError(result.message || 'Failed to send reset code')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Verify the code
  const handleVerifyCode = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await authApi.verifyResetCode(email, code)
      if (result.success) {
        setStep('password')
      } else {
        setError(result.message || 'Invalid code')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    // Validate passwords match
    if (password !== passwordConfirmation) {
      setError('Passwords do not match')
      return
    }

    // Validate minimum length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const result = await authApi.resetPassword({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      })
      if (result.success) {
        setStep('success')
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(result.message || 'Failed to reset password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Resend code
  const handleResendCode = async () => {
    setError('')
    setIsLoading(true)
    try {
      const result = await authApi.forgotPassword(email)
      if (result.success) {
        setError('') // Clear any previous errors
        alert('New code sent to your email!')
      } else {
        setError(result.message || 'Failed to resend code')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Forgot Password' }]} />
      <div className={styles.darkenBackground}>
        <div className={styles.formContainer}>
          {/* Step 1: Enter Email */}
          {step === 'email' && (
            <>
              <h2 className={styles.header}>Forgot Password?</h2>
              <p className={styles.subtitle}>
                Enter your email address and we'll send you a 6-digit verification code to reset your password.
              </p>

              <form className={styles.container} onSubmit={handleRequestCode}>
                {error && <p className={styles.errorMsg}>{error}</p>}

                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />

                <button className={styles.button} type="submit" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>

              <p className={styles.bottomlink}>
                Remember your password?{' '}
                <Link style={{ color: '#F18E1A', textDecoration: 'underline' }} to="/login">
                  Back to Login
                </Link>
              </p>
            </>
          )}

          {/* Step 2: Enter Verification Code */}
          {step === 'code' && (
            <>
              <h2 className={styles.header}>Enter Verification Code</h2>
              <p className={styles.subtitle}>
                We've sent a 6-digit code to <strong>{email}</strong>. Please enter it below. The code expires in 15 minutes.
              </p>

              <form className={styles.container} onSubmit={handleVerifyCode}>
                {error && <p className={styles.errorMsg}>{error}</p>}

                <input
                  className={styles.input}
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={isLoading}
                  style={{ textAlign: 'center', fontSize: '1.5em', letterSpacing: '0.5em' }}
                />

                <button className={styles.button} type="submit" disabled={isLoading || code.length !== 6}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.85em', color: '#7f7f7f' }}>
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#F18E1A',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontWeight: 600,
                    }}
                  >
                    Resend Code
                  </button>
                </p>
              </form>

              <button
                className={styles.backlink}
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError('')
                }}
              >
                <ArrowLeft size={16} />
                Back to Email
              </button>
            </>
          )}

          {/* Step 3: Enter New Password */}
          {step === 'password' && (
            <>
              <h2 className={styles.header}>Create New Password</h2>
              <p className={styles.subtitle}>
                Your code has been verified. Please enter your new password.
              </p>

              <form className={styles.container} onSubmit={handleResetPassword}>
                {error && <p className={styles.errorMsg}>{error}</p>}

                <input
                  className={styles.input}
                  type="password"
                  placeholder="New Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                  disabled={isLoading}
                />

                <input
                  className={styles.input}
                  type="password"
                  placeholder="Confirm New Password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  minLength={6}
                  required
                  disabled={isLoading}
                />

                <button className={styles.button} type="submit" disabled={isLoading}>
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <>
              <h2 className={styles.header}>Password Reset Successful!</h2>
              <div className={styles.container}>
                <p className={styles.successMsg}>
                  ✅ Your password has been reset successfully. You will be redirected to the login page in a few seconds.
                </p>

                <button
                  className={styles.button}
                  onClick={() => navigate('/login')}
                >
                  Go to Login Now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
