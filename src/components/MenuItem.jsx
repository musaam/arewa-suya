import { useCart } from '../context/CartContext'
import './MenuItem.css'

export default function MenuItem({ item }) {
  const { addItem, items } = useCart()
  const cartItem = items.find((i) => i.id === item.id)

  return (
    <div className="menu-item">
      <div className="menu-item-emoji">{item.emoji}</div>
      <div className="menu-item-info">
        <h3 className="menu-item-name">{item.name}</h3>
        <p className="menu-item-description">{item.description}</p>
        <div className="menu-item-footer">
          <span className="menu-item-price">${item.price.toFixed(2)}</span>
          <button
            className={`add-btn ${cartItem ? 'added' : ''}`}
            onClick={() => addItem(item)}
            aria-label={`Add ${item.name} to order`}
          >
            {cartItem ? `In cart (${cartItem.quantity})` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
