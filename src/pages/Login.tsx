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