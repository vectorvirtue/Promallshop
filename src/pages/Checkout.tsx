import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { TriangleAlert, CheckCircle2 } from 'lucide-react'
import styles from './Checkout.module.css'
import frame from '../assets/Frame 312.svg'

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
type PaymentMethod = 'bank' | 'cheque' | 'online'

const COUNTRIES: { value: string; label: string }[] = [
  { value: 'Nigeria', label: 'Nigeria' },
  { value: 'Ghana', label: 'Ghana' },
  { value: 'Kenya', label: 'Kenya' },
  { value: "Côte d'Ivoire", label: "Côte d'Ivoire" },
  { value: 'South Africa', label: 'South Africa' },
  { value: 'Tanzania', label: 'Tanzania' },
  { value: 'Senegal', label: 'Senegal' },
  { value: 'Ethiopia', label: 'Ethiopia' },
  { value: 'Cameroon', label: 'Cameroon' },
  { value: 'Uganda', label: 'Uganda' },
  { value: 'Rwanda', label: 'Rwanda' },
  { value: 'Angola', label: 'Angola' },
  { value: 'Zambia', label: 'Zambia' },
  { value: 'Zimbabwe', label: 'Zimbabwe' },
]

const REGIONS: Record<string, string[]> = {
  Nigeria: [
    'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
    'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','Gombe','Imo','Jigawa',
    'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger',
    'Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
    'FCT (Abuja)',
  ],
  Ghana: [
    'Ahafo','Ashanti','Bono','Bono East','Central','Eastern','Greater Accra',
    'North East','Northern','Oti','Savannah','Upper East','Upper West','Volta','Western','Western North',
  ],
  Kenya: [
    'Baringo','Bomet','Bungoma','Busia','Elgeyo-Marakwet','Embu','Garissa',
    'Homa Bay','Isiolo','Kajiado','Kakamega','Kericho','Kiambu','Kilifi',
    'Kirinyaga','Kisii','Kisumu','Kitui','Kwale','Laikipia','Lamu','Machakos',
    'Makueni','Mandera','Marsabit','Meru','Migori','Mombasa',"Murang'a",
    'Nairobi','Nakuru','Nandi','Narok','Nyamira','Nyandarua','Nyeri','Samburu',
    'Siaya','Taita-Taveta','Tana River','Tharaka-Nithi','Trans Nzoia','Turkana',
    'Uasin Gishu','Vihiga','Wajir','West Pokot',
  ],
  "Côte d'Ivoire": [
    'Abidjan','Bas-Sassandra','Comoé','Denguélé','Gôh-Djiboua','Lacs',
    'Lagunes','Montagnes','Sassandra-Marahoué','Savanes','Vallée du Bandama',
    'Woroba','Yamoussoukro','Zanzan',
  ]
}

const STEPS = [
  { number: 1, label: 'Customer Address' },
  { number: 2, label: 'Delivery Details' },
  { number: 3, label: 'Payment Method' },
]

export default function Checkout() {
  const { items } = useCart()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)

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

  const handlePlaceOrder = () => {
    if (paymentMethod === 'online') {
      // Paystack inline popup
      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string,
        email: address.email,
        // Paystack expects amount in kobo (smallest currency unit)
        amount: subtotal * 100,
        currency: 'NGN',
        ref: `promallshop-${Date.now()}`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: `${address.firstName} ${address.lastName}`,
            },
            {
              display_name: 'Delivery',
              variable_name: 'delivery',
              value: deliveryType === 'pickup' ? pickupLocation : `Door — ${address.address}, ${address.state}`,
            },
          ],
        },
        callback(response) {
          // Payment successful — reference is response.reference
          console.log('Payment successful, ref:', response.reference)
          navigate(`/order-success?ref=${response.reference}`)
        },
        onClose() {
          // User closed the popup without paying — stay on checkout
          console.log('Payment popup closed')
        },
      })
      handler.openIframe()
    } else {
      // Bank transfer or cheque — no payment gateway needed
      navigate('/')
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

        <hr className={styles.divide} style={{ marginBlock: '1em' }} />

        <div className={styles.totalRow}>
          <span>Total Amount</span>
          <span>{formatNaira(subtotal)}</span>
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
        <span>Delivery fees not included yet</span>
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
                      placeholder="John"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Last Name</label>
                    <input
                      className={styles.input}
                      name="lastName"
                      value={address.lastName}
                      onChange={handleAddressChange}
                      placeholder="Doe"
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
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                    <label className={styles.label}>Address</label>
                    <input
                      className={styles.input}
                      name="address"
                      value={address.address}
                      onChange={handleAddressChange}
                      placeholder="147 Pro Address, Off Example Road"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Country</label>
                    <select
                      className={styles.input}
                      name="country"
                      value={address.country}
                      onChange={handleAddressChange}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
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

                  {/* Pay Online */}
                  <label className={`${styles.paymentCard} ${paymentMethod === 'online' ? styles.paymentCardActive : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <div className={styles.paymentInfo}>
                      <span className={styles.paymentLabel}>Pay Online</span>
                    </div>
                    <div className={styles.cardLogos}>
                     <img src={frame} alt="" />
                    </div>
                  </label>
                </div>

                <div className={styles.stepNav}>
                  <button className={styles.backBtn} onClick={() => setStep(2)}>
                    Cancel
                  </button>
                  <button className={styles.nextBtn} onClick={handlePlaceOrder}>
                    Confirm Payment Method
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Order summary ── */}
          <OrderSummary />
        </div>
      </div>
    </>
  )
}
