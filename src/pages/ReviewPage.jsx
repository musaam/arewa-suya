import { useState, useEffect } from 'react'
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import './ReviewPage.css'

const STAR_LABELS = ['Terrible', 'Poor', 'OK', 'Good', 'Excellent']

function StarDisplay({ rating }) {
  return (
    <div className="star-display" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </div>
  )
}

function ReviewCard({ review }) {
  const date = review.createdAt?.toDate
    ? review.createdAt.toDate().toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Just now'

  return (
    <div className="review-item">
      <div className="review-item-header">
        <div className="review-item-left">
          <div className="reviewer-avatar">{review.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="reviewer-name">{review.name}</div>
            <div className="review-date">{date}</div>
          </div>
        </div>
        <StarDisplay rating={review.rating} />
      </div>
      <p className="review-comment">{review.comment}</p>
    </div>
  )
}

export default function ReviewPage() {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
  const [errors, setErrors] = useState({})
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)

  // Real-time listener for reviews
  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setReviewsLoading(false)
    }, () => {
      setReviewsLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  function validate() {
    const newErrors = {}
    if (rating === 0) newErrors.rating = 'Please select a star rating'
    if (!comment.trim()) newErrors.comment = 'Please write a comment'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    setStatus('submitting')
    try {
      await addDoc(collection(db, 'reviews'), {
        rating,
        comment: comment.trim(),
        name: name.trim() || 'Anonymous',
        createdAt: serverTimestamp(),
      })
      setStatus('success')
    } catch (err) {
      console.error('Failed to save review:', err)
      setStatus('error')
    }
  }

  function handleReset() {
    setRating(0)
    setHovered(0)
    setComment('')
    setName('')
    setErrors({})
    setStatus('idle')
  }

  const activeRating = hovered || rating

  return (
    <div className="review-page">
      {/* Form card */}
      {status === 'success' ? (
        <div className="review-card">
          <img src="/arewa-suya-logo.png" alt="Arewa Suya" className="review-logo" />
          <div className="review-success-icon">★</div>
          <h1>Thank you!</h1>
          <p className="review-success-text">
            Your review means a lot to us. We&apos;ll keep working hard to make every visit special.
          </p>
          <button className="btn-primary" onClick={handleReset}>
            Leave Another Review
          </button>
        </div>
      ) : (
        <div className="review-card">
          <img src="/arewa-suya-logo.png" alt="Arewa Suya" className="review-logo" />
          <h1>Leave a Review</h1>
          <p className="review-subtitle">How was your experience at Arewa Suya?</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-section">
              <label className="form-label">Your Rating</label>
              <div className="stars" onMouseLeave={() => setHovered(0)}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= activeRating ? 'filled' : ''}`}
                    onClick={() => {
                      setRating(star)
                      if (errors.rating) setErrors((p) => ({ ...p, rating: '' }))
                    }}
                    onMouseEnter={() => setHovered(star)}
                    aria-label={`Rate ${star} out of 5 — ${STAR_LABELS[star - 1]}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {activeRating > 0 && (
                <span className="star-label">{STAR_LABELS[activeRating - 1]}</span>
              )}
              {errors.rating && <span className="field-error">{errors.rating}</span>}
            </div>

            <div className={`form-section ${errors.comment ? 'has-error' : ''}`}>
              <label className="form-label" htmlFor="review-comment">Your Comment</label>
              <textarea
                id="review-comment"
                placeholder="Tell us about your experience…"
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value)
                  if (errors.comment) setErrors((p) => ({ ...p, comment: '' }))
                }}
                rows={4}
                maxLength={500}
              />
              <div className="char-count">{comment.length} / 500</div>
              {errors.comment && <span className="field-error">{errors.comment}</span>}
            </div>

            <div className="form-section">
              <label className="form-label" htmlFor="review-name">
                Name <span className="optional">(optional)</span>
              </label>
              <input
                id="review-name"
                type="text"
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
              />
            </div>

            {status === 'error' && (
              <div className="review-error">⚠️ Something went wrong. Please try again.</div>
            )}

            <button
              type="submit"
              className="btn-primary submit-btn"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      <div className="reviews-list-section">
        <div className="reviews-list-header">
          <h2>What others are saying</h2>
          {avgRating && (
            <div className="avg-rating">
              <span className="avg-score">{avgRating}</span>
              <StarDisplay rating={Math.round(avgRating)} />
              <span className="avg-count">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
            </div>
          )}
        </div>

        {reviewsLoading ? (
          <div className="reviews-loading">
            <span className="status-spinner" /> Loading reviews…
          </div>
        ) : reviews.length === 0 ? (
          <div className="reviews-empty">
            No reviews yet — be the first!
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
