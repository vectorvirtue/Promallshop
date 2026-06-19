import styles from './Chatbox.module.css'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'

export default function Chatbox() {
  return (
  <motion.a className={styles.btn}>
     
    <MessageSquare size={28} />
  </motion.a>
  )
}
