import { useState, useEffect } from 'react'
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/promall1crop-2@2x.png";
import styles from "./Navbar.module.css";    
import vector from "../assets/Vector (8).svg";
import { UserCircle2, ShoppingCartIcon, Menu, X,  } from "lucide-react";
import { useCart } from "../context/CartContext";
function QuoteForm({ onBack }) {
  useEffect(() => {
    // Disable scrolling on the main page when form is open
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when form is closed
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []); 

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
    };

    // Here you would typically send the data to your backend
    console.log(data);

    // Reset form
    e.target.reset();
  };

  return (
    <div className={styles.quoteform}>
     

      <form className={styles.form} onSubmit={handleSubmit}>
         <div className={styles.end}>
           <h2>Contact Us</h2>
        <button type="button" onClick={onBack}>
          x
        </button>
      </div>

     
        <input className={styles.formInput} type="text" name="name" placeholder="Your Name" required />
        <input className={styles.formInput} type="email" name="email" placeholder="Your Email" required />
        <input type="tel" className={styles.formInput} name="phone" placeholder="Phone Number" required />
        <textarea  className={styles.formInput} name="message" placeholder="Which item are you interested in?" required></textarea>
        <input className={styles.formInput} type="number" name="quantity" id="" placeholder='Quantity' required />
        <button className={styles.quoteBtn} type="submit">Send Message</button>
      </form>
    </div>
  );
}
export default function Navbar() {
  const { totalItems } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showForm, setShowForm] = useState(false);

  const navLinks = [
    { label: "Home", href: '/' },
    { label: "Shop", href: '/shop' }, 
    { label: "Blog", href: '/blog' },
    { label: "Rentals", href: '/rentals' },   
  ];

  return (
    <>
      {showForm ? (
        /* --- FORM MODE --- */
        <QuoteForm
          onBack={() => setShowForm(false)}
        />
      ) : (
/* --- NAV MODE --- */
      <nav className={styles.nav}>
        {/* logo */}
        <NavLink to="/" className={styles.logoLink}>
          <img src={logo} alt="Promallshop Logo" className={styles.logo} />
        </NavLink>

        {/* nav links — desktop only */}
        <div className={styles.linksContainer}>
          {navLinks.map((link) => (
            <NavLink 
              key={link.href} 
              to={link.href} 
              className={({ isActive }) => 
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* quote button — desktop only */}
        <button onClick={() => setShowForm(true)} className={styles.quoteBtn}>Request Quote</button>

        {/* search */}
        <div className={styles.searchContainer}>
          <input className={styles.input} type="text" placeholder="Search items..." />
          <select className={styles.select} name="category" id="category">
            <option value="">Categories</option>
            <option value="vc">Video Conferencing</option>
              <option value="screens">Screens</option>
            <option value="kits">Coding and Robotic Kits</option>
            <option value="vc"> VC Accessories</option>
          </select>
          <div className={styles.searchBtn}>
            <img src={vector} alt="Search Icon" />
          </div>
        </div>

        {/* cart */}
        <div className={styles.cartWrap}>

<Link style={{
  display:'flex',

  alignItems:'center',
  justifyContent:'center',

  color:'inherit',
  textDecoration:'none',
}} to="/cart">
            <ShoppingCartIcon size={28} />
          </Link>
          {totalItems > 0 && (
            <span className={styles.cartBadge}>{totalItems}</span>
          )}
        </div>

        {/* user */}
        <div className={styles.icon}>
         <Link style={{
  display:'flex',
  
  alignItems:'center',
  justifyContent:'center',
  
  color:'inherit',
  textDecoration:'none',
         }} to= '/signup'>
          <UserCircle2 size={28} />
         </Link>
        </div>

        {/* hamburger — mobile only */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>
      )}

      {/* mobile drawer */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                `${styles.mobileLink} ${isActive ? styles.linkActive : ''}`
              }
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </div>
    )}
    </>
  );
}
