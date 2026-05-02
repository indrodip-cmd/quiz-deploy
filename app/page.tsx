'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── Types ─── */
type QuizAnswers = Record<string, string | string[]>

interface DayPlan {
  day: number
  title: string
  theme: string
  tasks: string[]
  win_condition: string
  motivation: string
}

interface Roadmap {
  days: DayPlan[]
  summary: string
  biggest_opportunity: string
  first_action: string
}

interface Lead {
  id: string
  email: string
  name: string
  answers: QuizAnswers
  roadmap: Roadmap | null
  current_day: number
  streak: number
  revenue_logged: number
  last_visit: string | null
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/* ─── Question Data (all 20 preserved exactly) ─── */
const questions = [
  {
    id: 'q1', num: 1, title: 'Where are you in your coaching or consulting business right now?',
    sub: "Be honest — there's no wrong answer. This calibrates your entire blueprint.",
    type: 'select',
    options: [
      { value: 'starting', emoji: '🌱', label: 'Just starting out', sub: 'No clients yet, building from the ground up' },
      { value: 'idea', emoji: '💡', label: "I have an idea but haven't launched", sub: "I know what I want to do, haven't started yet" },
      { value: 'launched', emoji: '🚀', label: "I've launched and have some clients", sub: 'Revenue is coming in but not consistent yet' },
      { value: 'scaling', emoji: '📈', label: "I'm established and want to scale", sub: 'Consistent clients, ready for next level growth' },
    ]
  },
  {
    id: 'q2', num: 2, title: 'Who is your ideal client?',
    sub: 'Choose the description that best fits the person you most want to serve.',
    type: 'select',
    options: [
      { value: 'transitions', emoji: '🌀', label: 'Women going through major life transitions', sub: 'Divorce, career change, empty nest, reinvention' },
      { value: 'career', emoji: '💼', label: 'Professionals seeking career change', sub: 'Corporate escapees, burnout recovery, new direction' },
      { value: 'entrepreneurs', emoji: '🏢', label: 'Entrepreneurs and business owners', sub: 'Growing revenue, scaling, leadership' },
      { value: 'wellness', emoji: '💚', label: 'Health and wellness seekers', sub: 'Body transformation, energy, holistic health' },
      { value: 'mindset', emoji: '🧠', label: 'Personal development and mindset', sub: 'Confidence, relationships, life purpose' },
      { value: 'other', emoji: '✨', label: 'Other / coaches and consultants', sub: 'Helping others grow their expertise business' },
    ]
  },
  {
    id: 'q3', num: 3, title: 'What age range is your ideal client typically in?',
    sub: 'This shapes your messaging, platform choice, and content strategy.',
    type: 'select',
    options: [
      { value: '25-34', emoji: '🌟', label: '25–34', sub: '' },
      { value: '35-44', emoji: '⭐', label: '35–44', sub: '' },
      { value: '45-54', emoji: '🌠', label: '45–54', sub: '' },
      { value: '55+', emoji: '💫', label: '55+', sub: '' },
    ]
  },
  {
    id: 'q4', num: 4, title: 'What is the #1 pain your ideal client wakes up feeling?',
    sub: 'Use their exact language. The more specific, the more powerful your blueprint.',
    type: 'textarea',
    placeholder: "e.g. They feel stuck and invisible — they have so much to offer but can't figure out how to turn their expertise into income…"
  },
  {
    id: 'q5', num: 5, title: 'What is your zone of genius?',
    sub: 'What do you do effortlessly that others find impossible? What have people always come to you for?',
    type: 'textarea',
    placeholder: 'e.g. I have a gift for helping women identify their unique story and turn decades of experience into a focused, premium coaching offer…'
  },
  {
    id: 'q6', num: 6, title: 'Do you have a personal transformation story connected to your niche?',
    sub: 'Your story is your most powerful marketing asset. How developed is it?',
    type: 'select',
    options: [
      { value: 'strong', emoji: '🔥', label: 'Yes — a powerful one I share openly', sub: 'My story is central to my brand' },
      { value: 'underused', emoji: '💎', label: "Yes, but I don't fully leverage it", sub: 'I have the story but rarely share it publicly' },
      { value: 'partial', emoji: '🌱', label: 'Partially — still developing my story', sub: "I'm on the journey myself, not fully there yet" },
      { value: 'none', emoji: '❓', label: 'Not really', sub: "I help others but haven't lived the transformation myself" },
    ]
  },
  {
    id: 'q7', num: 7, title: 'Complete your client transformation statement.',
    sub: 'Every powerful offer is built on a clear FROM → TO.',
    type: 'fromto',
    fromPlaceholder: 'e.g. feeling invisible with no clear offer…',
    toPlaceholder: 'e.g. a confident coach with a $5K signature program…'
  },
  {
    id: 'q8', num: 8, title: 'How would you prefer to deliver your coaching?',
    sub: 'This shapes the offer type in your blueprint.',
    type: 'select',
    options: [
      { value: '1on1', emoji: '👤', label: '1:1 Private Coaching', sub: 'Deep, personalized transformation with individual clients' },
      { value: 'group', emoji: '👥', label: 'Group Coaching Program', sub: 'Cohort-based experience with a small group' },
      { value: 'course', emoji: '🎓', label: 'Online Course / Digital Product', sub: 'Self-paced program clients complete independently' },
      { value: 'membership', emoji: '🔑', label: 'Membership Community', sub: 'Recurring access, ongoing support and content' },
      { value: 'mixed', emoji: '🎯', label: 'Mix of all of the above', sub: 'A hybrid model with multiple touchpoints' },
    ]
  },
]

/* ─── Count-up Hook ─── */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(timer) }
      else setVal(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration])
  return val
}

