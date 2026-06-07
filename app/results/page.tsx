'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

/* ─── Types ─── */
interface Section { title: string; content: string }

/* ─── Roadmap parser ─── */
function parseRoadmap(text: string): Section[] {
  if (!text) return []
  const parts = text.split(/\n(?=## )/g)
  const sections: Section[] = []
  for (const part of parts) {
    const trimmed = part.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('##')) {
      const nlIdx = trimmed.indexOf('\n')
      if (nlIdx === -1) {
        sections.push({ title: trimmed.replace(/^##\s*/, '').trim(), content: '' })
      } else {
        sections.push({
          title: trimmed.slice(0, nlIdx).replace(/^##\s*/, '').trim(),
          content: trimmed.slice(nlIdx + 1).trim()
        })
      }
    }
  }
  return sections.filter(s => s.title)
}

/* ─── Helpers ─── */
function getIcon(title: string): string {
  const t = title.toUpperCase()
  if (t.includes('SITUATION') || t.includes('RIGHT NOW')) return '📍'
  if (t.includes('ARCHETYPE STRATEGY')) return '🎯'
  if (t.includes('SIGNATURE OFFER') || t.includes('OFFER')) return '💎'
  if (t.includes('LEAD MAGNET')) return '🧲'
  if (t.includes('DIGITAL PRODUCT')) return '📦'
  if (t.includes('7-DAY') || t.includes('ACTION PLAN')) return '📅'
  if (t.includes('CONTENT STRATEGY') || t.includes('CONTENT')) return '✍️'
  if (t.includes('PRICING')) return '💰'
  if (t.includes('OPPORTUNITY')) return '🚀'
  return '✦'
}

function formatStage(q1: string): string {
  const m: Record<string, string> = { starting: 'The Pioneer', idea: 'The Pioneer', launched: 'The Pathfinder', scaling: 'The Builder' }
  return m[q1] || q1 || 'Starting'
}

function formatGoal(q18: string): string {
  const m: Record<string, string> = { '1-3k': '$1K–$3K/mo', '3-5k': '$3K–$5K/mo', '5-10k': '$5K–$10K/mo', '10k+': '$10K+/mo' }
  return m[q18] || q18 || 'Goal'
}

function formatHours(q19: string): string {
  const m: Record<string, string> = { lt5: '<5 hrs/week', '5-10': '5–10 hrs/week', '10-20': '10–20 hrs/week', '20+': '20+ hrs/week' }
  return m[q19] || q19 || 'hrs/week'
}

function getWeekTheme(n: number): string {
  const themes: Record<number, string> = { 1: 'Foundation', 2: 'Visibility', 3: 'Outreach', 4: 'Conversion' }
  return themes[n] || `Week ${n}`
}

/* ─── Inline markdown ─── */
function inlineMd(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  if (parts.length === 1) return text
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: '#0a0a0a', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : p
  )
}

/* ─── Line renderer ─── */
function renderLine(line: string, i: number) {
  const t = line.trim()
  if (!t) return <div key={i} style={{ height: 8 }} />
  if (t.startsWith('- ') || t.startsWith('* ')) {
    return (
      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1c4a32', flexShrink: 0, marginTop: 9 }} />
        <span style={{ fontSize: 15, color: '#555', lineHeight: 1.75 }}>{inlineMd(t.slice(2))}</span>
      </div>
    )
  }
  const boldFull = t.match(/^\*\*(.+?)\*\*$/)
  if (boldFull) {
    return <p key={i} style={{ fontSize: 12, fontWeight: 700, color: '#b8920a', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, marginTop: 20 }}>{boldFull[1]}</p>
  }
  return <p key={i} style={{ fontSize: 15, color: '#555', lineHeight: 1.8, marginBottom: 10 }}>{inlineMd(t)}</p>
}

/* ─── Section number ─── */
function SectionNum({ n }: { n: number }) {
  return (
    <div style={{ fontSize: 80, fontWeight: 900, color: 'rgba(28,74,50,0.07)', lineHeight: 1, position: 'absolute', top: 16, right: 24, fontFamily: 'sans-serif', userSelect: 'none' }}>
      {String(n).padStart(2, '0')}
    </div>
  )
}

/* ─── Card header ─── */
function CardHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#1c4a32', textTransform: 'uppercase' }}>
        {title}
      </span>
    </div>
  )
}

/* ─── 7-Day plan card ─── */
function ContentPlanCard({ section, num }: { section: Section; num: number }) {
  const [activeDay, setActiveDay] = useState(0)
  const blocks: { day: string; lines: string[] }[] = []
  let cur: { day: string; lines: string[] } | null = null
  for (const line of section.content.split('\n')) {
    const m = line.match(/^\*?\*?Day\s+(\d+)[:\-—]?\*?\*?\s*(.*)/i)
    if (m) {
      if (cur) blocks.push(cur)
      cur = { day: `Day ${m[1]}`, lines: m[2].trim() ? [m[2].trim()] : [] }
    } else if (cur) { cur.lines.push(line) }
  }
  if (cur) blocks.push(cur)
  const icon = getIcon(section.title)
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
      <SectionNum n={num} />
      <CardHeader title={section.title} icon={icon} />
      {blocks.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 24, scrollbarWidth: 'none' }}>
            {blocks.map((b, i) => (
              <button key={i} onClick={() => setActiveDay(i)} style={{
                padding: '8px 18px', borderRadius: 50, flexShrink: 0,
                background: activeDay === i ? '#1c4a32' : '#f8f7f4',
                border: `1px solid ${activeDay === i ? '#1c4a32' : '#e8e8e8'}`,
                color: activeDay === i ? '#fff' : '#555',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.18s ease', fontFamily: 'inherit'
              }}>{b.day}</button>
            ))}
          </div>
          <div style={{ background: '#f8f7f4', borderRadius: 14, padding: '24px 28px', border: '1px solid #e8e8e8' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1c4a32', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
              {blocks[activeDay]?.day}
            </div>
            {blocks[activeDay]?.lines.map((l, i) => renderLine(l, i))}
          </div>
        </>
      ) : (
        <div>{section.content.split('\n').map((l, i) => renderLine(l, i))}</div>
      )}
    </div>
  )
}

