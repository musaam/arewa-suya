import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'
import './CartPage.css'

export default function CartPage({ onCheckout }) {
  const navigate = useNavigate()
  const { items, totalPrice, totalItems } = useCart()
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [deliveryMethod, setDeliveryMethod] = useState('pickup')
  const [errors, setErrors] = useState({})

  const deliveryFee = deliveryMethod === 'delivery' ? 5.00 : 0
  const tax = totalPrice * 0.12
  const grandTotal = totalPrice + tax + deliveryFee

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length < 4) return digits
    if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
  }

  function handlePhoneChange(e) {
    const formatted = formatPhone(e.target.value)
    setCustomer((p) => ({ ...p, phone: formatted }))
    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }))
  }

  function validate() {
    const newErrors = {}
    if (!customer.name.trim()) {
      newErrors.name = 'Please enter your name'
    }
    if (!customer.email.trim()) {
      newErrors.email = 'Please enter your email'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (customer.phone.trim() && !/^(\+?1[\s\-.]?)?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}$/.test(customer.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (e.g. 416-555-1234)'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handlePlaceOrder() {
    if (validate()) {
      onCheckout(customer, { deliveryMethod, deliveryFee })
    }
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <div className="cart-empty-icon">☕</div>
          <h2>Your order is empty</h2>
          <p>Head back to the menu and add some items!</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Browse Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-content">
        <div className="cart-header">
          <h1>Your Order</h1>
          <span className="cart-item-count">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
        </div>

        <div className="cart-layout">
          {/* Items list */}
          <div className="cart-items-list">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
            <button className="add-more-btn" onClick={() => navigate('/')}>
              + Add more items
            </button>
          </div>

          {/* Right column: customer details + order summary */}
          <div className="cart-right">
            {/* Customer details */}
            <div className="customer-form">
              <h2>Your Details</h2>
              <div className={`form-field ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="customer-name">Name</label>
                <input
                  id="customer-name"
                  type="text"
                  placeholder="e.g. Alex"
                  value={customer.name}
                  onChange={(e) => {
                    setCustomer((p) => ({ ...p, name: e.target.value }))
                    if (errors.name) setErrors((p) => ({ ...p, name: '' }))
                  }}
                  autoComplete="given-name"
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
              <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="customer-email">Email</label>
                <input
                  id="customer-email"
                  type="email"
                  placeholder="e.g. alex@example.com"
                  value={customer.email}
                  onChange={(e) => {
                    setCustomer((p) => ({ ...p, email: e.target.value }))
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }))
                  }}
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
              <div className={`form-field ${errors.phone ? 'has-error' : ''}`}>
                <label htmlFor="customer-phone">Phone Number <span className="field-optional">(optional)</span></label>
                <input
                  id="customer-phone"
                  type="tel"
                  placeholder="(416) 555-1234"
                  value={customer.phone}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>
            </div>

            {/* Delivery method */}
            <div className="delivery-method">
              <h2>Order Type</h2>
              <div className="delivery-toggle">
                <button
                  className={`toggle-btn ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('pickup')}
                  type="button"
                >
                  Pickup
                </button>
                <button
                  className={`toggle-btn ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('delivery')}
                  type="button"
                >
                  Delivery
                </button>
              </div>
              {deliveryMethod === 'delivery' && (
                <p className="delivery-note">A $5.00 delivery fee will be added to your order.</p>
              )}
            </div>

            {/* Order summary */}
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-line">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span>Tax (12%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="summary-line">
                  <span>Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-line total">
                <span>Total</span>
                <span>${grandTotal.toFixed(2)}</span>
              </div>
              <button className="btn-primary checkout-btn" onClick={handlePlaceOrder}>
                Place Order
              </button>
              <button className="btn-secondary" onClick={() => navigate('/')}>
                ← Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
