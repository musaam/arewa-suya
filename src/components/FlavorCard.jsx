import { useCart } from '../context/CartContext'
import './FlavorCard.css'

export default function FlavorCard({ flavour, price }) {
  const { addItem, items, updateQuantity } = useCart()
  const cartItem = items.find((i) => i.id === flavour.id)

  const item = {
    id: flavour.id,
    name: `Hibiscus Refresher — ${flavour.flavour}`,
    emoji: flavour.emoji,
    price,
  }

  return (
    <div
      className="flavor-card"
      style={{
        '--flavor-color': flavour.color,
        '--flavor-light': flavour.lightColor,
      }}
    >
      <div className="flavor-card-header">
        <img src={flavour.image} alt={flavour.flavour} className="flavor-image" />
      </div>

      <div className="flavor-card-body">
        <h3 className="flavor-name">{flavour.flavour}</h3>
        <p className="flavor-description">{flavour.description}</p>
      </div>

      <div className="flavor-card-footer">
        <span className="flavor-price">${price.toFixed(2)}</span>

        {cartItem ? (
          <div className="flavor-qty-controls">
            <button
              className="qty-btn"
              onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="qty-value">{cartItem.quantity}</span>
            <button
              className="qty-btn"
              onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <button
            className="flavor-add-btn"
            onClick={() => addItem(item)}
            aria-label={`Add ${flavour.flavour} Hibiscus Refresher to order`}
          >
            + Add
          </button>
        )}
      </div>
    </div>
  )
}
