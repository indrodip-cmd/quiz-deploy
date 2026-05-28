'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

const VIDEO_CONFIG = {
  v1: {
    title: 'You Are Closer Than You Think',
    subtitle: 'For women just starting out or with an idea not yet launched',
    description: 'This video is for you. You have everything you need. You are just missing the roadmap.',
  },
  v2: {
    title: 'You Have Started. Here Is Why It Has Not Clicked Yet.',
    subtitle: 'For women who have launched but income is not consistent',
    description: 'You have done the hard part. Starting. Now let us fix the specific thing holding you back.',
  },
  v3: {
    title: 'You Are Ready For Your Next Level',
    subtitle: 'For women who are getting clients and want consistent growth',
    description: 'You have proven the concept. This video shows you exactly how to scale without burning out.',
  },
  v4: {
    title: 'You Are Ready For Your Next Level',
    subtitle: 'For women who are established and scaling',
    description: 'You have proven the concept. This video shows you exactly how to scale without burning out.',
  },
}

export default function VideoPage() {
  const params = useParams()
  const slug = (params?.slug as string) || 'v1'
  const config = VIDEO_CONFIG[slug as keyof typeof VIDEO_CONFIG] || VIDEO_CONFIG.v1

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [videoTracked, setVideoTracked] = useState(false)

  useEffect(() => {
    const n = sessionStorage.getItem('video_name') || sessionStorage.getItem('quiz_name') || ''
    const e = sessionStorage.getItem('video_email') || sessionStorage.getItem('quiz_email') || ''
    setName(n)
    setEmail(e)

    if (e && !videoTracked) {
      setVideoTracked(true)
      fetch('/api/update-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: e,
          video_watched: true,
          video_watched_at: new Date().toISOString(),
          sequence_assigned: 'B',
        })
      }).catch(err => console.error('Track error:', err))
    }
  }, [])

  const firstName = name.split(' ')[0] || 'there'

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Cormorant+Garant:wght@700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(34,88,64,0.4)} 50%{box-shadow:0 0 0 16px rgba(34,88,64,0)} }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.4s ease both; }
        .cta-btn {
          display: inline-flex; align-items: center; gap: 12px;
          background: linear-gradient(135deg, #225840, #2d6a4f);
          color: #fff; font-size: 17px; font-weight: 700;
          padding: 20px 48px; border-radius: 50px; border: none;
          cursor: pointer; text-decoration: none;
          animation: pulseGlow 2s infinite;
          transition: transform 0.2s ease;
          font-family: inherit;
        }
        .cta-btn:hover { transform: translateY(-2px); }
        @media (max-width: 480px) {
          .video-cta-section { padding: 32px 20px !important; }
          .video-cta-h2 { font-size: 24px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <svg width="28" height="32" viewBox="0 0 32 36" fill="none">
          <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#2d6a4f"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#4a9a6a', letterSpacing: '.06em', textTransform: 'uppercase' }}>THE5TH CONSULTING</span>
      </header>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Heading */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', background: 'rgba(45,106,79,0.2)', color: '#4a9a6a', fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 50, marginBottom: 20, border: '1px solid rgba(45,106,79,0.3)' }}>
            Your Personalised Video
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
            {firstName}, your video<br />
            <span style={{ color: '#4a9a6a', fontStyle: 'italic' }}>is ready.</span>
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto' }}>
            {config.description}
          </p>
        </div>

        {/* Video Placeholder */}
        <div className="fade-up-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,106,79,0.25)', borderRadius: 20, overflow: 'hidden', marginBottom: 56, aspectRatio: '16/9', width: '100%', maxWidth: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(45,106,79,0.3)', border: '2px solid rgba(45,106,79,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            &#9654;
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: 8 }}>Your Video Is Coming Soon</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>{config.subtitle}</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="fade-up-3 video-cta-section" style={{ textAlign: 'center', background: 'rgba(45,106,79,0.07)', border: '1px solid rgba(45,106,79,0.2)', borderRadius: 24, padding: '48px 40px' }}>
          <h2 className="video-cta-h2" style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
            Ready to build this with support?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 36px' }}>
            Book a free 60-minute strategy call with Indrodip. Indrodip will walk through your personalised roadmap with you and show you the exact next steps.
          </p>
          <a
            href="https://cal.com/indrodip-ghosh-ut1vxh/60min"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn"
          >
            Book Your Free Strategy Call
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 16 }}>
            60 minutes. No pressure. Just clarity.
          </p>
        </div>

      </div>
    </div>
  )
}
