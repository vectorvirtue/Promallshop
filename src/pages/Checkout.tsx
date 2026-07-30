import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { TriangleAlert, CheckCircle2, X, Phone, Copy, Loader2 } from 'lucide-react'
import styles from './Checkout.module.css'
import paystackLogo from '../assets/download (1).png'
import flutterwaveLogo from '../assets/download.png'
import { ordersApi, markAsOrdered, cartApi, deliveryCostApi, type DeliveryCost } from '../lib/api'

/* ── Paystack inline SDK type ── */
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string
        email: string
        amount: number
        currency?: string
        ref?: string
        metadata?: Record<string, unknown>
        callback: (response: { reference: string }) => void
        onClose: () => void
      }) => { openIframe: () => void }
    }
    /* ── Flutterwave inline SDK type ── */
    FlutterwaveCheckout: (options: {
      public_key: string
      tx_ref: string
      amount: number
      currency: string
      payment_options?: string
      customer: {
        email: string
        phone_number?: string
        name?: string
      }
      customizations?: {
        title?: string
        description?: string
        logo?: string
      }
      meta?: Record<string, unknown>
      callback: (response: { transaction_id: number; tx_ref: string; flw_ref: string; status: string }) => void
      onclose: () => void
    }) => void
  }
}
/* ── helpers ── */
const parsePrice = (str: string): number =>
  parseFloat(str.replace(/[^0-9.]/g, '')) || 0

const formatNaira = (amount: number): string =>
  `₦ ${amount.toLocaleString('en-NG')}`

/* ── types ── */
interface AddressForm {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
  state: string
  country: string
  additionalInfo: string
}

type DeliveryType = 'pickup' | 'door'
type PaymentMethod = 'bank' | 'cheque' | 'paystack' | 'flutterwave'


const REGIONS: Record<string, string[]> = {
  Nigeria: [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
    'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
    'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
    'FCT (Abuja)',
  ],
}

const STEPS = [
  { number: 1, label: 'Customer Address' },
  { number: 2, label: 'Delivery Details' },
  { number: 3, label: 'Payment Method' },
]

