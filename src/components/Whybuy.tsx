import styles from  './Whybuy.module.css';
import { motion } from 'framer-motion';
import Cart from '../assets/Fast Cart.svg'
import Guarantee from '../assets/Guarantee.svg'
import Call from '../assets/Call female.svg'

export default function Whybuy(){
    return(
        <motion.div 
          className={styles.container}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
            <motion.h2 
              style={{
                textAlign:"center",
                marginTop:'-1em'
              }}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Why Buy From Us?
            </motion.h2>
            <div className={styles.boxes}>
              <motion.div 
                className={styles.boxOne}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                whileHover={{ y: -8 }}
              >
                <h3 className={styles.header}>Fast Tracking For Delivery</h3>
                <img src={Cart} alt="Fast Delivery" />
              </motion.div>
              <motion.div 
                className={styles.boxOne}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ y: -8 }}
              >
                <h3 className={styles.header}> Guarantee Of Products</h3>
                <img src={Guarantee} alt="Money Back Guarantee" />
              </motion.div>
              <motion.div 
                className={styles.boxOne}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                whileHover={{ y: -8 }}
              >
                <h3 className={styles.header}>24/7 Support</h3>
                <img src={Call} alt="24/7 Support" />
              </motion.div>
            </div>
        </motion.div>
    )
}