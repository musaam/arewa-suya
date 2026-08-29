import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useConfig } from '../context/ConfigContext'
import './MenuPage.css'

export default function MenuPage() {
  const navigate = useNavigate()
  const { items, totalItems, addItem, updateQuantity } = useCart()
  const { eventMode, menuCategories, nowServing } = useConfig()
  const [lightbox, setLightbox] = useState(null)

  // Hide items explicitly marked unavailable, and in event mode restrict to the
  // items being sold at the event. Empty categories are dropped.
  const visibleCategories = menuCategories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        if (item.available === false) return false
        if (eventMode.enabled && !eventMode.itemIds.includes(item.id)) return false
        return true
      }),
    }))
    .filter((cat) => cat.items.length > 0)

  const handleAdd = (item) => {
    addItem({ id: item.id, name: item.name, price: item.price, emoji: item.emoji })
  }

  const getQuantity = (id) => {
    const cartItem = items.find((i) => i.id === id)
    return cartItem ? cartItem.quantity : 0
  }

  const openLightbox = (item) => setLightbox({ image: item.image, name: item.name })
  const closeLightbox = () => setLightbox(null)

  // Close lightbox on Escape and lock body scroll while open
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [lightbox])

  return (
    <div className="menu-page">
      {/* Hero section */}
      <section className="menu-hero">
        <img
          src="/hero-bg-2.png"
          alt="Arewa Suya Spot — Authentic Kano-Style Suya"
          className="hero-image hero-image-desktop"
        />
        <img
          src="/hero-bg-mobile.png"
          alt="Arewa Suya Spot — Authentic Kano-Style Suya"
          className="hero-image hero-image-mobile"
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-headline">
              <span className="hero-headline-white">AUTHENTIC</span>
              <span className="hero-headline-gold">KANO-STYLE SUYA</span>
            </h1>
            <div className="hero-divider">
              <span className="hero-divider-line"></span>
              <span className="hero-divider-diamond">◆</span>
              <span className="hero-divider-line"></span>
            </div>
            <p className="hero-tagline">BOLD.&nbsp; SMOKY.&nbsp; UNFORGETTABLE.</p>
            <p className="hero-description">
              Prepared fresh with premium cuts and<br />
              our signature spice blend.
            </p>
            <p className="hero-accent">A true taste of Northern Nigeria.</p>
            <div className="hero-buttons">
              <a href="#menu" className="hero-btn-primary">VIEW MENU</a>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline */}
     {/*  <div className="menu-tagline">
        <p>🍢 Curated for Individuals, Families &amp; Events</p>
      </div> */}

      {/* Menu categories */}
      <section className="menu-categories" id="menu">
        {eventMode.enabled && (
          <div className="event-banner">
            <span className="event-banner-tag">Event</span>
            <div className="event-banner-text">
              <strong>We're at {eventMode.name}!</strong>
              <span>Order below and pick up at our booth. Only event items are available today.</span>
            </div>
            {typeof nowServing === 'number' && (
              <div className="event-banner-serving">
                <span className="event-banner-serving-label">Now serving</span>
                <span className="event-banner-serving-num">#{nowServing}</span>
              </div>
            )}
          </div>
        )}
        {visibleCategories.map((category) => (
          <div key={category.id} className="menu-category">
            <h2 className="category-title">
              {category.name}
              {category.badge && <span className="category-badge">{category.badge}</span>}
            </h2>
            <div className="menu-items-grid">
              {category.items.map((item) => (
                <div key={item.id} className="menu-item-card">
                  <button
                    type="button"
                    className="menu-item-thumb"
                    onClick={() => openLightbox(item)}
                    aria-label={`View larger image of ${item.name}`}
                  >
                    <img src={item.image} alt={item.name} loading="lazy" />
                    <span className="menu-item-thumb-zoom" aria-hidden="true">🔍</span>
                  </button>
                  <div className="menu-item-info">
                    <h3 className="menu-item-name">{item.name}</h3>
                    <p className="menu-item-desc">{item.description}</p>
                  </div>
                  <div className="menu-item-action">
                    <span className="menu-item-price">${item.price.toFixed(2)}</span>
                    {getQuantity(item.id) === 0 ? (
                      <button
                        className="menu-item-add-btn"
                        onClick={() => handleAdd(item)}
                        aria-label={`Add ${item.name} to cart`}
                      >
                        +
                      </button>
                    ) : (
                      <div className="menu-item-stepper" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          className="menu-item-stepper-btn"
                          onClick={() => updateQuantity(item.id, getQuantity(item.id) - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="menu-item-stepper-value" aria-live="polite">
                          {getQuantity(item.id)}
                        </span>
                        <button
                          className="menu-item-stepper-btn"
                          onClick={() => updateQuantity(item.id, getQuantity(item.id) + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Feature strip */}
      <section className="feature-strip">
        <div className="feature-item">
          <span className="feature-icon-text">☪️</span>
          <h3>100% HALAL</h3>
        </div>
        <div className="feature-item">
          <span className="feature-icon-text">📍</span>
          <h3>WINNIPEG</h3>
        </div>
        <div className="feature-item">
          <span className="feature-icon-text">🔥</span>
          <h3>AUTHENTIC RECIPE</h3>
        </div>
      </section>

      {/* Sticky mobile cart bar */}
      {totalItems > 0 && (
        <div className="sticky-cart-bar">
          <div className="sticky-cart-info">
            <span className="sticky-cart-name">{totalItems} item{totalItems > 1 ? 's' : ''} in cart</span>
          </div>
          <button className="sticky-cart-btn" onClick={() => navigate('/order')}>
            View Cart
          </button>
        </div>
      )}

      {/* Image lightbox */}
      {lightbox && (
        <div className="lightbox-overlay" onClick={closeLightbox} role="dialog" aria-modal="true" aria-label={lightbox.name}>
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close image">✕</button>
          <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.image} alt={lightbox.name} className="lightbox-image" />
            <figcaption className="lightbox-caption">{lightbox.name}</figcaption>
          </figure>
        </div>
      )}
    </div>
  )
}