/* ─── Week content ─── */
function WeekContent({ lines }: { lines: string[] }) {
  const bulletLines = lines.filter(l => l.trim().startsWith('- ') || l.trim().startsWith('* ')).slice(0, 3)
  const allMeaningful = lines.filter(l => l.trim()).slice(0, 3)
  const items = bulletLines.length > 0 ? bulletLines.map(l => l.trim().slice(2)) : allMeaningful
  return (
    <div style={{ background: '#f0f8f2', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      {items.map((item, j) => (
        <div key={j} style={{ display: 'flex', gap: 14, marginBottom: j < items.length - 1 ? 16 : 0, alignItems: 'flex-start' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1c4a32', color: '#fff', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {j + 1}
          </div>
          <span style={{ fontSize: 14, color: '#333', lineHeight: 1.7, paddingTop: 3 }}>{inlineMd(item)}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── Action plan card ─── */
function ActionPlanCard({ section, num }: { section: Section; num: number }) {
  const [openWeek, setOpenWeek] = useState(0)
  const weeks: { label: string; weekNum: number; theme: string; lines: string[] }[] = []
  let cur: { label: string; weekNum: number; theme: string; lines: string[] } | null = null
  for (const line of section.content.split('\n')) {
    const m = line.match(/^Week\s+(\d+)[:\-]?\s*(.*)/i)
    if (m) {
      if (cur) weeks.push(cur)
      const weekNum = parseInt(m[1])
      cur = { label: `Week ${m[1]}`, weekNum, theme: m[2].trim() || getWeekTheme(weekNum), lines: [] }
    } else if (cur) { cur.lines.push(line) }
  }
  if (cur) weeks.push(cur)
  const icon = getIcon(section.title)
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
      <SectionNum n={num} />
      <CardHeader title={section.title} icon={icon} />
      {weeks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ borderBottom: i < weeks.length - 1 ? '1px solid #e8e8e8' : 'none' }}>
              <button onClick={() => setOpenWeek(openWeek === i ? -1 : i)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                <div style={{ background: '#1c4a32', color: '#fff', borderRadius: 50, padding: '4px 14px', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{w.label}</div>
                <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#0a0a0a' }}>{w.theme}</span>
                <span style={{ color: '#1c4a32', fontSize: 20, flexShrink: 0, display: 'inline-block', transform: openWeek === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s ease' }}>▾</span>
              </button>
              {openWeek === i && <WeekContent lines={w.lines} />}
            </div>
          ))}
        </div>
      ) : (
        <div>{section.content.split('\n').map((l, i) => renderLine(l, i))}</div>
      )}
    </div>
  )
}

/* ─── Skeleton ─── */
function SkeletonCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[1, 0.8, 1, 0.7, 0.9, 0.6].map((_, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 20, padding: '36px 40px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ height: 12, background: 'rgba(0,0,0,0.07)', borderRadius: 6, width: '30%', marginBottom: 24, animation: 'skPulse 1.4s ease-in-out infinite' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[90, 75, 85, 60, 80].map((w, j) => (
              <div key={j} style={{ height: 14, background: 'rgba(0,0,0,0.05)', borderRadius: 6, width: w + '%', animation: `skPulse 1.4s ${j * 0.12}s ease-in-out infinite` }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const LOADING_MESSAGES = [
  'Reading your 20 answers...',
  'Identifying your Expert Archetype...',
  'Mapping your personality type...',
  'Building your signature offer...',
  'Writing your personalised 7-day plan...',
  'Finalising your blueprint...',
]

/* ─── Dynamic VSL headline ─── */
function getVSLHeadline(firstName: string, q1: string): string {
  const h: Record<string, string> = {
    starting: `${firstName}, you are The Pioneer — and this video shows exactly why you haven't got your first client yet (and how to fix it this week)`,
    idea:     `${firstName}, you are The Pioneer — and this video shows exactly why you haven't got your first client yet (and how to fix it this week)`,
    launched: `${firstName}, you are The Pathfinder — and this video reveals the exact reason your income is still inconsistent (it's not what you think)`,
    scaling:  `${firstName}, you are The Builder — and this video shows the one architectural shift that breaks your revenue ceiling for good`,
    established: `${firstName}, you are The Luminary — and this video reveals the strategy shift that takes you from great to genuinely untouchable`,
  }
  return h[q1] || `${firstName}, your personalised video is ready`
}

/* ─── Dynamic VSL subheadline ─── */
function getVSLSub(q2: string): string {
  const s: Record<string, string> = {
    action:     'You are wired for action. Watch this short video to see the exact moves that match how you operate — then book your free strategy call below.',
    connection: 'You build through relationships, not hustle. Watch this video to see the strategy that fits how you are naturally wired — then let\'s talk.',
    ideas:      'Your biggest asset is how you think. This video shows you how to turn that into a system that generates consistent income — watch it now.',
    meaning:    'You do not need to hustle to build a $10K month. This video shows you the gentle path that actually works for someone wired like you.',
  }
  return s[q2] || 'Watch your personalised video then book a free strategy call below.'
}

/* ─── Personality label ─── */
function getPersonalityLabel(q2: string): string {
  const p: Record<string, string> = { action: 'The Driver', connection: 'The Flow Worker', ideas: 'The Deep Thinker', meaning: 'The Gentle Builder' }
  return p[q2] || 'The Driver'
}

/* ─── Main page ─── */
export default function ResultsPage() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [answers, setAnswers]     = useState<Record<string, string>>({})
  const [roadmap, setRoadmap]     = useState('')
  const [loading, setLoading]     = useState(true)
  const [msgIdx, setMsgIdx]       = useState(0)
  const [progress, setProgress]   = useState(0)
  const [archetype, setArchetype] = useState('')
  const [personalityType, setPersonalityType] = useState('')

  useEffect(() => {
    if (!loading) return
    const iv = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2000)
    return () => clearInterval(iv)
  }, [loading])

  useEffect(() => {
    if (loading) { const t = setTimeout(() => setProgress(90), 50); return () => clearTimeout(t) }
    else setProgress(100)
  }, [loading])

  useEffect(() => {
    const storedName    = sessionStorage.getItem('quiz_name')    || ''
    const storedEmail   = sessionStorage.getItem('quiz_email')   || ''
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
    if (q1 === 'scaling')  return 'v3'
    return 'v1'
  }

  const generateRoadmap = async (n: string, a: Record<string, string>) => {
    try {
      const res  = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: a, name: n })
      })
      const data = await res.json()
      setRoadmap(data.roadmap || '')
      if (data.archetype)   setArchetype(data.archetype)
      if (data.personality) setPersonalityType(data.personality)

      // Fire-and-forget PDF email
      const storedEmail   = sessionStorage.getItem('quiz_email') || ''
      const storedAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}')
      if (storedEmail && data.roadmap) {
        fetch('/api/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:        n,
            email:       storedEmail,
            roadmap:     data.roadmap,
            archetype:   data.archetype   || 'The Pioneer',
            personality: data.personality || 'action',
            stage:       storedAnswers?.q1  || 'starting',
            goal:        storedAnswers?.q18 || '$5K-$10K / month',
            hours:       storedAnswers?.q19 || '10-20',
            videoSlug:   getVideoSlug(storedAnswers?.q1 || 'starting'),
          })
        })
          .then(r => r.json())
          .then(d => console.log('PDF sent:', d))
          .catch(err => console.error('PDF error:', err))
      }
    } catch {
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
        body: JSON.stringify({ name: n, email: e, quiz_answers: a, video_assigned: getVideoSlug(a.q1), sequence_assigned: 'A' })
      })
      fetch('/api/sync-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n, email: e, stage: a.q1 || 'starting', goal: a.q18 || '$5K-$10K / month', hours: a.q19 || '10-20', video_assigned: getVideoSlug(a.q1), quiz_answers: a })
      }).catch(() => {})
      fetch('/api/send-sequence-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: e, name: n, day: 0, sequence: 'A', video_slug: getVideoSlug(a.q1) })
      }).catch(() => {})
    } catch { /* non-critical */ }
  }

  const firstName  = name.split(' ')[0] || 'there'
  const sections   = parseRoadmap(roadmap)
  const vslHeadline = getVSLHeadline(firstName, answers.q1 || 'starting')
  const vslSub      = getVSLSub(answers.q2 || 'action')
  const personLabel = getPersonalityLabel(answers.q2 || 'action')

  /* ─── Card renderer ─── */
  function renderCard(section: Section, idx: number) {
    const num = idx + 1
    const icon = getIcon(section.title)
    const titleUpper = section.title.toUpperCase()
    if (titleUpper.includes('7-DAY') || titleUpper.includes('ACTION PLAN')) {
      return <ContentPlanCard key={idx} section={section} num={num} />
    }
    if (titleUpper.includes('PRICING')) {
      return (
        <div key={idx} style={{ background: '#fff', border: '1px solid #e8e8e8', borderLeft: '4px solid #b8920a', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <SectionNum n={num} /><CardHeader title={section.title} icon={icon} />
          <div>{section.content.split('\n').map((l, i) => renderLine(l, i))}</div>
        </div>
      )
    }
    if (titleUpper.includes('OPPORTUNITY')) {
      return (
        <div key={idx} style={{ background: '#f5fbf7', border: '1px solid #e8e8e8', borderLeft: '4px solid #1c4a32', borderRadius: 20, padding: '40px 44px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <SectionNum n={num} /><CardHeader title={section.title} icon={icon} />
          <div style={{ fontSize: 17, color: '#333', lineHeight: 1.85 }}>
            {section.content.split('\n').map((l, i) => { const t = l.trim(); if (!t) return <div key={i} style={{ height: 8 }} />; return <p key={i} style={{ marginBottom: 12 }}>{inlineMd(t)}</p> })}
          </div>
        </div>
      )
    }
    if (titleUpper.includes('SIGNATURE OFFER') || titleUpper.includes('ARCHETYPE STRATEGY')) {
      return (
        <div key={idx} style={{ background: '#fff', border: '1px solid #e8e8e8', borderLeft: '4px solid #1c4a32', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <SectionNum n={num} /><CardHeader title={section.title} icon={icon} />
          <div>{section.content.split('\n').map((l, i) => renderLine(l, i))}</div>
        </div>
      )
    }
    return (
      <div key={idx} style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <SectionNum n={num} /><CardHeader title={section.title} icon={icon} />
        <div>{section.content.split('\n').map((l, i) => renderLine(l, i))}</div>
      </div>
    )
  }

  function renderSections() {
    if (sections.length === 0) return null
    return sections.map((section, idx) => renderCard(section, idx))
  }

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes msgFade { 0%{opacity:0;transform:translateY(6px)} 12%{opacity:1;transform:translateY(0)} 88%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-4px)} }
        `}</style>
        <div style={{ textAlign: 'center', maxWidth: 320, padding: '0 24px', width: '100%' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(139,127,207,0.2)', borderTopColor: '#8b7fcf', animation: 'spin 0.85s linear infinite', margin: '0 auto 36px' }} />
          <p key={msgIdx} style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 10, minHeight: 26, lineHeight: 1.4, animation: 'msgFade 2s ease forwards' }}>
            {LOADING_MESSAGES[msgIdx]}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>Usually takes 10–15 seconds</p>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: '#8b7fcf', borderRadius: 2, width: `${progress}%`, transition: 'width 10s linear' }} />
          </div>
        </div>
      </div>
    )
  }

  /* ─── Full page ─── */
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', system-ui, sans-serif", color: '#0a0a0a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes skPulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        .ru { animation: fadeUp 0.55s ease both; }
        .ru2 { animation: fadeUp 0.55s 0.1s ease both; }
        .ru3 { animation: fadeUp 0.55s 0.2s ease both; }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(28,74,50,0.3); border-radius: 2px; }
        @media (max-width: 768px) {
          .res-vsl-h { font-size: 24px !important; }
          .res-cards { padding: 40px 20px !important; }
          .res-card { padding: 24px 20px !important; }
          .res-cta2 { padding: 60px 24px !important; }
        }
        @media (max-width: 480px) {
          .res-vsl-h { font-size: 20px !important; }
          .res-notif { font-size: 12px !important; padding: 10px 16px !important; }
        }
      `}</style>

      {/* ── SECTION 1: NOTIFICATION BAR ── */}
      <div className="res-notif" style={{ background: '#1c4a32', color: '#fff', textAlign: 'center', padding: '12px 24px', fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
        📧 Your personalised PDF blueprint has been sent to {email || 'your inbox'} — check your inbox now
      </div>

      {/* ── SECTION 2: HEADER ── */}
      <header style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="26" viewBox="0 0 32 36" fill="none">
            <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#1c4a32"/>
          </svg>
          <Image src="/logo-white.png" alt="The5th Consulting" width={140} height={32} style={{ objectFit: 'contain' }} />
        </div>
        {firstName && firstName !== 'there' && (
          <div style={{ background: '#f0f8f2', borderRadius: 50, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#1c4a32' }}>
            {firstName}&apos;s Blueprint
          </div>
        )}
      </header>

      {/* ── SECTION 3: VSL HERO (dark) ── */}
      <section style={{ background: '#0d0d0b', padding: '64px 40px 56px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>

          {/* Top label */}
          <div className="ru" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: '#1c4a32', textTransform: 'uppercase', marginBottom: 24, textAlign: 'center' }}>
            Your Personalised Results Are Ready
          </div>

          {/* Archetype + personality badges */}
          <div className="ru" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {archetype && (
              <div style={{ background: '#1c4a32', color: '#fff', borderRadius: 50, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>
                {archetype}
              </div>
            )}
            <div style={{ background: '#8b7fcf', color: '#fff', borderRadius: 50, padding: '6px 18px', fontSize: 13, fontWeight: 700 }}>
              {personLabel}
            </div>
          </div>

          {/* Dynamic headline */}
          <h1 className="ru2 res-vsl-h" style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px, 3.5vw, 40px)', fontWeight: 900, color: '#fff', lineHeight: 1.2, textAlign: 'center', maxWidth: 760, margin: '0 auto 20px' }}>
            {vslHeadline}
          </h1>

          {/* Dynamic subheadline */}
          <p className="ru3" style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, textAlign: 'center', maxWidth: 600, margin: '0 auto 40px' }}>
            {vslSub}
          </p>

          {/* Video placeholder */}
          <div className="ru3" style={{ maxWidth: 760, margin: '0 auto 36px', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, aspectRatio: '16/9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            {/* Replace this div with your Wistia embed */}
            <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '14px 0 14px 24px', borderColor: 'transparent transparent transparent rgba(255,255,255,0.9)', marginLeft: 4 }} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>Your Personalised Video</p>
              <p style={{ fontSize: 13, color: '#8b7fcf', fontWeight: 600 }}>{archetype || formatStage(answers.q1 || 'starting')}</p>
            </div>
          </div>

          {/* Booking CTA */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20, fontStyle: 'italic' }}>
              Watched the video? Here is your next step.
            </p>
            <a
              href="https://cal.com/indrodip-ghosh-ut1vxh/60min"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-block', background: '#8b7fcf', color: '#fff', fontSize: 18, fontWeight: 700, padding: '18px 48px', borderRadius: 50, textDecoration: 'none', boxShadow: '0 8px 32px rgba(139,127,207,0.4)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(139,127,207,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,127,207,0.4)' }}
            >
              Book Your Free Strategy Call with Indrodip
            </a>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 14 }}>60 minutes. Free. No pressure. Just clarity.</p>
          </div>

        </div>
      </section>

      {/* ── SECTION 4: ROADMAP ── */}
      <section className="res-cards" style={{ background: '#fff', padding: '60px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>

          {/* Archetype + personality pills */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
            {archetype && (
              <div style={{ background: '#8b7fcf', color: '#fff', borderRadius: 50, padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>
                Archetype: {archetype}
              </div>
            )}
            <div style={{ background: '#f0f8f2', color: '#1c4a32', borderRadius: 50, padding: '8px 20px', fontSize: 13, fontWeight: 700 }}>
              Personality: {personLabel}
            </div>
            {answers.q1 && (
              <div style={{ background: '#f5f5f5', color: '#555', borderRadius: 50, padding: '8px 20px', fontSize: 13, fontWeight: 600 }}>
                Stage: {formatStage(answers.q1)}
              </div>
            )}
            {answers.q18 && (
              <div style={{ background: '#f5f5f5', color: '#555', borderRadius: 50, padding: '8px 20px', fontSize: 13, fontWeight: 600 }}>
                Goal: {formatGoal(answers.q18)}
              </div>
            )}
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 3vw, 38px)', fontWeight: 900, color: '#0a0a0a', marginBottom: 8, lineHeight: 1.2 }}>
            Your Personalised Blueprint
          </h2>
          <p style={{ fontSize: 15, color: '#888', marginBottom: 40, lineHeight: 1.6 }}>
            Every section below is built from your 20 answers. Your PDF copy has been emailed to you.
          </p>

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {loading ? <SkeletonCards /> : renderSections()}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: SECOND BOOKING CTA ── */}
      <section className="res-cta2" style={{ background: '#1c4a32', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.15 }}>
            Ready to build this with Indrodip?
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Your roadmap is ready. Your PDF is in your inbox. The only thing left is one conversation.
          </p>
          <a
            href="https://cal.com/indrodip-ghosh-ut1vxh/60min"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', background: '#e8b84b', color: '#111', fontSize: 17, fontWeight: 700, padding: '18px 48px', borderRadius: 50, textDecoration: 'none', boxShadow: '0 8px 28px rgba(232,184,75,0.4)', transition: 'transform 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = '' }}
          >
            Book Your Free Strategy Call
          </a>
        </div>
      </section>

    </div>
  )
}
