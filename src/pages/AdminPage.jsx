import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import './AdminPage.css'

function authErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
      return 'No account found for that email.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Try again or reset it in the Firebase console.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this project.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return 'Sign-in failed. Please try again.'
  }
}

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(authErrorMessage(err.code))
      console.error('Admin sign-in failed:', err.code)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1 className="admin-login-title">Arewa Suya — Staff Login</h1>
        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="admin-login-error">{error}</p>}
        <button type="submit" className="admin-btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function isToday(ts) {
  if (!ts) return false
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

// Format the scheduled order date (stored as YYYY-MM-DD). Parse the parts
// explicitly so it's treated as a local date, not shifted by UTC.
function formatScheduledDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day) return dateStr
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

function OrderCard({ order, onComplete, completing }) {
  const [expanded, setExpanded] = useState(false)
  const isDelivery = order.deliveryMethod === 'delivery'
  const location = isDelivery ? order.address : order.pickupAddress
  const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0

  return (
    <div className={`order-card ${expanded ? 'expanded' : ''}`}>
      {/* Summary row — click to expand/collapse */}
      <button
        type="button"
        className="admin-order-summary"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`Order ${order.orderNumber ?? ''} for ${order.customer?.name ?? ''}, ${expanded ? 'collapse' : 'expand'} details`}
      >
        <span className={`order-chevron ${expanded ? 'open' : ''}`} aria-hidden="true">▸</span>
        <span className="admin-order-number">#{order.orderNumber ?? '—'}</span>
        <span className="admin-order-summary-name">{order.customer?.name}</span>
        <span className="admin-order-summary-meta">{itemCount} item{itemCount === 1 ? '' : 's'}</span>
        <span className="order-total">${order.grandTotal?.toFixed(2)}</span>
      </button>

      {/* Collapsible details */}
      {expanded && (
        <div className="order-details">
          <div className="order-customer">
            {order.customer?.phone && <span>{order.customer.phone}</span>}
            {order.customer?.email && <span className="order-email">{order.customer.email}</span>}
          </div>

          {order.orderDate && (
            <div className="order-when">
              <span className="order-when-label">{isDelivery ? 'Delivery' : 'Pickup'} date:</span>{' '}
              {formatScheduledDate(order.orderDate)}
            </div>
          )}
          {order.orderTime && (
            <div className="order-when">
              <span className="order-when-label">{isDelivery ? 'Delivery' : 'Pickup'} time:</span>{' '}
              {order.orderTime}
            </div>
          )}
          {location && <div className="order-location">{location}</div>}
          {order.createdAt && (
            <div className="order-placed">Ordered at {formatTime(order.createdAt)}</div>
          )}

          <ul className="order-items">
            {order.items?.map((item, idx) => (
              <li key={idx}>
                <span>{item.emoji} {item.name}</span>
                <span className="order-item-qty">×{item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action footer — always visible so orders can be completed without expanding */}
      <div className="order-card-foot">
        {order.status === 'active' ? (
          <button
            className="admin-btn-primary"
            onClick={() => onComplete(order.id)}
            disabled={completing}
          >
            {completing ? 'Saving…' : isDelivery ? 'Mark delivered' : 'Mark picked up'}
          </button>
        ) : (
          <span className="order-done-badge">✓ Completed {formatTime(order.completedAt)}</span>
        )}
      </div>
    </div>
  )
}

function Dashboard({ user }) {
  const [tab, setTab] = useState('active')
  const [activeOrders, setActiveOrders] = useState([])
  const [completedOrders, setCompletedOrders] = useState([])
  const [completingId, setCompletingId] = useState(null)
  const [loadError, setLoadError] = useState('')

  // Real-time listener for active orders.
  useEffect(() => {
    const q = query(collection(db, 'orders'), where('status', '==', 'active'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        // Sort oldest-first so the server works through the queue in order.
        rows.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0))
        setActiveOrders(rows)
        setLoadError('')
      },
      (err) => {
        console.error('Failed to load active orders:', err)
        setLoadError('Could not load orders. Check your access.')
      }
    )
    return unsub
  }, [])

  // Real-time listener for completed orders (filtered to today client-side).
  useEffect(() => {
    const q = query(collection(db, 'orders'), where('status', '==', 'completed'))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((o) => isToday(o.completedAt))
      // Most recently completed first.
      rows.sort((a, b) => (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0))
      setCompletedOrders(rows)
    })
    return unsub
  }, [])

  async function markComplete(orderId) {
    setCompletingId(orderId)
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'completed',
        completedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to mark order complete:', err)
      alert('Could not update the order. Please try again.')
    } finally {
      setCompletingId(null)
    }
  }

  const orders = tab === 'active' ? activeOrders : completedOrders

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Orders</h1>
        <div className="admin-header-right">
          <span className="admin-user">{user.email}</span>
          <button className="admin-btn-ghost" onClick={() => signOut(auth)}>
            Sign out
          </button>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === 'active' ? 'active' : ''}`}
          onClick={() => setTab('active')}
        >
          Active ({activeOrders.length})
        </button>
        <button
          className={`admin-tab ${tab === 'completed' ? 'active' : ''}`}
          onClick={() => setTab('completed')}
        >
          Completed today ({completedOrders.length})
        </button>
      </div>

      {loadError && <p className="admin-login-error">{loadError}</p>}

      {orders.length === 0 ? (
        <p className="admin-empty">
          {tab === 'active' ? 'No active orders right now.' : 'No orders completed today yet.'}
        </p>
      ) : (
        <div className="admin-orders-grid">
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onComplete={markComplete}
              completing={completingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  if (loading) {
    return <div className="admin-loading">Loading…</div>
  }

  return user ? <Dashboard user={user} /> : <LoginForm />
}
