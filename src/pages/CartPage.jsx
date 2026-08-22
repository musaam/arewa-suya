import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import CartItem from '../components/CartItem'
import './CartPage.css'

// Arewa Suya Spot pickup location
export const PICKUP_ADDRESS = 'Arewa Suya Spot, Winnipeg, MB'

export default function CartPage({ onCheckout }) {
  const navigate = useNavigate()
  const { items, totalPrice, totalItems } = useCart()
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' })
  const [deliveryMethod, setDeliveryMethod] = useState('pickup')
  const [orderDate, setOrderDate] = useState('')
  const [orderTime, setOrderTime] = useState('')
  const [address, setAddress] = useState('')
  const [errors, setErrors] = useState({})

  const deliveryFee = deliveryMethod === 'delivery' && address.trim() ? 5.00 : 0
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

  function getNextWeekendDates() {
    const dates = []
    const today = new Date()
    const d = new Date(today)
    for (let i = 0; i < 28; i++) {
      d.setDate(today.getDate() + i)
      const day = d.getDay()
      if (day === 0 || day === 6) {
        dates.push(new Date(d))
      }
    }
    return dates
  }

  const weekendDates = getNextWeekendDates()

  function formatDateOption(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const dayNum = date.getDate()
    return `${dayName}, ${month} ${dayNum}`
  }

  function formatDateValue(date) {
    return date.toISOString().split('T')[0]
  }

  const timeSlots = [
    '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM',
    '1:00 PM', '1:30 PM',
    '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM',
    '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM',
    '7:00 PM', '7:30 PM',
    '8:00 PM',
  ]

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
    if (!orderDate) {
      newErrors.orderDate = 'Please select a date'
    }
    if (!orderTime) {
      newErrors.orderTime = 'Please select a time'
    }
    if (deliveryMethod === 'delivery' && !address.trim()) {
      newErrors.address = 'Please enter your delivery address'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handlePlaceOrder() {
    if (validate()) {
      onCheckout(customer, {
        deliveryMethod,
        deliveryFee,
        orderDate,
        orderTime,
        address: deliveryMethod === 'delivery' ? address.trim() : '',
        pickupAddress: deliveryMethod === 'pickup' ? PICKUP_ADDRESS : '',
      })
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
                <div className={`form-field delivery-address-field ${errors.address ? 'has-error' : ''}`}>
                  <label htmlFor="delivery-address">Delivery Address</label>
                  <textarea
                    id="delivery-address"
                    placeholder="Street address, unit/apt, city, postal code"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value)
                      if (errors.address) setErrors((p) => ({ ...p, address: '' }))
                    }}
                    rows={3}
                    autoComplete="street-address"
                  />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>
              )}

              {deliveryMethod === 'delivery' && address.trim() && (
                <p className="delivery-note">A $5.00 delivery fee has been added to your order.</p>
              )}

              {deliveryMethod === 'pickup' && (
                <div className="pickup-address">
                  <span className="pickup-address-label">📍 Pickup Location</span>
                  <span className="pickup-address-value">{PICKUP_ADDRESS}</span>
                </div>
              )}
            </div>

            {/* Date & Time selection */}
            <div className="datetime-section">
              <h2>{deliveryMethod === 'pickup' ? 'Pickup' : 'Delivery'} Date &amp; Time</h2>
              <p className="datetime-note">We prepare fresh suya on weekends only (Saturday &amp; Sunday).</p>
              <div className={`form-field ${errors.orderDate ? 'has-error' : ''}`}>
                <label htmlFor="order-date">Date</label>
                <select
                  id="order-date"
                  value={orderDate}
                  onChange={(e) => {
                    setOrderDate(e.target.value)
                    if (errors.orderDate) setErrors((p) => ({ ...p, orderDate: '' }))
                  }}
                >
                  <option value="">Select a date</option>
                  {weekendDates.map((date) => (
                    <option key={formatDateValue(date)} value={formatDateValue(date)}>
                      {formatDateOption(date)}
                    </option>
                  ))}
                </select>
                {errors.orderDate && <span className="field-error">{errors.orderDate}</span>}
              </div>
              <div className={`form-field ${errors.orderTime ? 'has-error' : ''}`}>
                <label htmlFor="order-time">Time</label>
                <select
                  id="order-time"
                  value={orderTime}
                  onChange={(e) => {
                    setOrderTime(e.target.value)
                    if (errors.orderTime) setErrors((p) => ({ ...p, orderTime: '' }))
                  }}
                >
                  <option value="">Select a time</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.orderTime && <span className="field-error">{errors.orderTime}</span>}
              </div>
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
