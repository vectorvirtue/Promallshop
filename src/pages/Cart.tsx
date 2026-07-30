import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import styles from './Cart.module.css'
import { TriangleAlert } from 'lucide-react'
import { getToken, checkHasOrderedBefore } from '../lib/api'

const FIRST_ORDER_DISCOUNT = 0.15

/* ── helpers ── */
const parsePrice = (str: string): number =>
  parseFloat(str.replace(/[^0-9.]/g, '')) || 0

const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString('en-NG')}`

/* ── icons ── */
const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

const RemoveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const EmptyCartIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
)

export default function Cart() {
  const { items, removeFromCart, updateQuantity } = useCart()
  const navigate = useNavigate()
  const [isFirstTimeBuyer, setIsFirstTimeBuyer] = useState(false)

  /* ── per-item selection — default: all selected ── */
  const [selected, setSelected] = useState<Set<string>>(new Set())

  /* keep selection in sync when items change (new item added → auto-select it) */
  useEffect(() => {
    setSelected(prev => {
      const next = new Set(prev)
      items.forEach(i => { if (!next.has(i.name)) next.add(i.name) })
      // remove stale keys for items no longer in cart
      ;[...next].forEach(n => { if (!items.find(i => i.name === n)) next.delete(n) })
      return next
    })
  }, [items])

  useEffect(() => {
    checkHasOrderedBefore().then(hasOrdered => setIsFirstTimeBuyer(!hasOrdered))
  }, [])

  /* helpers */
  const allSelected = items.length > 0 && items.every(i => selected.has(i.name))
  const someSelected = items.some(i => selected.has(i.name))

  const toggleItem = (name: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(allSelected
      ? new Set()
      : new Set(items.map(i => i.name))
    )
  }

  /* derived totals — only from selected items */
  const selectedItems = items.filter(i => selected.has(i.name))

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity, 0
  )
  const originalTotal = selectedItems.reduce(
    (sum, item) =>
      sum + (item.oldPrice ? parsePrice(item.oldPrice) : parsePrice(item.price)) * item.quantity,
    0
  )
  const productDiscount = originalTotal - subtotal
  const firstOrderDiscount = isFirstTimeBuyer ? subtotal * FIRST_ORDER_DISCOUNT : 0
  const totalAfterDiscount = subtotal - firstOrderDiscount
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const handleCheckout = () => {
    if (selected.size === 0) return
    // persist selected item names so Checkout knows which items to use
    sessionStorage.setItem('checkout_selected', JSON.stringify([...selected]))
    if (getToken()) {
      navigate('/checkout')
    } else {
      navigate('/login?redirect=/checkout')
    }
  }

  return (
    <>
      {/* breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">Home</Link>
        <span>→</span>
        <span>Cart</span>
      </nav>

      <div className={styles.page}>
        <div className={styles.layout}>

          {/* ── left: cart items ── */}
          <div className={styles.cartPanel}>
            <div className={styles.cartHeader}>
              <div className={styles.cartTitle}>
                <CartIcon />
                Shopping Cart
              </div>
              <span className={styles.itemCount}>{totalItems} Item{totalItems !== 1 ? 's' : ''}</span>
            </div>

            {items.length === 0 ? (
              <div className={styles.empty}>
                <EmptyCartIcon />
                <p>Your cart is empty</p>
                <button className={styles.shopBtn} onClick={() => navigate('/shop')}>
                  Browse Products
                </button>
              </div>
            ) : (
              <>
                {/* select-all row */}
                <div className={styles.selectAllRow}>
                  <label className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={allSelected}
                      onChange={toggleAll}
                    />
                    <span>Select all</span>
                  </label>
                  {someSelected && (
                    <span className={styles.selectedCount}>
                      {selected.size} of {items.length} selected for checkout
                    </span>
                  )}
                </div>

                {/* column labels */}
                <div className={styles.colLabels}>
                  <span></span>
                  <span>Product details</span>
                  <span>Price</span>
                  <span>Quantity</span>
                  <span>Total</span>
                  <span></span>
                </div>

                {items.map((item) => {
                  const unitPrice = parsePrice(item.price)
                  const lineTotal = unitPrice * item.quantity
                  const isChecked = selected.has(item.name)

                  return (
                    <div
                      key={item.name}
                      className={`${styles.item} ${!isChecked ? styles.itemDimmed : ''}`}
                    >
                      {/* checkbox */}
                      <label className={styles.itemCheck} aria-label={`Select ${item.name}`}>
                        <input
                          type="checkbox"
                          className={styles.checkbox}
                          checked={isChecked}
                          onChange={() => toggleItem(item.name)}
                        />
                      </label>

                      {/* product info */}
                      <div className={styles.productInfo}>
                        <div className={styles.imgWrap}>
                          <img src={item.img} alt={item.name} />
                        </div>
                        <span className={styles.productName}>{item.name}</span>
                      </div>

                      {/* price */}
                      <div className={styles.priceCol}>
                        <span className={styles.price}>{item.price}</span>
                        {item.oldPrice && (
                          <span className={styles.oldPrice}>{item.oldPrice}</span>
                        )}
                      </div>

                      {/* qty stepper */}
                      <div className={styles.qtyCol}>
                        <span className={styles.qtyLabel}>Qty</span>
                        <div className={styles.stepper}>
                          <button
                            className={styles.stepBtn}
                            onClick={() => updateQuantity(item.name, -1)}
                            aria-label="Decrease quantity"
                          >‹</button>
                          <span className={styles.qtyNum}>{item.quantity}</span>
                          <button
                            className={styles.stepBtn}
                            onClick={() => updateQuantity(item.name, 1)}
                            aria-label="Increase quantity"
                          >›</button>
                        </div>
                      </div>

                      {/* line total */}
                      <span className={styles.totalCol}>{formatNaira(lineTotal)}</span>

                      {/* remove */}
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.name)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <RemoveIcon />
                      </button>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          {/* ── right: order summary ── */}
          <div className={styles.summary}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <hr className={styles.divide} />

            <div className={styles.summaryInner}>
              <p className={styles.summarySubTitle}>
                {selected.size > 0
                  ? `${selected.size} item${selected.size !== 1 ? 's' : ''} selected`
                  : 'No items selected'}
              </p>

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Discount on Product</span>
                <span className={productDiscount > 0 ? styles.discount : styles.discountZero}>
                  {productDiscount > 0 ? `-${formatNaira(productDiscount)}` : formatNaira(0)}
                </span>
              </div>

              {isFirstTimeBuyer && subtotal > 0 && (
                <div className={styles.summaryRow}>
                  <span style={{ color: '#f18e1a', fontWeight: 700 }}>🎉 First Order 15% OFF</span>
                  <span className={styles.discount}>-{formatNaira(firstOrderDiscount)}</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>Coupon Discount</span>
                <span className={styles.coupon}>Apply Coupon</span>
              </div>

              <hr style={{ marginBlock: '1.5em' }} className={styles.divide} />

              <div className={styles.totalRow}>
                <span>Total Amount</span>
                <span>{formatNaira(isFirstTimeBuyer ? totalAfterDiscount : subtotal)}</span>
              </div>
            </div>

            <button
              className={styles.confirmBtn}
              disabled={selected.size === 0}
              onClick={handleCheckout}
            >
              {selected.size === 0
                ? 'Select items to checkout'
                : `Checkout ${selected.size} item${selected.size !== 1 ? 's' : ''}`}
            </button>

            <div className={styles.deliveryNote}>
              <TriangleAlert size={27} fill="#7f7f7f" color="#fff" strokeWidth={2} />
              <span>Delivery fees not included yet</span>
            </div>
          </div>

        </div>
      </div>

      <button onClick={() => navigate('/shop')} className={styles.backlink}>
        ← Continue Shopping
      </button>
    </>
  )
}