/* ─── Stat Card ─── */
function StatCard({ label, value, unit, color }: { label: string; value: number; unit?: string; color: string }) {
  const displayed = useCountUp(value)
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}40`, borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>
        {unit === '$' ? `$${displayed.toLocaleString()}` : displayed}{unit && unit !== '$' ? unit : ''}
      </div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

/* ─── Global Styles (injected once) ─── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garant:wght@300;400;600;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #0a0f0a; min-height: 100vh; }
  body { font-family: 'DM Sans', sans-serif; color: #fff; overflow-x: hidden; }
  ::placeholder { color: rgba(255,255,255,0.22); }
  input, textarea, button { font-family: inherit; outline: none; }
  input:focus, textarea:focus { border-color: #2d6a4f !important; }
  @keyframes meshMove { 0% { opacity:0.7 } 100% { opacity:1 } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
  @keyframes slideRight { from { opacity:0; transform:translateX(40px) } to { opacity:1; transform:translateX(0) } }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.3)} }
  @keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.4)} 50%{box-shadow:0 0 0 6px rgba(212,160,23,.0)} }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: #0a0f0a; }
  ::-webkit-scrollbar-thumb { background: #2d6a4f; border-radius: 3px; }
  .opt-btn:hover:not([data-sel='true']) { border-color: #2d6a4f !important; background: rgba(45,106,79,0.12) !important; box-shadow: 0 0 20px rgba(45,106,79,0.15); }
  .green-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 14px 36px rgba(45,106,79,0.45) !important; }
  .timeline-day:hover { border-color: rgba(45,106,79,0.6) !important; }
`

const MESH = (
  <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    background: 'radial-gradient(ellipse 80% 60% at 15% 0%, rgba(45,106,79,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 85% 100%, rgba(45,106,79,0.1) 0%, transparent 60%)',
    animation: 'meshMove 12s ease-in-out infinite alternate' }} />
)

const NAV = (right?: React.ReactNode) => (
  <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,15,10,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(45,106,79,0.18)' }}>
    <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>
      The<span style={{ color: '#2d6a4f' }}>5th</span>
    </span>
    {right}
  </nav>
)

