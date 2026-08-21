import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Navbar.css'

export default function Navbar() {
  const { totalItems } = useCart()
  const location = useLocation()
  const path = location.pathname
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
        </button>

        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <img src="/arewa-suya-logo.JPG" alt="Arewa Suya logo" className="navbar-logo" />
          <span className="navbar-title">Arewa Suya</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className={`nav-link ${path === '/' ? 'active' : ''}`}>
            Menu
          </Link>
          <Link to="/reviews" className={`nav-link ${path === '/reviews' ? 'active' : ''}`}>
            Reviews
          </Link>
          <Link to="/order" className={`nav-link cart-link ${path === '/order' ? 'active' : ''}`} aria-label="Cart">
            <svg className="cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile slide-in menu */}
      {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
        <Link to="/" className={`mobile-menu-link ${path === '/' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          Menu
        </Link>
        <Link to="/reviews" className={`mobile-menu-link ${path === '/reviews' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          Reviews
        </Link>
        <Link to="/order" className={`mobile-menu-link ${path === '/order' ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
          Cart {totalItems > 0 && `(${totalItems})`}
        </Link>
      </div>
    </nav>
  )
}
