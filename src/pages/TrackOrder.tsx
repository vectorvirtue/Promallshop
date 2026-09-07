import { useState } from 'react'
import styles from '../legal/TOU.module.css'
import { Link } from 'react-router-dom';
import pana from '../assets/pana.svg'

const API = import.meta.env.VITE_PUBLIC_API_URL as string

interface OrderData {
  id: number
  bill_no: string
  status: string
  name: string
  email: string
  phone: string
  date_time: string
  gross_amount: string
  net_amount: string
  payment_type: string
  paid_status: number
  billing_address: string
  delivery_cost: number
  vat_charge: string
  transaction_charge: number
}

export default function OrderTracking() {
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [error, setError] = useState('')

  const handleTrackOrder = async () => {
    if (!orderId.trim()) {
      setError('Please enter an Order ID (e.g., INV202609040001)')
      return
    }

    setLoading(true)
    setError('')
    setOrderData(null)

    try {
      // Get token from localStorage or sessionStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      
      if (!token) {
        setError('Please login to track your order')
        setLoading(false)
        return
      }

      // Try getting order by bill number with auth
      const response = await fetch(`${API}/orders/bill/${orderId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        }
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please login to track your order')
        }
        throw new Error(result.message || 'Order not found')
      }

      // API might wrap data in a data property
      const data = result.data || result
      setOrderData(data)
    } catch (err) {
      console.error('Track order error:', err)
      setError(err instanceof Error ? err.message : 'Order not found. Please check your Order ID.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#ffa500'
      case 'processing': return '#007bff'
      case 'shipped': return '#17a2b8'
      case 'delivered': return '#28a745'
      case 'cancelled': return '#dc3545'
      default: return '#6c757d'
    }
  }

  const getStatusText = (status: string) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown'
  }

  return (
   <>
    <nav className={styles.breadcrumb}>
            <Link className={styles.link} to="/">Home</Link><span>→</span>
            <span>Track Order</span>
           
          </nav>
          <div className={styles.tocenter}>
           
           <div className={styles.details}>
             <h2>Track An Order</h2>
            <p className={styles.sub}>Enter Your Order ID</p>
            <div className={styles.inputfield}>
            <input 
              className={styles.trackinput} 
              type="text" 
              placeholder='Order ID (e.g., INV202609040001)' 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
            />
           <button 
             className={styles.trackbtn}
             onClick={handleTrackOrder}
             disabled={loading}
           >
             {loading ? 'Tracking...' : 'Track Order'}
           </button>
            </div>

            {error && (
              <div style={{ 
                color: '#dc3545', 
                marginTop: '1em', 
                padding: '0.75em',
                background: '#f8d7da',
                borderRadius: '4px',
                border: '1px solid #f5c6cb'
              }}>
                ⚠️ {error}
              </div>
            )}

            {orderData && (
              <div style={{ 
                marginTop: '2em', 
                padding: '1.5em', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1em',
                  paddingBottom: '1em',
                  borderBottom: '2px solid #dee2e6'
                }}>
                  <h3 style={{ margin: 0 }}>Order Details</h3>
                  <span style={{ 
                    padding: '0.5em 1em', 
                    background: getStatusColor(orderData.status),
                    color: 'white',
                    borderRadius: '20px',
                    fontWeight: 'bold',
                    fontSize: '0.9em'
                  }}>
                    {getStatusText(orderData.status)}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '0.75em' }}>
                  <div><strong>Order ID:</strong> {orderData.bill_no}</div>
                  <div><strong>Customer:</strong> {orderData.name}</div>
                  <div><strong>Email:</strong> {orderData.email}</div>
                  <div><strong>Phone:</strong> {orderData.phone}</div>
                  <div><strong>Order Date:</strong> {new Date(orderData.date_time).toLocaleDateString('en-NG', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</div>
                  <div><strong>Payment Method:</strong> {orderData.payment_type.replace('_', ' ').toUpperCase()}</div>
                  <div><strong>Payment Status:</strong> {orderData.paid_status === 1 ? '✅ Paid' : '⏳ Pending'}</div>
                  <div style={{ marginTop: '0.5em', paddingTop: '0.75em', borderTop: '1px solid #dee2e6' }}>
                    <strong>Total Amount:</strong> ₦{Number(orderData.net_amount).toLocaleString('en-NG')}
                  </div>
                  {orderData.billing_address && (
                    <div style={{ marginTop: '0.5em', paddingTop: '0.75em', borderTop: '1px solid #dee2e6' }}>
                      <strong>Delivery Address:</strong><br />
                      {orderData.billing_address}
                    </div>
                  )}
                </div>
              </div>
            )}
            
           </div>
             {!orderData && <img className={styles.noorder} src={pana} alt="no order" />}
          </div>
   </>
  );
}