import styles from  './Whybuy.module.css';
import Cart from '../assets/Fast Cart.svg'
import Guarantee from '../assets/Guarantee.svg'
import Call from '../assets/Call female.svg'
export default function  Whybuy(){
    return(
        <div className={styles.container}>
            <h2>Why Buy From Us?</h2>
            <div className={styles.boxes}>
              <div className={styles.boxOne}>
                
                <h3 className={styles.header}>Fast Tracking For Delivery</h3>
              <img src={Cart} alt="Fast Delivery" />
              </div>
              <div className={styles.boxOne}>
              
                <h3 className={styles.header}> Guarantee Of Products</h3>
                 <img src={Guarantee} alt="Money Back Guarantee" />
              </div>
              <div className={styles.boxOne}>
              
                <h3 className={styles.header}>24/7 Support</h3>
                 <img src={Call} alt="24/7 Support" />
              </div>
            </div>
        </div>
    )
}