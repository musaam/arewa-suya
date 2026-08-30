import { useConfig } from '../context/ConfigContext'
import './OrderConfirmationPage.css'

function formatScheduleDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(`${dateStr}T00:00:00`)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  })
}

export default function OrderConfirmationPage({ order, orderStatus, onOrderAgain }) {
  const { nowServing } = useConfig()
  const orderNumber = order?.orderNumber
    || (order?.firestoreId ? order.firestoreId.slice(-6).toUpperCase() : '…')

  const isEvent = order?.orderType === 'event'
  // Only meaningful when we have a numeric order number and a serving number.
  const showServing = isEvent && typeof nowServing === 'number' && typeof order?.orderNumber === 'number'
  const aheadCount = showServing ? Math.max(0, order.orderNumber - nowServing) : null

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">
        <img src="/arewa-suya-logo.JPG" alt="Arewa Suya" className="confirm-logo" />

        {orderStatus === 'saving' && (
          <div className="order-status saving">
            <span className="status-spinner" />
            Saving your order…
          </div>
        )}

        {orderStatus === 'error' && (
          <div className="order-status error">
            ⚠️ Your order was placed but we couldn't save it. Please show this screen to staff.
          </div>
        )}

        <div className="confirmation-icon">✓</div>
        <h1>Order Placed!</h1>
        <p className="confirmation-subtitle">
          Thanks{order?.customer?.name ? `, ${order.customer.name}` : ''}! We&apos;ll have your order ready shortly.
        </p>

        <div className="order-number">
          Order <span>#{orderNumber}</span>
        </div>

        {showServing && (
          <div className="now-serving">
            <div className="now-serving-row">
              <span className="now-serving-label">Now serving</span>
              <span className="now-serving-num">#{nowServing}</span>
            </div>
            <p className="now-serving-note">
              {aheadCount === 0
                ? "You're up next — head to the booth!"
                : aheadCount === 1
                ? '1 order ahead of you.'
                : `${aheadCount} orders ahead of you.`}
            </p>
          </div>
        )}

        {order && (
          <div className="ordered-items">
            <h3>What you ordered</h3>
            {order.items.map((item) => (
              <div key={item.id} className="confirmed-item">
                <span>{item.emoji} {item.name}</span>
                <span>×{item.quantity}</span>
                <span>${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="confirmed-total">
              <span>Total ordered</span>
              <span>${order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        {order && (order.orderDate || order.orderTime || order.address || order.pickupAddress) && (
          <div className="order-schedule">
            <div className="order-schedule-row">
              <span className="order-schedule-label">
                {order.orderType === 'event'
                  ? `${order.eventName || 'Event'} Pickup`
                  : order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
              </span>
            </div>
            {(order.orderDate || order.orderTime) && (
              <div className="order-schedule-row">
                <span className="order-schedule-label">When</span>
                <span className="order-schedule-value">
                  {formatScheduleDate(order.orderDate)}{order.orderDate && order.orderTime ? ' · ' : ''}{order.orderTime}
                </span>
              </div>
            )}
            {(order.address || order.pickupAddress) && (
              <div className="order-schedule-row">
                <span className="order-schedule-label">
                  {order.deliveryMethod === 'delivery' ? 'Address' : 'Location'}
                </span>
                <span className="order-schedule-value">
                  {order.deliveryMethod === 'delivery' ? order.address : order.pickupAddress}
                </span>
              </div>
            )}
          </div>
        )}

        <p className="pickup-note">
          {order?.orderType === 'event'
            ? `Come to our booth at ${order.eventName || 'the event'} and pick up your order as soon as it's ready. A confirmation email has been sent to you.`
            : 'An order confirmation email has been sent to the email you provided. Please refer to it for details about pickup or delivery.'}
        </p>

        <div className="confirmation-actions">
          <button className="btn-primary" onClick={onOrderAgain}>
            Order Again
          </button>
          <button className="btn-secondary" onClick={onOrderAgain}>
            ← Close
          </button>
        </div>
      </div>
    </div>
  )
}
