import styles from '../pages/Signup.module.css'
import { Link } from 'react-router-dom'

export default function Login (){
return (
    <>
<nav className={styles.breadcrumb}>
<Link className={styles.link} to="/">Home</Link><span>→</span>
<span>Login</span>

</nav>

<div className={styles.darkenBackground}>
<div className={styles.formContainer}>
<h2 className={styles.header}>Sign in to Your Account</h2>
<form className={styles.container}>
    {/* social sign-up buttons */}
    <div className={styles.socialRow}>
        <button type="button" className={styles.socialBtn}>
        {/* Google G */}
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign up with Google
        </button>

        <button type="button" className={styles.socialBtn}>
        {/* Apple  */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
        Sign up with Apple
        </button>
    </div>

    {/* OR divider */}
    <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>OR</span>
        <span className={styles.dividerLine} />
    </div>


<input className={styles.input} type="email" placeholder="Email" required/>
<input className={styles.input} type="password" placeholder="Password" required/>
<p className={styles.between}>
    <label className={styles.rememberMe}>
      <input type="checkbox" /> Remember me
    </label>
    <Link style={{color:"#0B0B0B", textDecoration:'none', }} to="/forgotpassword">Forgot Password?</Link>
</p>
<button className={styles.button} type="submit">Create Account</button>
</form>
<p className={styles.bottomlink}>Don't have an account? <Link style={{color:"#F18E1A", textDecoration:'underline'}} to="/signup">Create an Account</Link></p>
</div>
</div>
</>
)
}