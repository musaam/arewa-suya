import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

// A cart line is uniquely identified by the menu item id plus its spice level,
// so the same item ordered at different spice levels lives on separate lines
// (e.g. one Mild plate and one Hot plate). Items without a spice level use
// their plain id as the line id.
function lineIdFor(item) {
  return item.spiceLevel ? `${item.id}::${item.spiceLevel}` : item.id
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const lineId = lineIdFor(action.item)
      const existing = state.items.find((i) => i.lineId === lineId)
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.lineId === lineId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      }
      return { ...state, items: [...state.items, { ...action.item, lineId, quantity: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.lineId !== action.lineId) }
    case 'UPDATE_QUANTITY': {
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.lineId !== action.lineId) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.lineId === action.lineId ? { ...i, quantity: action.quantity } : i
        ),
      }
    }
    case 'CLEAR_CART':
      return { ...state, items: [] }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] })

  const addItem = (item) => dispatch({ type: 'ADD_ITEM', item })
  const removeItem = (lineId) => dispatch({ type: 'REMOVE_ITEM', lineId })
  const updateQuantity = (lineId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', lineId, quantity })
  const clearCart = () => dispatch({ type: 'CLEAR_CART' })

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items: state.items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
