import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import styles from './Cart.module.css'
import { TriangleAlert } from 'lucide-react'

/* ── helpers ── */
const parsePrice = (str: string): number =>
parseFloat(str.replace(/[^0-9.]/g, '')) || 0

const formatNaira = (amount: number): string =>
`₦ ${amount.toLocaleString('en-NG')}`

/* ── icons (inline SVG, no extra deps) ── */
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

/* derived totals */
const subtotal = items.reduce(
(sum, item) => sum + parsePrice(item.price) * item.quantity,
0
)
const originalTotal = items.reduce(
(sum, item) =>
    sum + (item.oldPrice ? parsePrice(item.oldPrice) : parsePrice(item.price)) * item.quantity,
0
)
const discount = originalTotal - subtotal
const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

return (
<>
    {/* breadcrumb */}
    <nav className={styles.breadcrumb}>
    <Link className={styles.link} to="/">Home</Link>
    <span>→</span>
    <span>Cart</span>
    </nav>

    <div className={styles.page}>
    {/* back link */}
    

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
            {/* column labels */}
            <div className={styles.colLabels}>
                <span>Product details</span>
                <span>Price</span>
                <span>Quantity</span>
                <span>Total</span>
                <span></span>
            </div>

            {items.map((item) => {
                const unitPrice = parsePrice(item.price)
                const lineTotal = unitPrice * item.quantity

                return (
                <div key={item.name} className={styles.item}>
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
                        >
                        ‹
                        </button>
                        <span className={styles.qtyNum}>{item.quantity}</span>
                        <button
                        className={styles.stepBtn}
                        onClick={() => updateQuantity(item.name, 1)}
                        aria-label="Increase quantity"
                        >
                        ›
                        </button>
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
            <p className={styles.summarySubTitle}>Price Details</p>

            <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>{formatNaira(subtotal)}</span>
            </div>

            {/* discount — always visible, shows ₦ 0 when no old prices */}
            <div className={styles.summaryRow}>
              <span>Discount on Product</span>
              <span className={discount > 0 ? styles.discount : styles.discountZero}>
                {discount > 0 ? `-${formatNaira(discount)}` : formatNaira(0)}
              </span>
            </div>

            <div className={styles.summaryRow}>
            <span>Coupon Discount</span>
            <span className={styles.coupon}>Apply Coupon</span>
            </div>

            <hr style={{
                marginBlock:"1.5em"
            }} className={styles.divide} />

            <div className={styles.totalRow}>
            <span>Total Amount</span>
            <span>{formatNaira(subtotal)}</span>
            </div>
        </div>

        <button
            className={styles.confirmBtn}
            disabled={items.length === 0}
            onClick={() => alert('Checkout coming soon!')}
        >
            Confirm Order
        </button>

        <div className={styles.deliveryNote}>
           <TriangleAlert size={27} fill="#7f7f7f" color="#fff" strokeWidth={2}/>
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
