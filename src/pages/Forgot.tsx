import { Link } from "react-router-dom"
import styles from './Signup.module.css'
export default function ForgotPassword(){
return(
<>
<nav className={styles.breadcrumb}>
<Link className={styles.link}  to="/">Home</Link> <span>→</span>
<span>Login</span><span>→</span>
<span>Forgot Password</span>

</nav>

<div className={styles.darkenBackground}>
<div className={styles.formContainer}>
<h2 className={styles.header}>Forgot Your Password?</h2>
<form className={styles.container}>
        {/* social sign-up buttons */}

<input className={styles.input} type="email" placeholder="Email" required/>

<button className={styles.button} type="submit">Submit</button>
</form>
   <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>OR</span>
          <span className={styles.dividerLine} />
        </div>
<p className={styles.bottomlink}>Remembered Password? <Link style={{color:"#F18E1A", textDecoration:'underline'}} to="/login">Login</Link></p>
</div>
</div>
</>
)
}