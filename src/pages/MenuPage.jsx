import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { hibiscusRefresher } from '../data/menu'
import FlavorCard from '../components/FlavorCard'
import { useCart } from '../context/CartContext'
import './MenuPage.css'

export default function MenuPage() {
  const navigate = useNavigate()
  const { totalItems, addItem } = useCart()
  const heroRef = useRef(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    )
    if (heroRef.current) observer.observe(heroRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="menu-page">
      {/* Hero with product info overlaid on desktop */}
      <section className="menu-hero" ref={heroRef}>
        <img
          src="/hero-bg-mobile-2.png"
          alt="Arewa Suya Hibiscus Drink"
          className="hero-image-mobile"
        />
        <img
          src="/hero-bg-2.png"
          alt="Arewa Suya Hibiscus Drink"
          className="hero-image-desktop"
        />
        {/* Product info — overlaid on left on desktop, below image on mobile */}
        <div className="product-hero">
          <h1 className="product-hero-name">Arewa Suya Hibiscus Drink</h1>
          <p className="product-hero-desc">
            Naturally refreshing. Made with real hibiscus.
          </p>
          <p className="product-hero-price">${hibiscusRefresher.price.toFixed(2)}</p>
          <a href="#flavours" className="product-hero-cta">
            SHOP HIBISCUS DRINKS
          </a>
        </div>
      </section>

      {/* Product cards — immediately after */}
      <section className="product-section" id="flavours">
        <h2 className="section-heading">Shop Hibiscus Drinks</h2>
        <div className="flavors-grid">
          {hibiscusRefresher.flavours.map((flavour) => (
            <FlavorCard
              key={flavour.id}
              flavour={flavour}
              price={hibiscusRefresher.price}
            />
          ))}
        </div>
      </section>

      {/* Feature strip — lower on page, not cluttering first screen */}
      <section className="feature-strip">
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C8 2 5 5 5 8c0 4 7 12 7 12s7-8 7-12c0-3-3-6-7-6z"/><circle cx="12" cy="8" r="2"/></svg>
          </div>
          <h3>REAL HIBISCUS</h3>
          <p>Made with real hibiscus flowers.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10z"/><path d="M8 12l3 3 5-5"/></svg>
          </div>
          <h3>NATURAL INGREDIENTS</h3>
          <p>No artificial colors. No preservatives.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <h3>REFRESHING GOODNESS</h3>
          <p>Light, refreshing and perfectly satisfying.</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h3>MADE WITH CARE</h3>
          <p>Handcrafted drinks you can feel good about.</p>
        </div>
      </section>

      {/* Sticky mobile cart bar — shows after scrolling past hero */}
      {showStickyBar && (
        <div className="sticky-cart-bar">
          <div className="sticky-cart-info">
            <span className="sticky-cart-name">Hibiscus Drink</span>
            <span className="sticky-cart-price">${hibiscusRefresher.price.toFixed(2)}</span>
          </div>
          {totalItems > 0 ? (
            <button className="sticky-cart-btn" onClick={() => navigate('/order')}>
              View Cart ({totalItems})
            </button>
          ) : (
            <button
              className="sticky-cart-btn"
              onClick={() => {
                const el = document.getElementById('flavours')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              ADD TO CART
            </button>
          )}
        </div>
      )}
    </div>
  )
}
