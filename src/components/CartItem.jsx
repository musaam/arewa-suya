import { useCart } from '../context/CartContext'
import './CartItem.css'

export default function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="cart-item">
      <span className="cart-item-emoji">{item.emoji}</span>
      <div className="cart-item-info">
        <span className="cart-item-name">{item.name}</span>
        <span className="cart-item-unit-price">${item.price.toFixed(2)} each</span>
      </div>
      <div className="cart-item-controls">
        <button
          className="qty-btn"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button
          className="qty-btn"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      <div className="cart-item-right">
        <span className="cart-item-subtotal">${(item.price * item.quantity).toFixed(2)}</span>
        <button
          className="remove-btn"
          onClick={() => removeItem(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          ✕
        </button>
      </div>
    </div>
  )
}