/* ─── Main Component ─── */
export default function Page() {
  const [screen, setScreen] = useState<'start' | 'quiz' | 'email' | 'otp' | 'dashboard'>('start')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [fromTo, setFromTo] = useState({ from: '', to: '' })
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({})
  const [slideDir, setSlideDir] = useState<'in' | 'out' | null>(null)
  const [error, setError] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [submitting, setSubmitting] = useState(false)
  const [otpError, setOtpError] = useState('')

  const [lead, setLead] = useState<Lead | null>(null)
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [tasksDone, setTasksDone] = useState<boolean[]>([false, false, false])
  const [revenueInput, setRevenueInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [activeDay, setActiveDay] = useState(1)
  const [confettiFired, setConfettiFired] = useState(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  const totalQ = questions.length
  const progress = screen === 'quiz' ? (currentQ / totalQ) * 100 : (screen === 'email' || screen === 'otp') ? 100 : 0

  /* ── Navigation ── */
  const goNext = useCallback(() => {
    setSlideDir('out')
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(q => q + 1)
      } else {
        setScreen('email')
      }
      setSlideDir('in')
      setError('')
      requestAnimationFrame(() => setSlideDir(null))
    }, 280)
  }, [currentQ])

  const handleSelectAnswer = (qId: string, value: string) => {
    setAnswers(a => ({ ...a, [qId]: value }))
    setError('')
    setTimeout(() => goNext(), 320)
  }

  const validateAndNext = () => {
    const q = questions[currentQ]
    if (q.type === 'textarea') {
      const val = (textAnswers[q.id] || '').trim()
      if (val.length < 5) { setError('Please describe this before continuing'); return }
      setAnswers(a => ({ ...a, [q.id]: val }))
    } else if (q.type === 'fromto') {
      if (!fromTo.from.trim() || !fromTo.to.trim()) { setError('Please complete both fields'); return }
      setAnswers(a => ({ ...a, [q.id]: `FROM: ${fromTo.from} → TO: ${fromTo.to}` }))
    }
    goNext()
  }

  /* ── Email submit ── */
  const handleEmailSubmit = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email'); return }
    setSubmitting(true); setError('')
    try {
      const res = await fetch('/api/quiz/send-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, answers: { ...answers, from: fromTo.from, to: fromTo.to } })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setScreen('otp')
    } catch { setError('Something went wrong. Please try again.') }
    finally { setSubmitting(false) }
  }

  /* ── OTP ── */
  const handleOtpDigit = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otpDigits]; next[i] = val; setOtpDigits(next)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[i] && i > 0) otpRefs.current[i - 1]?.focus()
  }
  const handleOtpSubmit = async () => {
    const code = otpDigits.join('')
    if (code.length !== 6) { setOtpError('Please enter the full 6-digit code'); return }
    setSubmitting(true); setOtpError('')
    try {
      const res = await fetch('/api/quiz/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code })
      })
      const data = await res.json()
      if (data.error) { setOtpError(data.error); return }
      setLead(data.lead); setRoadmap(data.roadmap)
      setActiveDay(data.lead?.current_day || 1)
      setScreen('dashboard')
    } catch { setOtpError('Something went wrong.') }
    finally { setSubmitting(false) }
  }

  /* ── Dashboard ── */
  const handleMarkAllComplete = async () => {
    if (!lead) return
    setTasksDone([true, true, true])
    if (!confettiFired) {
      setConfettiFired(true)
      const confetti = (await import('canvas-confetti')).default
      confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 }, colors: ['#2d6a4f', '#d4a017', '#fff'] })
    }
    await fetch('/api/quiz/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lead.email, day: lead.current_day, tasksCompleted: [0, 1, 2], revenueLogged: 0 })
    })
    setLead(l => l ? { ...l, current_day: Math.min((l.current_day || 1) + 1, 15), streak: (l.streak || 0) + 1 } : l)
  }

  const handleRevenueLog = async () => {
    if (!lead || !revenueInput) return
    const amt = parseFloat(revenueInput); if (isNaN(amt)) return
    await fetch('/api/quiz/progress', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: lead.email, day: lead.current_day, tasksCompleted: [], revenueLogged: amt })
    })
    setLead(l => l ? { ...l, revenue_logged: (l.revenue_logged || 0) + amt } : l)
    setRevenueInput('')
  }

  const handleChatSend = async () => {
    if (!chatInput.trim() || !lead) return
    const msg = chatInput; setChatInput('')
    setChatMessages(m => [...m, { role: 'user', content: msg }])
    setChatLoading(true)
    try {
      const res = await fetch('/api/quiz/ai-coach', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lead.email, message: msg })
      })
      const data = await res.json()
      setChatMessages(m => [...m, { role: 'assistant', content: data.response || 'Sorry, try again.' }])
    } catch {
      setChatMessages(m => [...m, { role: 'assistant', content: 'Something went wrong.' }])
    } finally { setChatLoading(false) }
  }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [chatMessages])

  const today = roadmap?.days?.find(d => d.day === (lead?.current_day || 1))
  const revPercent = Math.min(((lead?.revenue_logged || 0) / 5000) * 100, 100)
  const firstName = (lead?.name || name || 'there').split(' ')[0]
  const tasksDoneCount = tasksDone.filter(Boolean).length

  /* ── Shared style tokens ── */
  const card: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,106,79,0.22)', borderRadius: 24, padding: '44px 40px', maxWidth: 560, width: '100%', backdropFilter: 'blur(12px)', boxShadow: '0 32px 80px rgba(0,0,0,0.45)' }
  const greenBtn: React.CSSProperties = { padding: '16px 32px', borderRadius: 50, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '.03em', transition: 'all .2s', boxShadow: '0 8px 24px rgba(45,106,79,0.3)', width: '100%', marginTop: 22 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '14px 20px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, marginBottom: 12, transition: 'border-color .2s' }
  const slideStyle: React.CSSProperties = slideDir === 'out' ? { opacity: 0, transform: 'translateX(-36px)', transition: 'all .28s ease' } : slideDir === 'in' ? { opacity: 0, transform: 'translateX(36px)' } : { opacity: 1, transform: 'translateX(0)', transition: 'all .28s ease' }

  /* ══════════════ START ══════════════ */
  if (screen === 'start') return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', overflow: 'hidden' }}>
      <style>{GLOBAL_CSS}</style>
      {MESH}
      {NAV(<span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.1em' }}>3 MIN QUIZ</span>)}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px 60px', position: 'relative', zIndex: 1, textAlign: 'center', animation: 'fadeUp .8s ease both' }}>
        <div style={{ display: 'inline-block', padding: '6px 18px', borderRadius: 50, background: 'rgba(45,106,79,0.14)', border: '1px solid rgba(45,106,79,0.3)', fontSize: 11, fontWeight: 600, letterSpacing: '.12em', color: '#2d6a4f', marginBottom: 32, textTransform: 'uppercase' }}>
          Free Personalized Roadmap
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 'clamp(40px,6.5vw,76px)', fontWeight: 900, lineHeight: 1.04, marginBottom: 28, color: '#fff', letterSpacing: '-.01em' }}>
          Discover Your Path to<br />
          <span style={{ color: '#2d6a4f' }}>$5,000/Month</span>
        </h1>
        <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, marginBottom: 52, maxWidth: 520 }}>
          Answer 8 questions and get your personalized AI roadmap —<br />a free 15-day action plan built from your exact answers.
        </p>
        <button className="green-btn" onClick={() => setScreen('quiz')}
          style={{ ...greenBtn, width: 'auto', padding: '18px 52px', fontSize: 17, fontWeight: 700, letterSpacing: '.04em', boxShadow: '0 16px 48px rgba(45,106,79,0.42)', marginTop: 0 }}>
          Start My Free Roadmap →
        </button>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginTop: 18 }}>Takes 3 minutes · 100% free · No credit card</p>
        <div style={{ display: 'flex', gap: 48, marginTop: 80, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['2,400+', 'Profiles Analyzed'], ['15 Days', 'Personalized Plan'], ['$0', 'Completely Free']].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 34, fontWeight: 900, color: '#2d6a4f' }}>{n}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', letterSpacing: '.06em', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  /* ══════════════ QUIZ ══════════════ */
  if (screen === 'quiz') {
    const q = questions[currentQ]
    const currentAns = answers[q.id]
    return (
      <div style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', overflow: 'hidden' }}>
        <style>{GLOBAL_CSS}</style>
        {MESH}
        {NAV(<span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '.1em' }}>{currentQ + 1} of {totalQ}</span>)}
        {/* Progress bar */}
        <div style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99, height: 3, background: 'rgba(45,106,79,0.15)' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,#2d6a4f,#d4a017)', width: `${progress}%`, transition: 'width .5s ease' }} />
        </div>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px', position: 'relative', zIndex: 1 }}>
          <div style={{ ...card, ...slideStyle }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#d4a017', marginBottom: 14 }}>
              Question {q.num} of {totalQ}
            </div>
            <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 'clamp(22px,3.2vw,34px)', fontWeight: 700, lineHeight: 1.22, marginBottom: 10, color: '#fff' }}>
              {q.title}
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 26 }}>{q.sub}</p>

            {/* SELECT */}
            {q.type === 'select' && q.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {q.options.map(opt => {
                  const sel = currentAns === opt.value
                  return (
                    <button key={opt.value} className="opt-btn" data-sel={sel}
                      onClick={() => handleSelectAnswer(q.id, opt.value)}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderRadius: 50, border: `1.5px solid ${sel ? '#2d6a4f' : 'rgba(255,255,255,0.09)'}`, background: sel ? 'rgba(45,106,79,0.18)' : 'rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'all .18s', textAlign: 'left', color: '#fff', boxShadow: sel ? '0 0 20px rgba(45,106,79,0.2)' : 'none' }}>
                      <span style={{ fontSize: 21, flexShrink: 0 }}>{opt.emoji}</span>
                      <span style={{ flex: 1 }}>
                        <span style={{ display: 'block', fontWeight: 600, fontSize: 14, color: '#fff' }}>{opt.label}</span>
                        {opt.sub && <span style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{opt.sub}</span>}
                      </span>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${sel ? '#2d6a4f' : 'rgba(255,255,255,0.15)'}`, background: sel ? '#2d6a4f' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, transition: 'all .18s' }}>
                        {sel ? '✓' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* TEXTAREA */}
            {q.type === 'textarea' && (
              <>
                <textarea
                  style={{ width: '100%', minHeight: 110, padding: '14px 18px', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, lineHeight: 1.7, resize: 'vertical', fontFamily: 'inherit', transition: 'border-color .2s', marginBottom: 4 }}
                  placeholder={'placeholder' in q ? q.placeholder : ''}
                  value={textAnswers[q.id] || ''}
                  onChange={e => setTextAnswers(t => ({ ...t, [q.id]: e.target.value }))}
                />
                {error && <div style={{ fontSize: 12, color: '#ff7070', marginBottom: 6 }}>{error}</div>}
                <button className="green-btn" style={greenBtn} onClick={validateAndNext}>Continue →</button>
              </>
            )}

            {/* FROMTO */}
            {q.type === 'fromto' && (
              <>
                {[{ label: 'FROM', key: 'from' as const, placeholder: 'fromPlaceholder' as const }, { label: 'TO', key: 'to' as const, placeholder: 'toPlaceholder' as const }].map(({ label, key, placeholder }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <span style={{ width: 52, fontSize: 12, fontWeight: 700, letterSpacing: '.1em', color: '#d4a017', flexShrink: 0 }}>{label}</span>
                    <input
                      style={{ flex: 1, padding: '12px 18px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, transition: 'border-color .2s' }}
                      placeholder={'fromPlaceholder' in q && 'toPlaceholder' in q ? (placeholder === 'fromPlaceholder' ? q.fromPlaceholder : q.toPlaceholder) : ''}
                      value={fromTo[key]}
                      onChange={e => setFromTo(f => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                {error && <div style={{ fontSize: 12, color: '#ff7070', marginBottom: 6 }}>{error}</div>}
                <button className="green-btn" style={greenBtn} onClick={validateAndNext}>Continue →</button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════ EMAIL ══════════════ */
  if (screen === 'email') return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', overflow: 'hidden' }}>
      <style>{GLOBAL_CSS}</style>
      {MESH}
      {NAV()}
      <div style={{ position: 'fixed', top: 56, left: 0, right: 0, zIndex: 99, height: 3, background: 'rgba(45,106,79,0.15)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#2d6a4f,#d4a017)', width: '100%' }} />
      </div>
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ ...card, animation: 'fadeUp .55s ease both' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#d4a017', marginBottom: 14, textAlign: 'center' }}>Your roadmap is ready</div>
          <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#fff' }}>
            Your personalized 15-day roadmap is ready
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 28, lineHeight: 1.7 }}>
            Enter your email to unlock your free dashboard
          </p>
          <div style={{ background: 'rgba(45,106,79,0.08)', border: '1px solid rgba(45,106,79,0.18)', borderRadius: 16, padding: '18px 22px', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#2d6a4f', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>What you&apos;re unlocking</div>
            {['Your full AI-generated 15-day roadmap', 'Daily tasks built from your quiz answers', 'AI business coach available 24/7', 'Revenue tracker toward your $5K goal', '7-day personalized email coaching series'].map(item => (
              <div key={item} style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>✓ {item}</div>
            ))}
          </div>
          <input style={inputStyle} type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} />
          <input style={inputStyle} type="email" placeholder="Your best email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} />
          {error && <div style={{ fontSize: 12, color: '#ff7070', marginBottom: 8 }}>{error}</div>}
          <button className="green-btn" style={greenBtn} onClick={handleEmailSubmit} disabled={submitting}>
            {submitting ? 'Sending your roadmap…' : 'Send My Code →'}
          </button>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', textAlign: 'center', marginTop: 16 }}>🔒 Your info is private. We never spam.</p>
        </div>
      </div>
    </div>
  )

  /* ══════════════ OTP ══════════════ */
  if (screen === 'otp') return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', overflow: 'hidden' }}>
      <style>{GLOBAL_CSS}</style>
      {MESH}
      {NAV()}
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 20px 40px', position: 'relative', zIndex: 1 }}>
        <div style={{ ...card, textAlign: 'center', animation: 'fadeUp .55s ease both' }}>
          <div style={{ fontSize: 52, marginBottom: 18 }}>📬</div>
          <h2 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 28, fontWeight: 700, marginBottom: 10, color: '#fff' }}>Check your inbox</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 34, lineHeight: 1.7 }}>
            Enter the 6-digit code we sent to<br />
            <strong style={{ color: '#fff' }}>{email}</strong>
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
            {otpDigits.map((d, i) => (
              <input key={i} type="text" inputMode="numeric" maxLength={1} value={d}
                ref={el => { otpRefs.current[i] = el }}
                onChange={e => handleOtpDigit(i, e.target.value)}
                onKeyDown={e => handleOtpKey(i, e)}
                style={{ width: 50, height: 58, borderRadius: 13, border: '1.5px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 24, fontWeight: 700, textAlign: 'center', transition: 'all .18s' }}
              />
            ))}
          </div>
          {otpError && <div style={{ fontSize: 12, color: '#ff7070', marginBottom: 12 }}>{otpError}</div>}
          <button className="green-btn" style={greenBtn} onClick={handleOtpSubmit} disabled={submitting}>
            {submitting ? 'Verifying…' : 'Unlock My Roadmap →'}
          </button>
          <button style={{ marginTop: 18, background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }} onClick={handleEmailSubmit}>
            Resend code
          </button>
        </div>
      </div>
    </div>
  )

  /* ══════════════ DASHBOARD ══════════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', paddingBottom: 80 }}>
      <style>{GLOBAL_CSS}</style>
      {MESH}
      {NAV(
        <div style={{ display: 'flex', gap: 20, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          <span>Day {lead?.current_day || 1} of 15</span>
          <span>🔥 {lead?.streak || 0}</span>
          <span style={{ color: '#2d6a4f', fontWeight: 600 }}>${(lead?.revenue_logged || 0).toLocaleString()}</span>
        </div>
      )}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '90px 20px 24px', position: 'relative', zIndex: 1 }}>

        {/* Welcome */}
        <div style={{ marginBottom: 40, animation: 'fadeUp .55s ease both' }}>
          <h1 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 900, color: '#fff' }}>
            Welcome back, {firstName} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, marginTop: 7, maxWidth: 620 }}>{roadmap?.summary || 'Your personalized roadmap to $5,000/month is ready.'}</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 40 }}>
          <StatCard label="Current Day" value={lead?.current_day || 1} color="#d4a017" />
          <StatCard label="Day Streak 🔥" value={lead?.streak || 0} color="#f59e0b" />
          <StatCard label="Revenue Logged" value={lead?.revenue_logged || 0} unit="$" color="#2d6a4f" />
          <StatCard label="Tasks Done Today" value={tasksDoneCount} color="#8b5cf6" />
        </div>

        {/* Progress Ring */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,106,79,0.22)', borderRadius: 24, padding: '32px 36px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle cx="70" cy="70" r="58" fill="none" stroke="url(#rg)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - revPercent / 100)}`}
                transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
              <defs>
                <linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2d6a4f" /><stop offset="100%" stopColor="#d4a017" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>{Math.round(revPercent)}%</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>to $5K</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#d4a017', textTransform: 'uppercase', marginBottom: 8 }}>Revenue to $5,000</div>
            <div style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 38, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
              ${(lead?.revenue_logged || 0).toLocaleString()}
              <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.25)', marginLeft: 8 }}>/ $5,000</span>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              {[500, 1000, 2000, 3000, 5000].map(m => {
                const hit = (lead?.revenue_logged || 0) >= m
                return (
                  <div key={m} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 50, background: hit ? 'rgba(45,106,79,0.25)' : 'rgba(255,255,255,0.04)', color: hit ? '#2d6a4f' : 'rgba(255,255,255,0.25)', border: `1px solid ${hit ? '#2d6a4f40' : 'transparent'}` }}>
                    ${m >= 1000 ? `${m / 1000}K` : m}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Today's Mission */}
        {today && (
          <div style={{ background: 'rgba(45,106,79,0.07)', border: '1px solid rgba(45,106,79,0.28)', borderRadius: 24, padding: '32px', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#d4a017', textTransform: 'uppercase' }}>Day {today.day} Mission</span>
              <span style={{ fontSize: 11, padding: '4px 12px', borderRadius: 50, background: 'rgba(45,106,79,0.18)', color: '#2d6a4f', fontWeight: 600 }}>{today.theme}</span>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 26, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{today.title}</h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginBottom: 24, lineHeight: 1.6 }}>{today.motivation}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              {today.tasks.map((task, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}>
                  <div onClick={() => { const n = [...tasksDone]; n[i] = !n[i]; setTasksDone(n) }}
                    style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${tasksDone[i] ? '#2d6a4f' : 'rgba(255,255,255,0.18)'}`, background: tasksDone[i] ? '#2d6a4f' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all .18s', marginTop: 2 }}>
                    {tasksDone[i] && <span style={{ fontSize: 13, color: '#fff' }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 14, color: tasksDone[i] ? 'rgba(255,255,255,0.35)' : '#fff', textDecoration: tasksDone[i] ? 'line-through' : 'none', lineHeight: 1.65, transition: 'all .18s' }}>{task}</span>
                </label>
              ))}
            </div>
            <div style={{ background: 'rgba(45,106,79,0.1)', border: '1px solid rgba(45,106,79,0.18)', borderRadius: 12, padding: '12px 18px', marginBottom: 20, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
              🏆 <strong style={{ color: '#fff' }}>Win condition:</strong> {today.win_condition}
            </div>
            <button className="green-btn" onClick={handleMarkAllComplete}
              style={{ ...greenBtn, width: 'auto', padding: '14px 32px', marginTop: 0 }}>
              Mark All Complete 🎉
            </button>
          </div>
        )}

        {/* 15-Day Timeline */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>15-Day Journey</div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
            {Array.from({ length: 15 }, (_, i) => i + 1).map(d => {
              const cur = lead?.current_day || 1
              const isToday = d === cur; const isDone = d < cur
              const dp = roadmap?.days?.find(x => x.day === d)
              return (
                <button key={d} className="timeline-day" onClick={() => setActiveDay(d)}
                  style={{ minWidth: 66, padding: '12px 8px', borderRadius: 14, border: `1.5px solid ${isToday ? '#d4a017' : isDone ? 'rgba(45,106,79,0.35)' : 'rgba(255,255,255,0.07)'}`, background: isToday ? 'rgba(212,160,23,0.1)' : isDone ? 'rgba(45,106,79,0.08)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all .18s', animation: isToday ? 'pulseGlow 2s infinite' : 'none', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{isDone ? '✅' : isToday ? '⭐' : '🔒'}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#d4a017' : isDone ? '#2d6a4f' : 'rgba(255,255,255,0.25)' }}>Day {d}</div>
                  {dp && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 58 }}>{dp.theme}</div>}
                </button>
              )
            })}
          </div>
          {activeDay !== (lead?.current_day || 1) && (() => {
            const dp = roadmap?.days?.find(d => d.day === activeDay)
            return dp ? (
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 24px' }}>
                <div style={{ fontSize: 11, color: '#d4a017', fontWeight: 600, marginBottom: 4 }}>Day {activeDay} · {dp.theme}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 10 }}>{dp.title}</div>
                {dp.tasks.map((t, i) => <div key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 5 }}>· {t}</div>)}
              </div>
            ) : null
          })()}
        </div>

        {/* Revenue Logger */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,106,79,0.18)', borderRadius: 24, padding: '28px 32px', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#2d6a4f', textTransform: 'uppercase', marginBottom: 16 }}>Log a Win 💰</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <input style={{ flex: 1, padding: '12px 20px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, fontFamily: 'inherit', transition: 'border-color .2s' }}
              type="number" placeholder="Amount earned ($)" value={revenueInput}
              onChange={e => setRevenueInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRevenueLog()} />
            <button className="green-btn" onClick={handleRevenueLog}
              style={{ padding: '12px 26px', borderRadius: 50, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: 'none', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap', boxShadow: '0 6px 20px rgba(45,106,79,0.28)' }}>
              Add Win
            </button>
          </div>
        </div>

        {/* AI Coach Chat */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(45,106,79,0.18)', borderRadius: 24, padding: '28px 32px', marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#2d6a4f', textTransform: 'uppercase', marginBottom: 20 }}>AI Business Coach</div>
          <div style={{ height: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 14, marginTop: 90 }}>
                Ask your AI coach anything — offer, outreach, pricing, mindset…
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '82%', padding: '12px 16px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', background: m.role === 'user' ? 'rgba(45,106,79,0.25)' : 'rgba(255,255,255,0.06)', fontSize: 14, lineHeight: 1.7, color: '#fff', border: `1px solid ${m.role === 'user' ? 'rgba(45,106,79,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: 5, padding: '10px 14px', width: 'fit-content' }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d6a4f', animation: `pulse 1.2s ${i * 0.18}s infinite` }} />)}
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="chat-input"
              style={{ flex: 1, padding: '12px 20px', borderRadius: 50, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'inherit', transition: 'border-color .2s' }}
              placeholder="Ask your AI coach…" value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()} />
            <button className="green-btn" onClick={handleChatSend} disabled={chatLoading}
              style={{ padding: '12px 22px', borderRadius: 50, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 6px 20px rgba(45,106,79,0.28)' }}>
              Send
            </button>
          </div>
        </div>

        {/* Roadmap Insights */}
        {roadmap && (
          <div style={{ background: 'rgba(212,160,23,0.04)', border: '1px solid rgba(212,160,23,0.18)', borderRadius: 24, padding: '28px 32px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', color: '#d4a017', textTransform: 'uppercase', marginBottom: 18 }}>Your AI Roadmap Insights</div>
            <div style={{ display: 'grid', gap: 18 }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Biggest Opportunity</div>
                <div style={{ fontSize: 15, color: '#fff', lineHeight: 1.65 }}>{roadmap.biggest_opportunity}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 5 }}>Your First Action</div>
                <div style={{ fontSize: 15, color: '#2d6a4f', fontWeight: 600, lineHeight: 1.65 }}>{roadmap.first_action}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, background: 'linear-gradient(135deg,#172e20,#2d6a4f)', borderTop: '1px solid rgba(45,106,79,0.35)', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>Ready to build this faster with 1:1 coaching?</span>
        <a href="https://the5thconsulting.typeform.com/to/u9maum7Y" target="_blank" rel="noopener noreferrer"
          style={{ padding: '10px 26px', borderRadius: 50, background: '#fff', color: '#172e20', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, transition: 'transform .2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
          Book your free strategy call →
        </a>
      </div>
    </div>
  )
}
