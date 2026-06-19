import { Link } from "react-router-dom";
import styles from "../pages/Contact.module.css";
import style from  "../components/Newsletter.module.css";
import { Helmet } from "react-helmet-async";
import phone from "../assets/phone.svg";
import email from "../assets/email.svg";
import address from "../assets/address.svg";
import { useState } from "react";
export default function Contact() {
        const [subscribed, setSubscribed] = useState(false)

    const [message, setMessage] = useState('');
  const maxLength = 200; // Define your character cap

  const handleChange = (e) => {
    // Optional: Prevents typing past 200 characters if you want a hard cap
    if (e.target.value.length <= maxLength) {
      setMessage(e.target.value);
    }
  };
  return (
    <>
      <Helmet>
        <title>Contact Us — Promallshop </title>
      </Helmet>

      <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">
          Home
        </Link>
        <span>→</span>
        <span>Contact Us</span>
      </nav>

      <div className={styles.hero}>
        <h2>Contact Us</h2>
        <h5>Get in touch and let us know how we can help</h5>
      </div>

      <div className={styles.boxes}>
        <div className={styles.box}>
          <h3>Address</h3>
          <img className={styles.image} src={address} alt="icon" />
          <p className={styles.p}>5B Adedeji Close, Opebi Ikeja, Lagos.</p>
        </div>

        <div className={styles.box}>
          <h3>Phone Number</h3>
          <img className={styles.image} src={phone} alt="icon" />
          <p className={styles.p}>+234 703 264 7755</p>
        </div>

        <div className={styles.box}>
          <h3>Email Address</h3>
          <img className={styles.image} src={email} alt="icon" />
          <p className={styles.p}>sales@promallshop.com</p>
        </div>
      </div>

      <form  className={styles.form}>
        <h2>Get In Touch</h2>
        <h5>
          We would Love to hear From You, Enquiries, Observations, Place an
          order.
        </h5>
        <div className={styles.formfield}>
          <div className={styles.inputfield}>
             <label htmlFor="">Enter Name</label>
       <input className={styles.input} type="text" placeholder="Name" required />
          </div>
          <div className={styles.inputfield}>
             <label htmlFor="">Enter Email</label>
       <input className={styles.input} type="email" placeholder="Email Address" required />
          </div>
        </div>
         <div className={styles.formfield}>
          <div className={styles.inputfield}>
             <label htmlFor="">Enter Phone</label>
       <input className={styles.input} type="tel" placeholder="Phone Number" required/>
          </div>
          <div className={styles.inputfield}>
             <label htmlFor="">Enter Subject</label>
       <input className={styles.input}  type="text"  required />
          </div>
        </div>
        <div className={styles.textfield}>
 <label htmlFor="message-input">Enter your Message</label>
      
      {/* Container holding both the textarea and its bottom counter panel */}
      <div className={styles.textareaWrapper}>
        <textarea 
          id="message-input"
          className={styles.myTextArea} 
          placeholder="Type your message here..."
          value={message}
          onChange={handleChange}
        />
        
        {/* The bottom bar matching your screenshot */}
        <div className={styles.counterBar}>
          <span>{message.length}/{maxLength}</span>
        </div>
      </div>
   
    </div>
       <button className={styles.button}>
        Send Message
      </button>
      </form>
 <div className={styles.map}>
 <iframe
          className="map-iframe"
src="https://maps.google.com/maps?q=5B%20Adedeji%20Close,%20Opebi%20Ikeja,%20Lagos&output=embed"          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Mtech Noblehub Office Location"
        />
    </div>

       <div className={style.container}>
      <h2> Subscribe to our Newsletter</h2>
      <hr className={style.hr} />
      {subscribed ? (
                <p className={style.successMsg}>Thank you for subscribing!</p>
              ) : (
      <form  className={style.form}>
        <input
          type="email"
          placeholder="Input your e-mail"
                    
          className={style.input}
        />
        <button type="submit" className={style.button}>
          Subscribe
        </button>
      </form>)}
    </div>

   
    </>
  );
}