export default function Checkout() {
  const { items: allItems, clearCart } = useCart()
  const navigate = useNavigate()

  /* ── filter to only selected items from Cart (falls back to all if none stored) ── */
  const items = (() => {
    try {
      const raw = sessionStorage.getItem('checkout_selected')
      if (!raw) return allItems
      const selected: string[] = JSON.parse(raw)
      if (!selected.length) return allItems
      return allItems.filter(i => selected.includes(i.name))
    } catch {
      return allItems
    }
  })()

  const [step, setStep] = useState(1)

  /* load Paystack script as soon as checkout mounts — ready before step 3 */
  useEffect(() => {
    if (!document.querySelector('script[src*="paystack"]')) {
      const s = document.createElement('script')
      s.src = 'https://js.paystack.co/v1/inline.js'
      s.async = true
      document.body.appendChild(s)
    }
    if (!document.querySelector('script[src*="flutterwave"]')) {
      const s = document.createElement('script')
      s.src = 'https://checkout.flutterwave.com/v3.js'
      s.async = true
      document.body.appendChild(s)
    }
  }, [])

  /* helper: wait until window.PaystackPop is available (max ~5 s) */
  const waitForPaystack = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if (window.PaystackPop) { resolve(); return }
      let attempts = 0
      const iv = setInterval(() => {
        attempts++
        if (window.PaystackPop) { clearInterval(iv); resolve() }
        else if (attempts > 50) { clearInterval(iv); reject(new Error('Paystack SDK failed to load')) }
      }, 100)
    })

  /* helper: wait until window.FlutterwaveCheckout is available (max ~5 s) */
  const waitForFlutterwave = (): Promise<void> =>
    new Promise((resolve, reject) => {
      if ((window as unknown as Record<string, unknown>).FlutterwaveCheckout) { resolve(); return }
      let attempts = 0
      const iv = setInterval(() => {
        attempts++
        if ((window as unknown as Record<string, unknown>).FlutterwaveCheckout) { clearInterval(iv); resolve() }
        else if (attempts > 50) { clearInterval(iv); reject(new Error('Flutterwave SDK failed to load')) }
      }, 100)
    })

  /* address state */
  const [address, setAddress] = useState<AddressForm>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    state: '',
    country: 'Nigeria',
    additionalInfo: '',
  })

  /* delivery state */
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('pickup')
  const [pickupLocation, setPickupLocation] = useState('')

  /* payment state */
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank')

  /* ── delivery cost state ── */
  const [allDeliveryCosts, setAllDeliveryCosts] = useState<DeliveryCost[]>([])
  const [deliveryCostData, setDeliveryCostData] = useState<DeliveryCost | null>(null)
  const [deliveryCostLoading, setDeliveryCostLoading] = useState(false)

  /* fetch all delivery cost records once on mount */
  useEffect(() => {
    setDeliveryCostLoading(true)
    deliveryCostApi
      .get()
      .then((res) => setAllDeliveryCosts(res.data ?? []))
      .catch(() => setAllDeliveryCosts([]))
      .finally(() => setDeliveryCostLoading(false))
  }, [])

  /* ── pick the best delivery cost record based on state + cart item names ──
     Matching strategy (uses record `name` field):
     1. Determine zone: "LAGOS" if state is Lagos, "OUTSIDE LAGOS" otherwise
     2. Filter records by zone keyword in name
     3. Try to match a category keyword from item names
     4. Fall back to DEFAULT if nothing matches                              */
  useEffect(() => {
    if (!allDeliveryCosts.length) return   // wait for fetch to complete

    // no state selected yet — use DEFAULT as placeholder
    if (!address.state) {
      const def =
        allDeliveryCosts.find(d => d.name.toUpperCase() === 'DEFAULT') ??
        allDeliveryCosts[0]
      setDeliveryCostData(def)
      return
    }

    const upper = (n: string) => n.toUpperCase()
    const isLagos = address.state.toLowerCase() === 'lagos'

    // records that match the delivery zone
    const zoneRecords = allDeliveryCosts.filter(d => {
      const n = upper(d.name)
      return isLagos
        ? n.includes('LAGOS') && !n.includes('OUTSIDE LAGOS')
        : n.includes('OUTSIDE LAGOS')
    })

    // keywords extracted from cart item names (joined, uppercased)
    const cartText = items.map(i => i.name.toUpperCase()).join(' ')

    // category keyword priority order — most specific first
    const categoryKeywords: [string, string][] = [
      ['SCREEN', 'SCREEN'],
      ['VIDEO WALL', 'VIDEO WALL'],
      ['VIDEO-CONF', 'VIDEO-CONF'],
      ['HEADSET', 'MOUSE,KEYBOARD,HEADSET'],
      ['WEBCAM', 'MOUSE,KEYBOARD,HEADSET'],
      ['KEYBOARD', 'MOUSE,KEYBOARD,HEADSET'],
      ['MOUSE', 'MOUSE,KEYBOARD,HEADSET'],
      ['PHONE', 'MOUSE,KEYBOARD,HEADSET'],
      ['KIT', 'KITS'],
      ['ROBOTIC', 'VIDEO-CONF'],
      ['ACCESSORIES', 'ACCESSORIES'],
      ['ACCESSORY', 'ACCESSORIES'],
    ]

    let matched: DeliveryCost | null = null

    for (const [cartKeyword, deliveryKeyword] of categoryKeywords) {
      if (cartText.includes(cartKeyword)) {
        matched = zoneRecords.find(d => upper(d.name).includes(deliveryKeyword)) ?? null
        if (matched) break
      }
    }

    // fall back: first zone record → DEFAULT → first record overall
    if (!matched) {
      matched =
        zoneRecords[0] ??
        allDeliveryCosts.find(d => upper(d.name) === 'DEFAULT') ??
        allDeliveryCosts[0]
    }

    setDeliveryCostData(matched ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDeliveryCosts, address.state, address.country])

  /* compute actual delivery fee:
     - 0 for pickup
     - base amount covers up to quantity_to items
     - extra_unit_charge applies per item beyond quantity_to */
  const totalItemQty = items.reduce((s, i) => s + i.quantity, 0)
  const deliveryFee = (() => {
    if (deliveryType === 'pickup') return 0
    if (!deliveryCostData) return 0
    const base = parseFloat(deliveryCostData.amount) || 0
    const extra = Math.max(0, totalItemQty - (deliveryCostData.quantity_to || 1)) * (deliveryCostData.extra_unit_charge || 0)
    return base + extra
  })()

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
  const VAT_RATE = 7.5
  const vatCharge = parseFloat(((subtotal * VAT_RATE) / 100).toFixed(2))
  const netAmount = parseFloat((subtotal + vatCharge).toFixed(2))
  /* grand total charged to the payment gateway = products + VAT + delivery */
  const grandTotal = parseFloat((netAmount + deliveryFee).toFixed(2))

  const [orderLoading, setOrderLoading] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderConfirmed, setOrderConfirmed] = useState<{
    billNo: string
    paymentMethod: string
    amount: string
    phone: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const copyAccNumber = () => {
    navigator.clipboard.writeText('2178278911')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleAddressChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setAddress((prev) => ({
      ...prev,
      [name]: value,
      // reset region when country changes
      ...(name === 'country' ? { state: '' } : {}),
    }))
  }

  const isAddressValid =
    address.firstName.trim() &&
    address.lastName.trim() &&
    address.phone.trim() &&
    address.email.trim() &&
    address.address.trim() &&
    address.state.trim()

  const handlePlaceOrder = async () => {
    setOrderError('')
    setOrderLoading(true)

    try {
      // build billing address string for the order
      const billingAddressStr = deliveryType === 'door'
        ? `${address.address}, ${address.state}, ${address.country}`
        : pickupLocation

      const orderPayload = {
        billing_address: billingAddressStr,
        billing_address1: address.address,
        billing_address2: address.additionalInfo || '',
        city: address.state,
        state: address.state,
        country: address.country,
        zipcode: '',
        delivery_method: deliveryType === 'door' ? 'home_delivery' : 'pickup',
        gross_amount: String(subtotal),
        payment_type: paymentMethod === 'bank' ? 'bank_transfer'
          : paymentMethod === 'cheque' ? 'cheque'
          : paymentMethod === 'paystack' ? 'paystack'
          : 'flutterwave',
        vat_charge_rate: String(VAT_RATE),
        vat_charge: String(vatCharge),
        net_amount: String(grandTotal),
        discount: String(discount),
        name: `${address.firstName} ${address.lastName}`,
        phone: address.phone,
        email: address.email,
        delivery_cost: deliveryFee,
      }

      if (paymentMethod === 'paystack') {
        // ── Paystack ──
        await waitForPaystack()

        const handler = window.PaystackPop.setup({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
          email: address.email,
          amount: grandTotal * 100, // kobo
          currency: 'NGN',
          ref: `promallshop-${Date.now()}`,
          metadata: {
            custom_fields: [
              { display_name: 'Customer Name', variable_name: 'customer_name', value: `${address.firstName} ${address.lastName}` },
              { display_name: 'Delivery', variable_name: 'delivery', value: billingAddressStr },
            ],
          },
          callback(response) {
            ordersApi
              .create({ ...orderPayload, payment_ref: response.reference })
              .then((orderRes) => {
                const res = orderRes as { data?: { bill_no?: string } }
                markAsOrdered()
                clearCart()
                sessionStorage.removeItem('checkout_selected')
                cartApi.clear().catch(() => { /* ignore */ })
                navigate(`/order-success?ref=${response.reference}&bill=${res?.data?.bill_no ?? ''}`)
              })
              .catch((err) => {
                setOrderError(err instanceof Error ? err.message : 'Order creation failed after payment.')
                setOrderLoading(false)
              })
          },
          onClose() {
            setOrderLoading(false)
          },
        })
        handler.openIframe()

      } else if (paymentMethod === 'flutterwave') {
        // ── Flutterwave ──
        await waitForFlutterwave()

        const txRef = `promallshop-flw-${Date.now()}`

        window.FlutterwaveCheckout({
          public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY as string,
          tx_ref: txRef,
          amount: grandTotal,
          currency: 'NGN',
          payment_options: 'card, banktransfer, ussd, mobilemoneyghana, mobilemoneyuganda',
          customer: {
            email: address.email,
            phone_number: address.phone,
            name: `${address.firstName} ${address.lastName}`,
          },
          customizations: {
            title: 'Promallshop',
            description: 'Order payment',
          },
          meta: {
            delivery: billingAddressStr,
          },
          callback(response) {
            if (response.status === 'successful' || response.status === 'completed') {
              ordersApi
                .create({ ...orderPayload, payment_ref: response.tx_ref })
                .then((orderRes) => {
                  const res = orderRes as { data?: { bill_no?: string } }
                  markAsOrdered()
                  clearCart()
                  sessionStorage.removeItem('checkout_selected')
                  cartApi.clear().catch(() => { /* ignore */ })
                  navigate(`/order-success?ref=${response.tx_ref}&bill=${res?.data?.bill_no ?? ''}`)
                })
                .catch((err) => {
                  setOrderError(err instanceof Error ? err.message : 'Order creation failed after payment.')
                  setOrderLoading(false)
                })
            } else {
              setOrderError('Payment was not completed. Please try again.')
              setOrderLoading(false)
            }
          },
          onclose() {
            setOrderLoading(false)
          },
        })
      } else {
        // bank transfer or cheque — create order and show confirmation popup
        const orderRes = await ordersApi.create(orderPayload) as { data?: { bill_no?: string } }
        console.log('Order created:', orderRes)
        markAsOrdered()
        clearCart()
        sessionStorage.removeItem('checkout_selected')
        // also clear backend cart
        try { await cartApi.clear() } catch { /* ignore */ }
        setOrderConfirmed({
          billNo: orderRes?.data?.bill_no ?? 'N/A',
          paymentMethod,
          amount: formatNaira(grandTotal),
          phone: address.phone,
        })
      }
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to place order. Please try again.')
    } finally {
      setOrderLoading(false)
    }
  }

  /* ── step indicator ── */
  const StepIndicator = () => (
    <div className={styles.steps}>
      {STEPS.map((s) => (
        <div
          key={s.number}
          className={`${styles.step} ${step === s.number ? styles.stepActive : ''} ${step > s.number ? styles.stepDone : ''}`}
        >
          <div className={styles.stepCircle}>
            {step > s.number ? <CheckCircle2 size={16} /> : s.number}
          </div>
          <span className={styles.stepLabel}>{s.label}</span>
          {s.number < STEPS.length && <div className={styles.stepLine} />}
        </div>
      ))}
    </div>
  )

  /* ── order summary panel (reused across all steps) ── */
  const OrderSummary = () => (
    <div className={styles.summary}>
      <h3 className={styles.summaryTitle}>Order Summary</h3>
      <hr className={styles.divide} />

      <div className={styles.summaryInner}>
        <p className={styles.summarySubTitle}>Price Details</p>

        {items.map((item) => (
          <div key={item.name} className={styles.summaryItem}>
            <div className={styles.summaryItemImg}>
              <img src={item.img} alt={item.name} />
            </div>
            <div className={styles.summaryItemInfo}>
              <span className={styles.summaryItemName}>{item.name}</span>
              <span className={styles.summaryItemQty}>Qty: {item.quantity}</span>
            </div>
            <span className={styles.summaryItemPrice}>
              {formatNaira(parsePrice(item.price) * item.quantity)}
            </span>
          </div>
        ))}

        <hr className={styles.divide} style={{ marginBlock: '1em' }} />

        <div className={styles.summaryRow}>
          <span>Subtotal</span>
          <span>{formatNaira(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className={styles.summaryRow}>
            <span>Discount</span>
            <span className={styles.discountText}>-{formatNaira(discount)}</span>
          </div>
        )}

        <div className={styles.summaryRow}>
          <span>Coupon Discount</span>
          <span className={styles.couponText}>Apply Coupon</span>
        </div>

        <div className={styles.summaryRow}>
          <span>Delivery Fee</span>
          <span>
            {deliveryCostLoading
              ? <Loader2 size={13} className={styles.spinIcon} />
              : deliveryType === 'pickup'
                ? <span style={{ color: '#41e693', fontWeight: 700 }}>Free (Pickup)</span>
                : deliveryCostData
                  ? formatNaira(deliveryFee)
                  : address.state
                    ? <span style={{ color: '#e07b00', fontSize: '0.9em' }}>Contact us for delivery fee</span>
                    : <span style={{ color: '#aaa' }}>Select state first</span>
            }
          </span>
        </div>

        {deliveryType === 'door' && deliveryCostData && (
          <div className={styles.summaryRow} style={{ fontSize: '0.72em', color: '#888' }}>
            <span>Est. delivery</span>
            <span>{deliveryCostData.min_delivery_period}–{deliveryCostData.max_delivery_period} days</span>
          </div>
        )}
        {deliveryType === 'door' && deliveryCostData && (
          <div className={styles.summaryRow} style={{ fontSize: '0.68em', color: '#aaa' }}>
            <span style={{ fontStyle: 'italic' }}>{deliveryCostData.name}</span>
          </div>
        )}

        <hr className={styles.divide} style={{ marginBlock: '1em' }} />

        <div className={styles.totalRow}>
          <span>Total Amount</span>
          <span>{formatNaira(grandTotal)}</span>
        </div>
      </div>

      {step < 3 && (
        <button
          className={styles.confirmBtn}
          disabled={items.length === 0}
          onClick={() => setStep((s) => Math.min(s + 1, 3))}
        >
          Continue to Next Step
        </button>
      )}

      {step === 3 && (
        <button
          className={styles.confirmBtn}
          onClick={handlePlaceOrder}
        >
          Place Order
        </button>
      )}

      <div className={styles.deliveryNote}>
        <TriangleAlert size={22} fill="#7f7f7f" color="#fff" strokeWidth={2} />
        <span>VAT ({VAT_RATE}%) included in total</span>
      </div>
    </div>
  )

  return (
    <>
      {/* breadcrumb */}
      <nav className={styles.breadcrumb}>
        <Link className={styles.link} to="/">Home</Link>
        <span>→</span>
        <Link className={styles.link} to="/cart">Cart</Link>
        <span>→</span>
        <span>Checkout</span>
      </nav>

      <div className={styles.page}>
        <StepIndicator />

        <div className={styles.layout}>
          {/* ── LEFT PANEL ── */}
          <div className={styles.leftPanel}>

            {/* ── STEP 1: Customer address ── */}
            {step === 1 && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={styles.stepBadge}>1</span>
                  <h2 className={styles.cardTitle}>Customer Address</h2>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>First Name</label>
                    <input
                      className={styles.input}
                      name="firstName"
                      value={address.firstName}
                      onChange={handleAddressChange}
                      placeholder="Faith"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Last Name</label>
                    <input
                      className={styles.input}
                      name="lastName"
                      value={address.lastName}
                      onChange={handleAddressChange}
                      placeholder="Amaugo"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Phone Number</label>
                    <input
                      className={styles.input}
                      name="phone"
                      type="tel"
                      value={address.phone}
                      onChange={handleAddressChange}
                      placeholder="+234 000 000 0000"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Email</label>
                    <input
                      className={styles.input}
                      name="email"
                      type="email"
                      value={address.email}
                      onChange={handleAddressChange}
                      placeholder="faith@example.com"
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Address</label>
                    <input
                      className={styles.input}
                      name="address"
                      value={address.address}
                      onChange={handleAddressChange}
                      placeholder="5B Adedeji Close, Opebi Ikeja, Lagos."
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Country</label>
                    <input
                      className={styles.input}
                      value="Nigeria"
                      readOnly
                      style={{ background: '#f5f5f5', color: '#888', cursor: 'default' }}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>State / Region</label>
                    <select
                      className={styles.input}
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                    >
                      <option value="">Select State / Region</option>
                      {(REGIONS[address.country] || []).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Additional Information (Optional)</label>
                    <textarea
                      className={`${styles.input} ${styles.textarea}`}
                      name="additionalInfo"
                      value={address.additionalInfo}
                      onChange={handleAddressChange}
                      placeholder="Any other address info or delivery notes..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className={styles.stepNav}>
                  <button className={styles.backBtn} onClick={() => navigate('/cart')}>
                    ← Back to Cart
                  </button>
                  <button
                    className={styles.nextBtn}
                    disabled={!isAddressValid}
                    onClick={() => setStep(2)}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Delivery details ── */}
            {step === 2 && (
              <div className={styles.card}>
                {/* confirmed address summary */}
                <div className={styles.confirmedBanner}>
                  <div className={styles.cardHeader}>
                    <span className={styles.stepBadge}>1</span>
                    <h2 className={styles.cardTitle}>Customer Address</h2>
                    <CheckCircle2 className={styles.doneIcon} size={20} />
                  </div>
                  <p className={styles.confirmedText}>
                    {address.firstName} {address.lastName} &nbsp;·&nbsp;
                    {address.phone} &nbsp;·&nbsp; {address.address}, {address.state}
                  </p>
                  <button className={styles.editLink} onClick={() => setStep(1)}>Edit</button>
                </div>

                <div className={styles.cardHeader} style={{ marginTop: '1.5em' }}>
                  <span className={styles.stepBadge}>2</span>
                  <h2 className={styles.cardTitle}>Delivery Details</h2>
                </div>

                <div className={styles.radioGroup}>
                  <label className={`${styles.radioCard} ${deliveryType === 'pickup' ? styles.radioCardActive : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={() => setDeliveryType('pickup')}
                    />
                    <div>
                      <span className={styles.radioLabel}>Pickup Delivery</span>
                      <span className={styles.radioSub}>Pick up from our store</span>
                    </div>
                  </label>

                  <label className={`${styles.radioCard} ${deliveryType === 'door' ? styles.radioCardActive : ''}`}>
                    <input
                      type="radio"
                      name="delivery"
                      value="door"
                      checked={deliveryType === 'door'}
                      onChange={() => setDeliveryType('door')}
                    />
                    <div>
                      <span className={styles.radioLabel}>Door Delivery</span>
                      <span className={styles.radioSub}>Delivered to your address</span>
                    </div>
                  </label>
                </div>

                {deliveryType === 'pickup' && (
                  <div className={styles.formGroup} style={{ marginTop: '1em' }}>
                    <label className={styles.label}>Pickup Location</label>
                    <select
                      className={styles.input}
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                    >
                      <option value="">Select pickup location</option>
                      <option value="Promallshop — 5B Adedeji Close, Opebi Ikeja, Lagos">
                        Promallshop — 5B Adedeji Close, Opebi Ikeja, Lagos
                      </option>
                    </select>
                  </div>
                )}

                {deliveryType === 'door' && (
                  <div className={styles.infoBox}>
                    <p>Your order will be delivered to:</p>
                    <strong>{address.address}, {address.state}</strong>
                  </div>
                )}

                <div className={styles.stepNav}>
                  <button className={styles.backBtn} onClick={() => setStep(1)}>
                    ← Back
                  </button>
                  <button
                    className={styles.nextBtn}
                    disabled={deliveryType === 'pickup' && !pickupLocation}
                    onClick={() => setStep(3)}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Payment method ── */}
            {step === 3 && (
              <div className={styles.card}>
                {/* address summary */}
                <div className={styles.confirmedBanner}>
                  <div className={styles.cardHeader}>
                    <span className={styles.stepBadge}>1</span>
                    <h2 className={styles.cardTitle}>Customer Address</h2>
                    <CheckCircle2 className={styles.doneIcon} size={20} />
                  </div>
                  <p className={styles.confirmedText}>
                    {address.firstName} {address.lastName} &nbsp;·&nbsp;
                    {address.phone} &nbsp;·&nbsp; {address.address}, {address.state}
                  </p>
                  <button className={styles.editLink} onClick={() => setStep(1)}>Edit</button>
                </div>

                {/* delivery summary */}
                <div className={styles.confirmedBanner} style={{ marginTop: '0.75em' }}>
                  <div className={styles.cardHeader}>
                    <span className={styles.stepBadge}>2</span>
                    <h2 className={styles.cardTitle}>Delivery Details</h2>
                    <CheckCircle2 className={styles.doneIcon} size={20} />
                  </div>
                  <p className={styles.confirmedText}>
                    {deliveryType === 'pickup'
                      ? `Pickup — ${pickupLocation}`
                      : `Door Delivery — ${address.address}, ${address.state}`}
                  </p>
                  <button className={styles.editLink} onClick={() => setStep(2)}>Edit</button>
                </div>

                <div className={styles.cardHeader} style={{ marginTop: '1.5em' }}>
                  <span className={styles.stepBadge}>3</span>
                  <h2 className={styles.cardTitle}>Payment Method</h2>
                </div>

                <div className={styles.paymentOptions}>
                  {/* Direct Bank Transfer */}
                  <label className={`${styles.paymentCard} ${paymentMethod === 'bank' ? styles.paymentCardActive : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === 'bank'}
                      onChange={() => setPaymentMethod('bank')}
                    />
                    <div className={styles.paymentInfo}>
                      <span className={styles.paymentLabel}>Direct Bank Transfer</span>
                      <span className={styles.paymentDetail}>Account Name: Promallshop</span>
                      <span className={styles.paymentDetail}>Account Number: 2178278911</span>
                      <span className={styles.paymentDetail}>Bank: Zenith Bank PLC</span>
                    </div>
                    <div className={styles.paymentIcon}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f18e1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
                      </svg>
                    </div>
                  </label>

                  {/* Cheque Payment */}
                  <label className={`${styles.paymentCard} ${paymentMethod === 'cheque' ? styles.paymentCardActive : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cheque"
                      checked={paymentMethod === 'cheque'}
                      onChange={() => setPaymentMethod('cheque')}
                    />
                    <div className={styles.paymentInfo}>
                      <span className={styles.paymentLabel}>Cheque Payment</span>
                      <span className={styles.paymentDetail}>Account Name: Promallshop</span>
                      <span className={styles.paymentDetail}>Account Number: 2178278911</span>
                      <span className={styles.paymentDetail}>Bank: Zenith Bank PLC</span>
                    </div>
                    <div className={styles.paymentIcon}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                      </svg>
                    </div>
                  </label>

                  {/* Paystack */}
                  <label className={`${styles.paymentCard} ${paymentMethod === 'paystack' ? styles.paymentCardActive : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="paystack"
                      checked={paymentMethod === 'paystack'}
                      onChange={() => setPaymentMethod('paystack')}
                    />
                    <div className={styles.paymentInfo}>
                      <span className={styles.paymentLabel}>Pay with Paystack</span>
                      <span className={styles.paymentDetail}>Cards, bank transfer & USSD</span>
                    </div>
                    <div className={styles.cardLogos}>
                      <img src={paystackLogo} alt="Paystack" className={styles.gatewayLogo} />
                    </div>
                  </label>

                  {/* Flutterwave */}
                  <label className={`${styles.paymentCard} ${paymentMethod === 'flutterwave' ? styles.paymentCardActive : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="flutterwave"
                      checked={paymentMethod === 'flutterwave'}
                      onChange={() => setPaymentMethod('flutterwave')}
                    />
                    <div className={styles.paymentInfo}>
                      <span className={styles.paymentLabel}>Pay with Flutterwave</span>
                      <span className={styles.paymentDetail}>Cards, mobile money & more</span>
                    </div>
                    <div className={styles.cardLogos}>
                      <img src={flutterwaveLogo} alt="Flutterwave" className={styles.gatewayLogo} />
                    </div>
                  </label>
                </div>

                <div className={styles.stepNav}>
                  <button className={styles.backBtn} onClick={() => setStep(2)}>
                    Cancel
                  </button>
                  <button className={styles.nextBtn} onClick={handlePlaceOrder} disabled={orderLoading}>
                    {orderLoading ? 'Placing Order…' : 'Confirm Payment Method'}
                  </button>
                </div>
                {orderError && (
                  <p style={{ color: '#c0392b', fontSize: '0.82em', marginTop: '0.75em', textAlign: 'center' }}>
                    {orderError}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Order summary ── */}
          <OrderSummary />
        </div>
      </div>
      {/* ── ORDER CONFIRMED POPUP ── */}
      {orderConfirmed && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <button className={styles.popupClose} onClick={() => navigate('/')} aria-label="Close">
              <X size={20} />
            </button>

            {/* header */}
            <div className={styles.popupHeader}>
              <CheckCircle2 size={48} color="#2ecc71" strokeWidth={1.5} />
              <h2 className={styles.popupTitle}>Order Confirmed!</h2>
              <p className={styles.popupSubtitle}>
                Your order has been received and is <strong>pending payment confirmation</strong>.
              </p>
            </div>

            {/* order details */}
            <div className={styles.popupDetails}>
              <div className={styles.popupRow}>
                <span>Order Number</span>
                <span className={styles.popupValue}>{orderConfirmed.billNo}</span>
              </div>
              <div className={styles.popupRow}>
                <span>Amount Due</span>
                <span className={styles.popupValue}>{orderConfirmed.amount}</span>
              </div>
              <div className={styles.popupRow}>
                <span>Payment Method</span>
                <span className={styles.popupValue}>
                  {orderConfirmed.paymentMethod === 'bank' ? 'Direct Bank Transfer' : 'Cheque Payment'}
                </span>
              </div>
              <div className={styles.popupRow}>
                <span>Your Phone</span>
                <span className={styles.popupValue}>{orderConfirmed.phone}</span>
              </div>
            </div>

            {/* bank details */}
            <div className={styles.popupBank}>
              <p className={styles.popupBankTitle}>Transfer to:</p>
              <div className={styles.popupBankRow}>
                <span>Account Name</span>
                <strong>Promallshop</strong>
              </div>
              <div className={styles.popupBankRow}>
                <span>Account Number</span>
                <span className={styles.popupAccNum}>
                  2178278911
                  <button className={styles.copyBtn} onClick={copyAccNumber} title="Copy">
                    {copied ? <CheckCircle2 size={14} color="#2ecc71" /> : <Copy size={14} />}
                  </button>
                </span>
              </div>
              <div className={styles.popupBankRow}>
                <span>Bank</span>
                <strong>Zenith Bank PLC</strong>
              </div>
            </div>

            {/* instructions */}
            <div className={styles.popupNote}>
              <Phone size={15} />
              <p>
                After making the transfer, please call or WhatsApp us at{' '}
                <a href="tel:+2347032647755" className={styles.popupPhone}>+234 703 264 7755</a>{' '}
                with your phone number <strong>{orderConfirmed.phone}</strong> and order number{' '}
                <strong>{orderConfirmed.billNo}</strong> to confirm your payment.
                Your order status will be updated to <strong>Paid</strong> once confirmed.
              </p>
            </div>

            <button className={styles.popupDoneBtn} onClick={() => { clearCart(); navigate('/') }}>
              Done — Back to Home
            </button>
          </div>
        </div>
      )}
    </>
  )
}
