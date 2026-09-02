import { useState, useEffect } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useConfig } from '../context/ConfigContext'
import {
  LoginForm,
  useAuthUser,
  signOutUser,
  isStaffEmail,
} from './auth'
import './AdminPage.css'
import './ServerPage.css'

function formatTime(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
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
          {order.orderType === 'event' && <span>{order.eventName || 'Event'}</span>}
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

function NowServingControl() {
  const { eventMode, nowServing } = useConfig()
  const [saving, setSaving] = useState(false)
  const [manual, setManual] = useState('')

  async function setServing(value) {
    const next = Number(value)
    if (!Number.isFinite(next) || next < 0) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'config', 'serving'), { current: next }, { merge: true })
    } catch (err) {
      console.error('Failed to update now-serving:', err)
      alert('Could not update the serving number. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Only relevant during an event.
  if (!eventMode.enabled) return null

  const current = typeof nowServing === 'number' ? nowServing : 0

  return (
    <section className="serving-panel">
      <div className="serving-head">
        <div>
          <h2>Now Serving</h2>
          <p className="event-panel-status">Customers see this number during {eventMode.name || 'the event'}.</p>
        </div>
        <span className="serving-number">#{current}</span>
      </div>

      <div className="serving-controls">
        <button
          className="admin-btn-ghost"
          onClick={() => setServing(current - 1)}
          disabled={saving || current <= 0}
        >
          −
        </button>
        <button
          className="admin-btn-primary"
          onClick={() => setServing(current + 1)}
          disabled={saving}
        >
          Next (#{current + 1})
        </button>
        <form
          className="serving-set"
          onSubmit={(e) => {
            e.preventDefault()
            if (manual.trim() !== '') {
              setServing(manual.trim())
              setManual('')
            }
          }}
        >
          <input
            type="number"
            min="0"
            placeholder="Set #"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
          />
          <button type="submit" className="admin-btn-ghost" disabled={saving || manual.trim() === ''}>
            Set
          </button>
        </form>
      </div>
    </section>
  )
}

function OrderQueue({ user }) {
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

  // Real-time listener for completed orders (all dates).
  useEffect(() => {
    const q = query(collection(db, 'orders'), where('status', '==', 'completed'))
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
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
          <button className="admin-btn-ghost" onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </header>

      <NowServingControl />

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
          Completed ({completedOrders.length})
        </button>
      </div>

      {loadError && <p className="admin-login-error">{loadError}</p>}

      {orders.length === 0 ? (
        <p className="admin-empty">
          {tab === 'active' ? 'No active orders right now.' : 'No completed orders yet.'}
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

export default function ServerPage() {
  const { user, loading } = useAuthUser()

  if (loading) {
    return <div className="admin-loading">Loading…</div>
  }

  if (!user) {
    return <LoginForm title="Arewa Suya — Staff Login" />
  }

  // A signed-in but non-staff account shouldn't see orders.
  if (!isStaffEmail(user)) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h1 className="admin-login-title">No access</h1>
          <p className="admin-login-error">
            This account isn&apos;t authorized to view orders.
          </p>
          <button className="admin-btn-ghost" onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return <OrderQueue user={user} />
}
