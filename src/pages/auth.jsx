import { useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from '../firebase'

export function authErrorMessage(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address is not valid.'
    case 'auth/user-disabled':
      return 'This account has been disabled.'
    case 'auth/user-not-found':
      return 'No account found for that email.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect password. Try again or reset it in the Firebase console.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled for this project.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return 'Sign-in failed. Please try again.'
  }
}

// Tracks the current Firebase Auth user. Returns { user, loading }.
export function useAuthUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  return { user, loading }
}

export function signOutUser() {
  return signOut(auth)
}

// Reusable email/password login card. `title` sets the heading.
export function LoginForm({ title = 'Sign in' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(authErrorMessage(err.code))
      console.error('Sign-in failed:', err.code)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1 className="admin-login-title">{title}</h1>
        <label className="admin-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>
        <label className="admin-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="admin-login-error">{error}</p>}
        <button type="submit" className="admin-btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}

// Role emails — must match the roles in firestore.rules.
export const ADMIN_EMAIL = 'admin@arewasuyaspot.ca'
export const SERVER_EMAIL = 'server@arewasuyaspot.ca'

export function isAdminEmail(user) {
  return !!user && user.email === ADMIN_EMAIL
}

export function isStaffEmail(user) {
  return !!user && (user.email === ADMIN_EMAIL || user.email === SERVER_EMAIL)
}
