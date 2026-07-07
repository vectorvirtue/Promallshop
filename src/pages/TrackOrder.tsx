import styles from '../legal/TOU.module.css'
import { Link } from 'react-router-dom';
import pana from '../assets/pana.svg'
export default function OrderTracking() {
  return (
   <>
    <nav className={styles.breadcrumb}>
            <Link className={styles.link} to="/">Home</Link><span>→</span>
            <span>Track Order</span>
           
          </nav>
          <div className={styles.tocenter}>
           
           <div className={styles.details}>
             <h2>Track An Order</h2>
            <p className={styles.sub}>Enter Tracking ID</p>
            <div className={styles.inputfield}>
            <input className={styles.trackinput} type="number" placeholder='Order ID' />
           <button className={styles.trackbtn}>Track Order</button>
            </div>
            
           </div>
             <img src={pana} alt="no order" />
          </div>
   </>
  );
}