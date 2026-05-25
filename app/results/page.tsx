'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ResultsPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [roadmap, setRoadmap] = useState('')
  const [loading, setLoading] = useState(true)
  const [noVideoClicked, setNoVideoClicked] = useState(false)

  useEffect(() => {
    const storedName = sessionStorage.getItem('quiz_name') || ''
    const storedEmail = sessionStorage.getItem('quiz_email') || ''
    const storedAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}')
    setName(storedName)
    setEmail(storedEmail)
    setAnswers(storedAnswers)
    generateRoadmap(storedName, storedAnswers)
    saveLead(storedName, storedEmail, storedAnswers)
  }, [])

  const getVideoSlug = (q1: string) => {
    if (q1 === 'starting' || q1 === 'idea') return 'v1'
    if (q1 === 'launched') return 'v2'
    if (q1 === 'scaling') return 'v3'
    return 'v1'
  }

  const generateRoadmap = async (n: string, a: Record<string, string>) => {
    try {
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: a, name: n })
      })
      const data = await res.json()
      setRoadmap(data.roadmap || '')
    } catch (err) {
      setRoadmap('Your personalised roadmap is being prepared. Check your inbox for the full PDF version.')
    } finally {
      setLoading(false)
    }
  }

  const saveLead = async (n: string, e: string, a: Record<string, string>) => {
    try {
      await fetch('/api/save-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n,
          email: e,
          quiz_answers: a,
          video_assigned: getVideoSlug(a.q1),
        })
      })
    } catch (err) {
      console.error('Lead save error:', err)
    }
  }

  const handleWatchVideo = async () => {
    await fetch('/api/update-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, video_requested: true })
    })
    sessionStorage.setItem('video_slug', getVideoSlug(answers.q1))
    router.push('/video-gate')
  }

  const handleNoVideo = async () => {
    await fetch('/api/update-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, no_video: true })
    })
    setNoVideoClicked(true)
  }

  const firstName = name.split(' ')[0] || 'there'

  return (
    <div style={{ minHeight: '100vh', background: '#f5f2ee', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garant:wght@300;400;600;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.6s 0.45s ease both; }
      `}</style>

      {/* Header */}
      <header style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #f0f0f0', padding: '16px 40px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <svg width="28" height="32" viewBox="0 0 32 36" fill="none">
          <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#2d6a4f"/>
          <path d="M12 20C12 20 10 22 10 24C10 27.3 12.7 30 16 30C19.3 30 22 27.3 22 24C22 22 20 20 20 20C20 20 19 22 17 23C16.5 23.3 16 23.3 16 23.3C16 23.3 17 21 12 20Z" fill="#2d6a4f" opacity="0.7"/>
        </svg>
        <span style={{ fontSize: 14, fontWeight: 800, color: '#225840', letterSpacing: '.06em', textTransform: 'uppercase' }}>THE5TH CONSULTING</span>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Hero */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-block', background: '#e8f5ee', color: '#225840', fontSize: 12, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 50, marginBottom: 20 }}>
            Your Roadmap Is Ready
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: '#1a1a1a', lineHeight: 1.1, marginBottom: 16 }}>
            {firstName}, here is your<br />
            <span style={{ color: '#225840', fontStyle: 'italic' }}>personalised blueprint.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#666', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Based on your 20 answers, The5th AI has mapped exactly where you are and what needs to happen next. We also sent your full PDF roadmap to your inbox.
          </p>
        </div>

        {/* Roadmap Box */}
        <div className="fade-up-2" style={{ background: '#fff', borderRadius: 20, padding: '40px', marginBottom: 48, boxShadow: '0 4px 40px rgba(0,0,0,0.06)', border: '1px solid #e8e8e8' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#b8960c', textTransform: 'uppercase', marginBottom: 20 }}>
            Your AI-Generated Roadmap
          </div>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[100, 80, 90, 70, 85].map((w, i) => (
                <div key={i} style={{ height: 16, background: '#f0f0f0', borderRadius: 8, width: w + '%', animation: 'pulse 1.5s infinite' }} />
              ))}
              <p style={{ fontSize: 13, color: '#aaa', marginTop: 8 }}>Generating your personalised roadmap...</p>
            </div>
          ) : (
            <div style={{ fontSize: 16, color: '#333', lineHeight: 1.85 }}>
              {roadmap.split('\n').filter(p => p.trim()).map((para, i) => (
                <p key={i} style={{ marginBottom: 18 }}>{para}</p>
              ))}
            </div>
          )}
        </div>

        {/* Video Section */}
        <div className="fade-up-3" style={{ background: 'linear-gradient(135deg, #1a3a2a, #225840)', borderRadius: 24, padding: '48px 40px', textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: 16 }}>
            One More Thing
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
            We did not want to just give you<br />a plan on a page.
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
            So we created a short video based on exactly where you are, because you deserve more than a generic answer. It is ready for you now.
          </p>

          {noVideoClicked ? (
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px 28px', display: 'inline-block' }}>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>Your PDF is on its way to your inbox.</p>
            </div>
          ) : (
            <>
              <button
                onClick={handleWatchVideo}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#fff', color: '#1a3a2a', fontSize: 17, fontWeight: 700, padding: '18px 40px', borderRadius: 50, border: 'none', cursor: 'pointer', marginBottom: 20, transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxShadow: '0 8px 30px rgba(0,0,0,0.2)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)'; }}
              >
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#225840', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, flexShrink: 0 }}>
                  &#9654;
                </span>
                Watch My Video
              </button>
              <br />
              <button
                onClick={handleNoVideo}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}
              >
                No thanks, the roadmap is enough for me
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
