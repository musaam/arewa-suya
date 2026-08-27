import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Resets the window scroll position to the top whenever the route changes.
// React Router does not do this automatically, so without it the scroll
// position carries over from the previous page.
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
