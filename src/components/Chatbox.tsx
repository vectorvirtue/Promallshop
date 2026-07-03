import { useEffect } from 'react';
import styles from './Chatbox.module.css';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

// Extend the Window interface so TypeScript knows about Tawk_API
declare global {
  interface Window {
    Tawk_API?: {
      maximize?: () => void;
      [key: string]: unknown;
    };
  }
}

export default function Chatbox() {

  // 1. Inject the Tawk.to script safely when the component mounts
  useEffect(() => {
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6a44f3be8d66f91d49c36836/1jselg8dr';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode?.insertBefore(s1, s0);
  }, []);

  // 2. Create the click handler to maximize the chat window
  const handleChatClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      window.Tawk_API.maximize();
    } else {
      console.log("Tawk.to is still loading...");
    }
  };

  return (
    <motion.a
      href="#"
      onClick={handleChatClick}
      className={styles.btn}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <MessageSquare size={28} />
    </motion.a>
  );
}
