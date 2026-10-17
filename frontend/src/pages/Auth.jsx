
import { useState } from 'react'
import { BrainCircuit, Mail, Lock, UserRound } from 'lucide-react'
import { loginUser, registerUser, getCurrentUser } from '../services/api'
import './Auth.css'

function Auth({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await registerUser({ name, email, password })
      }

      await loginUser(email, password)
      const user = await getCurrentUser()
      onLogin(user)
    } catch (err) {

      setError(
        err.response?.data?.detail ||
        'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon"><BrainCircuit size={27} /></div>
          <h1>DocuMind</h1>
          <p>Your AI-powered document assistant</p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === 'login' ? 'selected' : ''}
            onClick={() => { setMode('login'); setError('') }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'selected' : ''}
            onClick={() => { setMode('register'); setError('') }}
          >
            Create account
          </button>
        </div>

        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="auth-description">
          {mode === 'login'
            ? 'Sign in to continue to your knowledge workspace.'
            : 'Create an account to start organizing your documents.'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <label>
              Full name
              <div className="auth-input">
                <UserRound size={18} />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>
            </label>
          )}

          <label>
            Email address
            <div className="auth-input">
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className="auth-input">
              <Lock size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={mode === 'register' ? 8 : 1}
                maxLength={128}
                required
              />
            </div>
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-submit" disabled={loading} type="submit">
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Your documents stay in your authenticated workspace.
        </p>
      </section>
    </main>
  )
}

export default Auth
