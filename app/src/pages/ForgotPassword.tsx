import React, { useState } from 'react'
import { Envelope, ArrowLeft } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import MaisonDarkModeLogo from '@components/MaisonDarkModeLogo'
import MaisonWordmark from '@components/MaisonWordmark'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <main
      className="bw"
      aria-label="Reset password"
      style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bw-bg)' }}
    >
      <div style={{ width: '100%', maxWidth: 400, padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: 40 }}>
          <MaisonDarkModeLogo height={48} />
          <MaisonWordmark color={null} style={{ fontSize: '1.4rem', display: 'inline-block', verticalAlign: 'middle' }} />
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: 28, fontFamily: 'DM Sans, sans-serif', fontWeight: 200 }}>Check your email</h2>
            <p className="small-muted" style={{ fontSize: 15, fontFamily: 'Work Sans, sans-serif', fontWeight: 300, lineHeight: 1.6, marginBottom: 32 }}>
              If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
            </p>
            <Link to="/tenant/login" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: 'Work Sans, sans-serif', fontSize: 14, color: 'var(--bw-muted)' }}>
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ margin: '0 0 8px 0', fontSize: 32, fontFamily: 'DM Sans, sans-serif', fontWeight: 200, textAlign: 'center' }}>Reset password</h2>
            <p className="small-muted" style={{ marginTop: 0, marginBottom: 28, fontSize: 15, fontFamily: 'Work Sans, sans-serif', fontWeight: 300, textAlign: 'center', lineHeight: 1.5 }}>
              Enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="small-muted" htmlFor="reset-email" style={{ fontFamily: 'Work Sans, sans-serif', fontSize: 13, display: 'block', marginBottom: 6 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Envelope size={15} aria-hidden style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    autoComplete="email"
                    className="bw-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    style={{ padding: '14px 16px 14px 42px', borderRadius: 'var(--radius-field)', fontFamily: 'Work Sans, sans-serif', width: '100%', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bw-btn"
                style={{ width: '100%', borderRadius: 'var(--radius-field)', padding: '14px 24px', fontFamily: 'Work Sans, sans-serif', fontWeight: 500, backgroundColor: 'var(--bw-accent)', color: '#ffffff', border: '1px solid var(--bw-accent)' }}
              >
                Send reset link
              </button>
            </form>

            <Link
              to="/tenant/login"
              style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Work Sans, sans-serif', fontSize: 14, color: 'var(--bw-muted)', textDecoration: 'none' }}
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
