import './OrderConfirmationPage.css'

export default function OrderConfirmationPage({ order, orderStatus, onOrderAgain }) {
  const orderNumber = order?.orderNumber
    || (order?.firestoreId ? order.firestoreId.slice(-6).toUpperCase() : '…')

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
              <span>Total paid</span>
              <span>${order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}

        <p className="pickup-note">
          ✉️ An order confirmation email has been sent to the email you provided. Please refer to it for details about pickup or delivery.
        </p>

        <div className="confirmation-actions">
          <button className="btn-primary" onClick={onOrderAgain}>
            Order Again
          </button>
          <button className="btn-secondary" onClick={onOrderAgain}>
            ← Go Home
          </button>
        </div>
      </div>
    </div>
  )
}
