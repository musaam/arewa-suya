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

  return (
    <ConfigContext.Provider value={{ eventMode, menuCategories, loading }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
