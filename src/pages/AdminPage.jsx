import { useState, useEffect } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useConfig } from '../context/ConfigContext'
import { menuCategories as fallbackMenu } from '../data/menu'
import {
  LoginForm,
  useAuthUser,
  signOutUser,
  isAdminEmail,
} from './auth'
import './AdminPage.css'

function EventModePanel() {
  const { eventMode, menuCategories } = useConfig()

  // Local editable copy; seeded from live config and kept in sync when it changes.
  const [name, setName] = useState(eventMode.name)
  const [location, setLocation] = useState(eventMode.location)
  const [note, setNote] = useState(eventMode.note)
  const [itemIds, setItemIds] = useState(eventMode.itemIds)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  // Re-seed the form whenever the live config changes (e.g. another device).
  useEffect(() => {
    setName(eventMode.name)
    setLocation(eventMode.location)
    setNote(eventMode.note)
    setItemIds(eventMode.itemIds)
  }, [eventMode.name, eventMode.location, eventMode.note, eventMode.itemIds])

  async function saveConfig(next) {
    setSaving(true)
    setSavedMsg('')
    try {
      await setDoc(
        doc(db, 'config', 'app'),
        { eventMode: { enabled: eventMode.enabled, name, location, note, itemIds, ...next } },
        { merge: true }
      )
      setSavedMsg('Saved.')
      setTimeout(() => setSavedMsg(''), 2500)
    } catch (err) {
      console.error('Failed to save config:', err)
      setSavedMsg('Save failed — check your access.')
    } finally {
      setSaving(false)
    }
  }

  function toggleItem(id) {
    setItemIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <section className={`event-panel ${eventMode.enabled ? 'on' : ''}`}>
      <div className="event-panel-head">
        <div>
          <h2>Event Mode</h2>
          <p className="event-panel-status">
            {eventMode.enabled
              ? `ON — the site is showing ${eventMode.name || 'the event'}.`
              : 'OFF — the site is in regular ordering mode.'}
          </p>
        </div>
        <button
          className={`event-switch ${eventMode.enabled ? 'on' : ''}`}
          onClick={() => saveConfig({ enabled: !eventMode.enabled })}
          disabled={saving}
          role="switch"
          aria-checked={eventMode.enabled}
          aria-label="Toggle event mode"
        >
          <span className="event-switch-knob" />
        </button>
      </div>

      <div className="event-panel-fields">
        <label className="admin-field">
          <span>Event name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Naija Tradefest" />
        </label>
        <label className="admin-field">
          <span>Event pickup location</span>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue name & address" />
        </label>
        <label className="admin-field">
          <span>Pickup note (shown at checkout)</span>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Pick up at our booth as soon as your order is ready." />
        </label>
      </div>

      <div className="event-items">
        <span className="event-items-label">Items available at the event</span>
        {menuCategories.map((cat) => (
          <div key={cat.id} className="event-items-group">
            <span className="event-items-group-name">{cat.name}</span>
            {cat.items.map((item) => (
              <label key={item.id} className="event-item-check">
                <input
                  type="checkbox"
                  checked={itemIds.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                />
                <span>{item.name} — ${item.price.toFixed(2)}</span>
              </label>
            ))}
          </div>
        ))}
      </div>

      <div className="event-panel-foot">
        <button className="admin-btn-primary" onClick={() => saveConfig()} disabled={saving}>
          {saving ? 'Saving…' : 'Save event settings'}
        </button>
        {savedMsg && <span className="event-saved-msg">{savedMsg}</span>}
      </div>
    </section>
  )
}

function MenuEditor() {
  const { menuCategories } = useConfig()

  const [draft, setDraft] = useState(menuCategories)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [dirty, setDirty] = useState(false)

  // Re-seed the editable draft from live config unless there are unsaved edits.
  useEffect(() => {
    if (!dirty) setDraft(menuCategories)
  }, [menuCategories, dirty])

  function updateItem(catId, itemId, field, value) {
    setDirty(true)
    setDraft((cats) =>
      cats.map((cat) =>
        cat.id !== catId
          ? cat
          : {
              ...cat,
              items: cat.items.map((item) =>
                item.id !== itemId ? item : { ...item, [field]: value }
              ),
            }
      )
    )
  }

  async function save() {
    setSaving(true)
    setMsg('')
    // Normalize: ensure price is a number and availability is a boolean.
    const menu = draft.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => ({
        ...item,
        price: Number(item.price) || 0,
        available: item.available !== false,
      })),
    }))
    try {
      await setDoc(doc(db, 'config', 'app'), { menu }, { merge: true })
      setDirty(false)
      setMsg('Menu saved.')
      setTimeout(() => setMsg(''), 2500)
    } catch (err) {
      console.error('Failed to save menu:', err)
      setMsg('Save failed — check your access.')
    } finally {
      setSaving(false)
    }
  }

  function seedFromFallback() {
    // Loads the bundled menu.js into the editor as a starting point.
    setDraft(fallbackMenu)
    setDirty(true)
    setMsg('Loaded bundled menu — review, then Save to publish.')
  }

  return (
    <section className="menu-editor">
      <div className="menu-editor-head">
        <div>
          <h2>Menu</h2>
          <p className="event-panel-status">Edit names, descriptions, prices, and availability. Changes go live on Save — no redeploy needed.</p>
        </div>
        <button className="admin-btn-ghost" onClick={seedFromFallback} disabled={saving}>
          Load bundled menu
        </button>
      </div>

      {draft.map((cat) => (
        <div key={cat.id} className="menu-editor-group">
          <span className="event-items-group-name">{cat.name}</span>
          {cat.items.map((item) => (
            <div key={item.id} className={`menu-editor-item ${item.available === false ? 'unavailable' : ''}`}>
              <div className="menu-editor-row">
                <input
                  className="menu-editor-name"
                  value={item.name}
                  onChange={(e) => updateItem(cat.id, item.id, 'name', e.target.value)}
                  placeholder="Item name"
                />
                <div className="menu-editor-price">
                  <span>$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.price}
                    onChange={(e) => updateItem(cat.id, item.id, 'price', e.target.value)}
                  />
                </div>
              </div>
              <input
                className="menu-editor-desc"
                value={item.description || ''}
                onChange={(e) => updateItem(cat.id, item.id, 'description', e.target.value)}
                placeholder="Description"
              />
              <label className="menu-editor-avail">
                <input
                  type="checkbox"
                  checked={item.available !== false}
                  onChange={(e) => updateItem(cat.id, item.id, 'available', e.target.checked)}
                />
                <span>Available</span>
              </label>
            </div>
          ))}
        </div>
      ))}

      <div className="event-panel-foot">
        <button className="admin-btn-primary" onClick={save} disabled={saving || !dirty}>
          {saving ? 'Saving…' : 'Save menu'}
        </button>
        {msg && <span className="event-saved-msg">{msg}</span>}
      </div>
    </section>
  )
}

function AdminDashboard({ user }) {
  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Store Settings</h1>
        <div className="admin-header-right">
          <span className="admin-user">{user.email}</span>
          <button className="admin-btn-ghost" onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </header>

      <EventModePanel />
      <MenuEditor />
    </div>
  )
}

export default function AdminPage() {
  const { user, loading } = useAuthUser()

  if (loading) {
    return <div className="admin-loading">Loading…</div>
  }

  if (!user) {
    return <LoginForm title="Arewa Suya — Admin Login" />
  }

  // Store configuration is admin-only. A non-admin (e.g. the server account)
  // that logs in here is told they don't have access.
  if (!isAdminEmail(user)) {
    return (
      <div className="admin-login">
        <div className="admin-login-card">
          <h1 className="admin-login-title">No access</h1>
          <p className="admin-login-error">
            This account isn&apos;t authorized for store settings. Use the admin account,
            or go to the orders page instead.
          </p>
          <button className="admin-btn-ghost" onClick={signOutUser}>
            Sign out
          </button>
        </div>
      </div>
    )
  }

  return <AdminDashboard user={user} />
}
