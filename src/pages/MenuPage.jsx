import { useNavigate } from 'react-router-dom'
import { menuCategories } from '../data/menu'
import { useCart } from '../context/CartContext'
import './MenuPage.css'

export default function MenuPage() {
  const navigate = useNavigate()
  const { totalItems, addItem } = useCart()

  const handleAdd = (item) => {
    addItem({ id: item.id, name: item.name, price: item.price, emoji: item.emoji })
  }

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
              <a href="#menu" className="hero-btn-primary">🍴 VIEW MENU</a>
              <button className="hero-btn-secondary" onClick={() => navigate('/order')}>
                🛒 ORDER NOW
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline */}
     {/*  <div className="menu-tagline">
        <p>🍢 Curated for Individuals, Families &amp; Events</p>
      </div> */}

      {/* Menu categories */}
      <section className="menu-categories">
        {menuCategories.map((category) => (
          <div key={category.id} className="menu-category">
            <h2 className="category-title">
              <span className="category-icon">{category.icon}</span>
              {category.name}
              {category.badge && <span className="category-badge">{category.badge}</span>}
            </h2>
            <div className="menu-items-grid">
              {category.items.map((item) => (
                <div key={item.id} className="menu-item-card">
                  <div className="menu-item-info">
                    <h3 className="menu-item-name">{item.emoji} {item.name}</h3>
                    <p className="menu-item-desc">{item.description}</p>
                  </div>
                  <div className="menu-item-action">
                    <span className="menu-item-price">${item.price.toFixed(2)}</span>
                    <button
                      className="menu-item-add-btn"
                      onClick={() => handleAdd(item)}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      +
                    </button>
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
    </div>
  )
}
