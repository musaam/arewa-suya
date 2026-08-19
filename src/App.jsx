import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { collection, addDoc, doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { db } from './firebase'
import { CartProvider, useCart } from './context/CartContext'
import Navbar from './components/Navbar'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrderConfirmationPage from './pages/OrderConfirmationPage'
import ReviewPage from './pages/ReviewPage'

function AppContent() {
  const [completedOrder, setCompletedOrder] = useState(null)
  const [orderStatus, setOrderStatus] = useState('idle')
  const { items, totalPrice, clearCart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const hideNavbar = location.pathname === '/confirmation'

  async function handleCheckout(customer, { deliveryMethod, deliveryFee }) {
    const tax = totalPrice * 0.12
    const grandTotal = totalPrice + tax + deliveryFee

    const order = {
      customer: {
        name: customer.name.trim(),
        email: customer.email.trim(),
        phone: customer.phone.trim(),
      },
      deliveryMethod,
      deliveryFee,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.price * item.quantity,
      })),
      subtotal: totalPrice,
      tax,
      grandTotal,
    }

    setCompletedOrder(order)
    clearCart()
    navigate('/confirmation')
    window.scrollTo({ top: 0, behavior: 'instant' })
    setOrderStatus('saving')

    try {
      // Atomically increment order counter and get the new order number
      const counterRef = doc(db, 'counters', 'orders')
      const orderNumber = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef)
        const nextNumber = (counterDoc.exists() ? counterDoc.data().current : 0) + 1
        transaction.set(counterRef, { current: nextNumber })
        return nextNumber
      })

      const docRef = await addDoc(collection(db, 'orders'), {
        ...order,
        orderNumber,
        createdAt: serverTimestamp(),
      })
      setOrderStatus('saved')
      setCompletedOrder((prev) => ({ ...prev, firestoreId: docRef.id, orderNumber }))

      // Send order notification email — failure here doesn't affect the order
      try {
        const functions = getFunctions()
        const sendOrderEmail = httpsCallable(functions, 'sendOrderEmail')
        await sendOrderEmail({ order: { ...order, orderNumber } })
      } catch (emailErr) {
        console.error('Email notification failed (order still saved):', emailErr)
      }
    } catch (err) {
      console.error('Failed to save order:', err)
      setOrderStatus('error')
    }
  }

  return (
    <div className="app">
      {!hideNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/order" element={<CartPage onCheckout={handleCheckout} />} />
          <Route path="/reviews" element={<ReviewPage />} />
          <Route
            path="/confirmation"
            element={
              <OrderConfirmationPage
                order={completedOrder}
                orderStatus={orderStatus}
                onOrderAgain={() => {
                  setOrderStatus('idle')
                  setCompletedOrder(null)
                  navigate('/')
                  window.scrollTo({ top: 0, behavior: 'instant' })
                }}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  )
}
