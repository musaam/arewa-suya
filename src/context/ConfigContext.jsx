import { createContext, useContext, useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'
import { menuCategories as fallbackMenu } from '../data/menu'

const ConfigContext = createContext(null)

// Sensible defaults used before the config doc loads, or if it's missing.
const DEFAULT_EVENT_MODE = {
  enabled: false,
  name: 'Naija Tradefest',
  location: '',
  itemIds: [],
  note: 'Pick up at our booth as soon as your order is ready.',
}

export function ConfigProvider({ children }) {
  const [eventMode, setEventMode] = useState(DEFAULT_EVENT_MODE)
  // Menu starts from the hardcoded fallback so the storefront always renders,
  // even before the Firestore menu has been seeded.
  const [menuCategories, setMenuCategories] = useState(fallbackMenu)
  // "Now serving" order number for events (null when not set).
  const [nowServing, setNowServing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Live subscription to config/app so a change in Firestore (or the admin
    // page) switches the whole site between regular and event mode instantly,
    // and updates the menu/pricing without a redeploy.
    const unsub = onSnapshot(
      doc(db, 'config', 'app'),
      (snap) => {
        const data = snap.exists() ? snap.data() : {}
        setEventMode({ ...DEFAULT_EVENT_MODE, ...(data.eventMode || {}) })
        // Use the Firestore menu when present and non-empty; otherwise fall
        // back to the bundled menu.js.
        setMenuCategories(
          Array.isArray(data.menu) && data.menu.length > 0 ? data.menu : fallbackMenu
        )
        setLoading(false)
      },
      (err) => {
        console.error('Failed to load app config:', err)
        // Fall back to regular mode + bundled menu if config can't be read.
        setEventMode(DEFAULT_EVENT_MODE)
        setMenuCategories(fallbackMenu)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  useEffect(() => {
    // Live subscription to the "now serving" number (separate doc so staff can
    // update it without touching admin-only config/app).
    const unsub = onSnapshot(
      doc(db, 'config', 'serving'),
      (snap) => {
        const val = snap.exists() ? snap.data().current : null
        setNowServing(typeof val === 'number' ? val : null)
      },
      (err) => {
        console.error('Failed to load now-serving:', err)
        setNowServing(null)
      }
    )
    return unsub
  }, [])

  return (
    <ConfigContext.Provider value={{ eventMode, menuCategories, nowServing, loading }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
