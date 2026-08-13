import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { quoteApi, type QuoteRequest } from '../lib/api'
import styles from './RequestQuoteModal.module.css'

interface RequestQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  productName: string
  productId: number | string
  productPrice: string
}

export default function RequestQuoteModal({
  isOpen,
  onClose,
  productName,
  productId,
  productPrice,
}: RequestQuoteModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
    quantity: 1,
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Math.max(1, parseInt(value) || 1) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.full_name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number')
      return
    }

    setLoading(true)

    try {
      const payload: QuoteRequest = {
        full_name: formData.full_name,
        company_name: formData.company_name,
        email: formData.email,
        phone: formData.phone,
        product_name: productName,
        product_id: productId,
        quantity: formData.quantity,
        message: formData.message,
      }

      await quoteApi.submit(payload)
      
      toast.success('Quote request submitted successfully! We will contact you shortly.')
      
      // Reset form and close modal
      setFormData({
        full_name: '',
        company_name: '',
        email: '',
        phone: '',
        quantity: 1,
        message: '',
      })
      onClose()
    } catch (error) {
      console.error('Quote request error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to submit quote request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 className={styles.title}>Request for Quote</h2>
              <button
                type="button"
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Product Info */}
            <div className={styles.productInfo}>
              <p className={styles.productName}>{productName}</p>
              <p className={styles.productPrice}>{productPrice}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGrid}>
                {/* Full Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="full_name" className={styles.label}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="John Doe"
                  />
                </div>

                {/* Company Name */}
                <div className={styles.formGroup}>
                  <label htmlFor="company_name" className={styles.label}>
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="Your Company Ltd"
                  />
                </div>

                {/* Email */}
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="john@example.com"
                  />
                </div>

                {/* Phone */}
                <div className={styles.formGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              </div>

              {/* Quantity */}
              <div className={styles.formGroup}>
                <label htmlFor="quantity" className={styles.label}>
                  Quantity Required <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                  className={styles.input}
                />
              </div>

              {/* Additional Message */}
              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>
                  Additional Requirements / Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={styles.textarea}
                  placeholder="Please provide any additional details or requirements..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? 'Submitting...' : 'Submit Quote Request'}
              </motion.button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
