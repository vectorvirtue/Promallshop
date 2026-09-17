import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/promall1crop-2@2x.png";
import styles from "./Navbar.module.css";    
import vector from "../assets/Vector (8).svg";
import { UserCircle2, ShoppingCartIcon, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { productsApi, getImageUrl } from "../lib/api";
import { useQuoteForm } from "../context/QuoteFormContext";
import { generateProductSlug } from "../lib/slugs";

interface SearchProduct {
  id: number
  name: string
  price: string | number
  end_user_price: string | number
  image: string
}

interface ApiCategory {
  products: SearchProduct[]
}
function QuoteForm({ onBack, productInfo }: { onBack: () => void; productInfo: { id: number; name: string; price: string } | null }) {
  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Disable scrolling on the main page when form is open
    document.body.style.overflow = 'hidden';
    
    // Re-enable scrolling when form is closed
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []); 

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true)
    setSubmitStatus('idle')

    const formData = new FormData(e.currentTarget)
    
    // Prepare Web3Forms payload
    const payload = {
      access_key: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY,
      subject: `Quote Request from ${formData.get('name')}`,
      from_name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      message: formData.get('message'),
      quantity: formData.get('quantity'),
      product: productInfo ? `${productInfo.name} (${productInfo.price})` : 'General Inquiry',
    }

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        formRef.current?.reset()
        
        // Close form after 2 seconds on success
        setTimeout(() => {
          onBack()
        }, 2000)
      } else {
        throw new Error(result.message || 'Failed to submit')
      }
    } catch (error) {
      console.error('Quote submission error:', error)
      setSubmitStatus('error')
    } finally {
      setSubmitting(false)
    }
  };

  return (
    <div className={styles.quoteform}>
     

      <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
         <div className={styles.end}>
           <h2>Contact Us</h2>
        <button type="button" onClick={onBack}>
          x
        </button>
      </div>

      {submitStatus === 'success' && (
        <div style={{ padding: '1em', background: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '1em' }}>
          ✅ Quote request sent successfully! We'll get back to you soon.
        </div>
      )}

      {submitStatus === 'error' && (
        <div style={{ padding: '1em', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1em' }}>
          ❌ Failed to send quote request. Please try again.
        </div>
      )}
     
        <input className={styles.formInput} type="text" name="name" placeholder="Your Name" required disabled={submitting} />
        <input className={styles.formInput} type="email" name="email" placeholder="Your Email" required disabled={submitting} />
        <input type="tel" className={styles.formInput} name="phone" placeholder="Phone Number" required disabled={submitting} />
        <input type="text" className={styles.formInput} name="company" placeholder="Company Name" required disabled={submitting} />

        <textarea  
          className={styles.formInput} 
          name="message" 
          placeholder="Which item are you interested in?" 
          defaultValue={productInfo ? `I'm interested in: ${productInfo.name} (${productInfo.price})` : ''}
          required
          disabled={submitting}
        ></textarea>
        <input className={styles.formInput} type="number" name="quantity" placeholder='Quantity' required disabled={submitting} />
        <button className={styles.quoteBtn} type="submit" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
export default function Navbar() {
  const { totalItems } = useCart()
  const { isOpen, productInfo, openQuoteForm, closeQuoteForm } = useQuoteForm()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  // ── search state ──
  const [query, setQuery] = useState('')
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([])
  const [results, setResults] = useState<SearchProduct[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // load products into memory once
  useEffect(() => {
    productsApi.getAll()
      .then((res: unknown) => {
        const r = res as { data: ApiCategory[] }
        const products = Array.isArray(r.data) ? r.data.flatMap(c => c.products) : []
        setAllProducts(products)
      })
      .catch(() => {})
  }, [])

  // filter as user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }
    const q = query.toLowerCase()
    const matched = allProducts
      .filter(p => p.name.toLowerCase().includes(q))
      .slice(0, 5)
    setResults(matched)
    setShowDropdown(true)
  }, [query, allProducts])

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const formatPrice = (p: SearchProduct) => {
    const n = Number(p.end_user_price || p.price)
    return n === 0 ? 'Price on request' : `₦ ${n.toLocaleString('en-NG')}`
  }

  const handleSeeMore = () => {
    navigate(`/shop?q=${encodeURIComponent(query)}`)
    setShowDropdown(false)
    setQuery('')
  }

  const navLinks = [
    { label: "Home", href: '/', external: false },
    { label: "Shop", href: '/shop', external: false },
    { label: "Blog", href: 'https://www.promallshop.com/blog/', external: true },
    { label: "Events", href: '/events', external: false },
  ];

  return (
    <>
      {isOpen ? (
        /* --- FORM MODE --- */
        <QuoteForm
          onBack={closeQuoteForm}
          productInfo={productInfo}
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
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) =>
                  `${styles.link} ${isActive ? styles.linkActive : ''}`
                }
              >
                {link.label}
              </NavLink>
            )
          ))}
        </div>

        {/* quote button — desktop only */}
        <button onClick={() => openQuoteForm()} className={styles.quoteBtn}>Request Quote</button>

        {/* search with live dropdown */}
        <div className={styles.searchContainer} ref={searchRef}>
          <input
            className={styles.input}
            type="text"
            placeholder="Search items..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowDropdown(true)}
          />
          <select className={styles.select} name="category" id="category">
            <option value="">Categories</option>
            <option value="vc">Video Conferencing</option>
            <option value="screens">Screens</option>
            <option value="kits">Coding and Robotic Kits</option>
            <option value="vc">VC Accessories</option>
          </select>
          <div className={styles.searchBtn} onClick={handleSeeMore}>
            <img src={vector} alt="Search Icon" />
          </div>

          {/* dropdown */}
          {showDropdown && (
            <div className={styles.searchDropdown}>
              {results.length === 0 ? (
                <p className={styles.searchEmpty}>No products found for "{query}"</p>
              ) : (
                <>
                  {results.map(p => (
                    <Link
                      key={p.id}
                      to={`/product/${generateProductSlug(p.name, p.id)}`}
                      className={styles.searchItem}
                      onClick={() => { setShowDropdown(false); setQuery('') }}
                    >
                      <img src={getImageUrl(p.image)} alt={p.name} className={styles.searchItemImg} />
                      <div className={styles.searchItemInfo}>
                        <span className={styles.searchItemName}>{p.name}</span>
                        <span className={styles.searchItemPrice}>{formatPrice(p)}</span>
                      </div>
                    </Link>
                  ))}
                  <button className={styles.searchSeeMore} onClick={handleSeeMore}>
                    See more results in Shop →
                  </button>
                </>
              )}
            </div>
          )}
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
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ) : (
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
            )
          ))}
        </div>
      )}
    </>
  );
}
