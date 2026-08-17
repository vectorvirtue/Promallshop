import sales from '../assets/affiliate.gif'
import styles from './FlashSales.module.css'

export default function Gif(){

   return(
     <div className={styles.section} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        
      <img src={sales} alt="Delivery gif" className={styles.gif}/>
    </div>
   )
    
}