import sales from '../assets/deliver.gif'
import styles from './FlashSales.module.css'

export default function Gif(){

   return(
     <div className={styles.section}>
        
      <img src={sales} alt="Delivery gif" className={styles.gif}/>
    </div>
   )
    
}