'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VideoGatePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return }
    setSubmitting(true)
    setError('')

    const videoSlug = sessionStorage.getItem('video_slug') || 'v1'

    try {
      await fetch('/api/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          video_requested: true,
          video_assigned: videoSlug
        })
      })
      sessionStorage.setItem('video_name', name)
      sessionStorage.setItem('video_email', email)
      router.push('/video/' + videoSlug)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ee', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Cormorant+Garant:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .input-field {
          width: 100%; padding: 16px 20px; border: 2px solid #e0e0e0;
          border-radius: 8px; font-size: 16px; font-family: inherit;
          outline: none; transition: border-color 0.2s ease; background: #fff; color: #0a0a0a;
        }
        .input-field:focus { border-color: #225840; }
        .input-field::placeholder { color: #9ca3af; }
      `}</style>

      <header style={{ background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid #f0f0f0', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="28" height="32" viewBox="0 0 32 36" fill="none">
          <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#2d6a4f"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#225840', letterSpacing: '.06em', textTransform: 'uppercase' }}>THE5TH CONSULTING</span>
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <div className="fade-up" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>

          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #225840, #2d6a4f)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 24 }}>
            &#9654;
          </div>

          <h1 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.2, marginBottom: 12 }}>
            Almost there
          </h1>
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7, marginBottom: 36 }}>
            Where should we send your personalised video? We want to make sure it reaches the right person.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 8 }}>
            <input
              className="input-field"
              type="text"
              placeholder="Your first name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              className="input-field"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 16, textAlign: 'left' }}>{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: '100%', padding: '18px 32px', background: 'linear-gradient(135deg, #225840, #2d6a4f)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 17, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1, transition: 'opacity 0.2s ease, transform 0.2s ease', fontFamily: 'inherit', marginBottom: 16 }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {submitting ? 'One moment...' : 'Take Me To My Video'}
          </button>

          <p style={{ fontSize: 12, color: '#9ca3af' }}>Your information is private. We never share or sell it.</p>

        </div>
      </div>
    </div>
  )
}
