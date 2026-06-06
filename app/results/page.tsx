'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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
  if (t.includes('SIGNATURE OFFER') || t.includes('OFFER')) return '💎'
  if (t.includes('LEAD MAGNET')) return '🧲'
  if (t.includes('DIGITAL PRODUCT')) return '📦'
  if (t.includes('CONTENT PLAN') || t.includes('7-DAY')) return '📅'
  if (t.includes('ACTION PLAN') || t.includes('30-DAY')) return '🗺️'
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

/* ─── Inline markdown (bold **text**) ─── */
function inlineMd(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  if (parts.length === 1) return text
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ color: '#0a0a0a', fontWeight: 700 }}>{p.slice(2, -2)}</strong>
      : p
  )
}

/* ─── Line renderer (light mode) ─── */
function renderLine(line: string, i: number) {
  const t = line.trim()
  if (!t) return <div key={i} style={{ height: 8 }} />
  if (t.startsWith('- ') || t.startsWith('* ')) {
    return (
      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#225840', flexShrink: 0, marginTop: 9 }} />
        <span style={{ fontSize: 15, color: '#555555', lineHeight: 1.75 }}>{inlineMd(t.slice(2))}</span>
      </div>
    )
  }
  const boldFull = t.match(/^\*\*(.+?)\*\*$/)
  if (boldFull) {
    return <p key={i} style={{ fontSize: 12, fontWeight: 700, color: '#b8960c', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8, marginTop: 20 }}>{boldFull[1]}</p>
  }
  return <p key={i} style={{ fontSize: 15, color: '#555555', lineHeight: 1.8, marginBottom: 10 }}>{inlineMd(t)}</p>
}

/* ─── Section number label ─── */
function SectionNum({ n }: { n: number }) {
  return (
    <div style={{ fontSize: 80, fontWeight: 900, color: 'rgba(34,88,64,0.08)', lineHeight: 1, position: 'absolute', top: 16, right: 24, fontFamily: 'Inter, sans-serif', userSelect: 'none' }}>
      {String(n).padStart(2, '0')}
    </div>
  )
}

/* ─── Card header ─── */
function CardHeader({ title, icon }: { title: string; icon: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: '#225840', textTransform: 'uppercase' }}>
        {title}
      </span>
    </div>
  )
}

/* ─── 7-Day content plan card ─── */
function ContentPlanCard({ section, num }: { section: Section; num: number }) {
  const [activeDay, setActiveDay] = useState(0)

  const blocks: { day: string; lines: string[] }[] = []
  let cur: { day: string; lines: string[] } | null = null
  for (const line of section.content.split('\n')) {
    const m = line.match(/^Day\s+(\d+)[:\-]?\s*(.*)/i)
    if (m) {
      if (cur) blocks.push(cur)
      cur = { day: `Day ${m[1]}`, lines: m[2].trim() ? [m[2].trim()] : [] }
    } else if (cur) {
      cur.lines.push(line)
    }
  }
  if (cur) blocks.push(cur)

  const icon = getIcon(section.title)

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
      <SectionNum n={num} />
      <CardHeader title={section.title} icon={icon} />

      {blocks.length > 0 ? (
        <>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 16, marginBottom: 24, scrollbarWidth: 'none' }}>
            {blocks.map((b, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                style={{
                  padding: '8px 18px', borderRadius: 50, flexShrink: 0,
                  background: activeDay === i ? '#225840' : '#f8f7f4',
                  border: `1px solid ${activeDay === i ? '#225840' : '#e8e8e8'}`,
                  color: activeDay === i ? '#fff' : '#555555',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.18s ease', fontFamily: 'inherit'
                }}
              >
                {b.day}
              </button>
            ))}
          </div>
          <div style={{ background: '#f8f7f4', borderRadius: 14, padding: '24px 28px', border: '1px solid #e8e8e8' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#225840', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 16 }}>
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

/* ─── Accordion week content ─── */
function WeekContent({ lines }: { lines: string[] }) {
  const bulletLines = lines.filter(l => l.trim().startsWith('- ') || l.trim().startsWith('* ')).slice(0, 3)
  const allMeaningful = lines.filter(l => l.trim()).slice(0, 3)
  const items = bulletLines.length > 0 ? bulletLines.map(l => l.trim().slice(2)) : allMeaningful
  return (
    <div style={{ background: '#f0f8f2', borderRadius: 12, padding: 20, marginBottom: 16 }}>
      {items.map((item, j) => (
        <div key={j} style={{ display: 'flex', gap: 14, marginBottom: j < items.length - 1 ? 16 : 0, alignItems: 'flex-start' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%', background: '#225840',
            color: '#fff', fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            {j + 1}
          </div>
          <span style={{ fontSize: 14, color: '#333333', lineHeight: 1.7, paddingTop: 3 }}>
            {inlineMd(item)}
          </span>
        </div>
      ))}
    </div>
  )
}

/* ─── 30-Day action plan card — vertical accordion ─── */
function ActionPlanCard({ section, num }: { section: Section; num: number }) {
  const [openWeek, setOpenWeek] = useState(0)

  const weeks: { label: string; weekNum: number; theme: string; lines: string[] }[] = []
  let cur: { label: string; weekNum: number; theme: string; lines: string[] } | null = null
  for (const line of section.content.split('\n')) {
    const m = line.match(/^Week\s+(\d+)[:\-]?\s*(.*)/i)
    if (m) {
      if (cur) weeks.push(cur)
      const weekNum = parseInt(m[1])
      const parsedTheme = m[2].trim()
      cur = { label: `Week ${m[1]}`, weekNum, theme: parsedTheme || getWeekTheme(weekNum), lines: [] }
    } else if (cur) {
      cur.lines.push(line)
    }
  }
  if (cur) weeks.push(cur)

  const icon = getIcon(section.title)

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
      <SectionNum n={num} />
      <CardHeader title={section.title} icon={icon} />

      {weeks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ borderBottom: i < weeks.length - 1 ? '1px solid #e8e8e8' : 'none' }}>
              {/* Row header */}
              <button
                onClick={() => setOpenWeek(openWeek === i ? -1 : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                  padding: '18px 0', background: 'none', border: 'none',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit'
                }}
              >
                {/* Week pill */}
                <div style={{
                  background: '#225840', color: '#fff', borderRadius: 50,
                  padding: '4px 14px', fontSize: 12, fontWeight: 700,
                  flexShrink: 0, whiteSpace: 'nowrap'
                }}>
                  {w.label}
                </div>
                {/* Theme title */}
                <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#0a0a0a' }}>
                  {w.theme}
                </span>
                {/* Arrow */}
                <span style={{
                  color: '#225840', fontSize: 20, flexShrink: 0, lineHeight: 1,
                  display: 'inline-block',
                  transform: openWeek === i ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.22s ease'
                }}>▾</span>
              </button>
              {/* Expanded area */}
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

/* ─── Skeleton loader ─── */
function SkeletonCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {[1, 0.8, 1, 0.7, 0.9, 0.6].map((_, i) => (
        <div key={i} style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 20, padding: '36px 40px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
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

/* ─── Loading messages ─── */
const LOADING_MESSAGES = [
  'Reading your 20 answers...',
  'Mapping your business stage...',
  'Identifying your biggest opportunity...',
  'Building your signature offer...',
  'Writing your 7-day content plan...',
  'Finalising your personalised blueprint...',
]

/* ─── Main page ─── */
export default function ResultsPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [roadmap, setRoadmap] = useState('')
  const [loading, setLoading] = useState(true)
  const [noVideoClicked, setNoVideoClicked] = useState(false)
  const [msgIdx, setMsgIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [archetype, setArchetype] = useState('')
  const [personalityType, setPersonalityType] = useState('')

  // Cycle loading messages every 2 s
  useEffect(() => {
    if (!loading) return
    const iv = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 2000)
    return () => clearInterval(iv)
  }, [loading])

  // Animate progress bar 0→90 over 10 s while loading, snap to 100 when done
  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setProgress(90), 50)
      return () => clearTimeout(t)
    } else {
      setProgress(100)
    }
  }, [loading])

  useEffect(() => {
    const storedName = sessionStorage.getItem('quiz_name') || ''
    const storedEmail = sessionStorage.getItem('quiz_email') || ''
    const storedAnswers = JSON.parse(sessionStorage.getItem('quiz_answers') || '{}')
    setName(storedName)
    setEmail(storedEmail)
    setAnswers(storedAnswers)
    generateRoadmap(storedName, storedEmail, storedAnswers)
    saveLead(storedName, storedEmail, storedAnswers)
  }, [])

  const getVideoSlug = (q1: string) => {
    if (q1 === 'starting' || q1 === 'idea') return 'v1'
    if (q1 === 'launched') return 'v2'
    if (q1 === 'scaling') return 'v3'
    return 'v1'
  }

  const generateRoadmap = async (n: string, e: string, a: Record<string, string>) => {
    try {
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: a, name: n })
      })
      const data = await res.json()
      setRoadmap(data.roadmap || '')
      if (data.archetype) setArchetype(data.archetype)
      if (data.personality) setPersonalityType(data.personality)

      // Send blueprint email (fire-and-forget)
      fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n,
          email: e,
          roadmap: data.roadmap,
          stage: a.q1 || 'launched',
          goal: a.q18 || '$5K-$10K / month',
          hours: a.q19 || '10-20',
          videoSlug: getVideoSlug(a.q1),
          archetype: data.archetype || 'The Pioneer',
          personality: data.personality || 'action'
        })
      }).catch(err => console.error('Email send error:', err))
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
        body: JSON.stringify({ name: n, email: e, quiz_answers: a, video_assigned: getVideoSlug(a.q1) })
      })

      // Sync to Attio CRM and Beehiiv (fire-and-forget)
      fetch('/api/sync-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: n,
          email: e,
          stage: a.q1 || 'starting',
          goal: a.q18 || '$5K-$10K / month',
          hours: a.q19 || '10-20',
          video_assigned: getVideoSlug(a.q1),
          quiz_answers: a,
        })
      }).catch(err => console.error('Sync error:', err))

      // Send Day 0 sequence email immediately (fire-and-forget)
      fetch('/api/send-sequence-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: e,
          name: n,
          day: 0,
          sequence: 'A',
          video_slug: getVideoSlug(a.q1),
        })
      }).catch(err => console.error('Day 0 email error:', err))
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
  const sections = parseRoadmap(roadmap)

  /* ─── Card renderer ─── */
  function renderCard(section: Section, idx: number) {
    const num = idx + 1
    const icon = getIcon(section.title)
    const titleUpper = section.title.toUpperCase()

    // 5th card: 7-day content plan
    if (titleUpper.includes('CONTENT PLAN') || titleUpper.includes('7-DAY')) {
      return <ContentPlanCard key={idx} section={section} num={num} />
    }

    // 6th card: 30-day action plan — accordion
    if (titleUpper.includes('ACTION PLAN') || titleUpper.includes('30-DAY')) {
      return <ActionPlanCard key={idx} section={section} num={num} />
    }

    // Pricing card — gold left border
    if (titleUpper.includes('PRICING')) {
      return (
        <div key={idx} style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderLeft: '4px solid #b8960c', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <SectionNum n={num} />
          <CardHeader title={section.title} icon={icon} />
          <div>{section.content.split('\n').map((l, i) => renderLine(l, i))}</div>
        </div>
      )
    }

    // Opportunity card — subtle green tint, green left border
    if (titleUpper.includes('OPPORTUNITY')) {
      return (
        <div key={idx} style={{ background: '#f5fbf7', border: '1px solid #e8e8e8', borderLeft: '4px solid #225840', borderRadius: 20, padding: '40px 44px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <SectionNum n={num} />
          <CardHeader title={section.title} icon={icon} />
          <div style={{ fontSize: 17, color: '#333333', lineHeight: 1.85 }}>
            {section.content.split('\n').map((l, i) => {
              const t = l.trim()
              if (!t) return <div key={i} style={{ height: 8 }} />
              return <p key={i} style={{ marginBottom: 12 }}>{inlineMd(t)}</p>
            })}
          </div>
        </div>
      )
    }

    // Signature offer card — green left border accent
    if (titleUpper.includes('SIGNATURE OFFER') || titleUpper.includes('YOUR OFFER')) {
      return (
        <div key={idx} style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderLeft: '4px solid #225840', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
          <SectionNum n={num} />
          <CardHeader title={section.title} icon={icon} />
          <div>{section.content.split('\n').map((l, i) => renderLine(l, i))}</div>
        </div>
      )
    }

    // Default card
    return (
      <div key={idx} style={{ background: '#ffffff', border: '1px solid #e8e8e8', borderRadius: 20, padding: '36px 40px', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <SectionNum n={num} />
        <CardHeader title={section.title} icon={icon} />
        <div>{section.content.split('\n').map((l, i) => renderLine(l, i))}</div>
      </div>
    )
  }

  /* ─── Grid layout ─── */
  function renderSections() {
    if (sections.length === 0) return null

    const elements: React.ReactNode[] = []

    sections.forEach((section, idx) => {
      if (idx === 2 && sections[3]) {
        elements.push(
          <div key="pair-2-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="card-pair">
            {renderCard(section, idx)}
            {renderCard(sections[3], 3)}
          </div>
        )
      } else if (idx === 3) {
        return
      } else {
        elements.push(renderCard(section, idx))
      }
    })

    return elements
  }

  /* ─── Full-screen loading experience ─── */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes msgFade { 0% { opacity:0; transform:translateY(6px); } 12% { opacity:1; transform:translateY(0); } 88% { opacity:1; transform:translateY(0); } 100% { opacity:0; transform:translateY(-4px); } }
        `}</style>
        <div style={{ textAlign: 'center', maxWidth: 320, padding: '0 24px', width: '100%' }}>
          {/* Spinner */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(34,88,64,0.12)',
            borderTopColor: '#225840',
            animation: 'spin 0.85s linear infinite',
            margin: '0 auto 36px'
          }} />
          {/* Cycling message */}
          <p key={msgIdx} style={{
            fontSize: 16, fontWeight: 600, color: '#0a0a0a',
            marginBottom: 10, minHeight: 26, lineHeight: 1.4,
            animation: 'msgFade 2s ease forwards'
          }}>
            {LOADING_MESSAGES[msgIdx]}
          </p>
          {/* Hint */}
          <p style={{ fontSize: 13, color: '#aaaaaa', marginBottom: 28 }}>
            This usually takes 8–12 seconds
          </p>
          {/* Progress bar */}
          <div style={{ height: 3, background: '#e8e8e8', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: '#225840', borderRadius: 2,
              width: `${progress}%`,
              transition: 'width 10s linear'
            }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#0a0a0a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garant:wght@300;400;600;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { -webkit-font-smoothing: antialiased; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes skPulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        .fade-up { animation: fadeUp 0.6s ease both; }
        .fade-up-2 { animation: fadeUp 0.6s 0.12s ease both; }
        .fade-up-3 { animation: fadeUp 0.6s 0.24s ease both; }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(34,88,64,0.3); border-radius: 2px; }
        @media (max-width: 700px) {
          .card-pair { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .results-hero h1 { font-size: 32px !important; }
          .results-cards { padding: 0 16px !important; }
          .results-card { padding: 24px 20px !important; }
          .two-col-grid { grid-template-columns: 1fr !important; }
          .week-cols { grid-template-columns: 1fr !important; }
          .stat-pills { flex-direction: column !important; gap: 8px !important; }
        }
        @media (max-width: 480px) {
          .results-hero { padding: 32px 20px 24px !important; }
          .results-hero h1 { font-size: 26px !important; }
          .section-number { font-size: 40px !important; }
        }
      `}</style>

      {/* ─── Fixed Header ─── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #f0f0f0',
        padding: '14px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="22" height="26" viewBox="0 0 32 36" fill="none">
            <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#225840"/>
            <path d="M12 20C12 20 10 22 10 24C10 27.3 12.7 30 16 30C19.3 30 22 27.3 22 24C22 22 20 20 20 20C20 20 19 22 17 23C16.5 23.3 16 23.3 16 23.3C16 23.3 17 21 12 20Z" fill="#225840" opacity="0.7"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 800, color: '#225840', letterSpacing: '.08em', textTransform: 'uppercase' }}>THE5TH CONSULTING</span>
        </div>
        {/* Center */}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', position: 'absolute', left: '50%', transform: 'translateX(-50%)', opacity: 0.55 }}>
          Your Blueprint
        </span>
        {/* Name badge */}
        {firstName && firstName !== 'there' && (
          <div style={{ background: '#225840', borderRadius: 50, padding: '5px 14px', fontSize: 12, fontWeight: 600, color: '#ffffff' }}>
            {firstName}&apos;s Report
          </div>
        )}
      </header>

      {/* ─── Content ─── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '100px 24px 80px' }}>

        {/* ─── HERO ─── */}
        <div className="fade-up" style={{ background: '#f8f7f4', borderRadius: 24, textAlign: 'center', padding: '52px 40px 56px', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: '#b8960c', textTransform: 'uppercase', marginBottom: 24 }}>
            Your Archetype Blueprint Is Ready
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(38px, 5vw, 56px)', fontWeight: 900, color: '#0a0a0a', lineHeight: 1.1, marginBottom: 12 }}>
            {firstName}, you are
          </h1>
          {archetype && (
            <div style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 900, color: '#1c4a32', fontStyle: 'italic', marginBottom: 20 }}>
              {archetype}.
            </div>
          )}
          <p style={{ fontSize: 16, color: '#555555', lineHeight: 1.75, maxWidth: 520, margin: '0 auto 36px' }}>
            Here is the strategy built specifically for your personality type. Your full PDF blueprint has been sent to your inbox.
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {archetype && (
              <div style={{ background: '#1c4a32', borderRadius: 50, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#fff' }}>
                {archetype}
              </div>
            )}
            {answers.q1 && (
              <div style={{ background: '#e8f5ee', borderRadius: 50, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#225840' }}>
                Stage: {formatStage(answers.q1)}
              </div>
            )}
            {answers.q18 && (
              <div style={{ background: '#e8f5ee', borderRadius: 50, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#225840' }}>
                Goal: {formatGoal(answers.q18)}
              </div>
            )}
            {answers.q19 && (
              <div style={{ background: '#e8f5ee', borderRadius: 50, padding: '8px 18px', fontSize: 13, fontWeight: 600, color: '#225840' }}>
                {formatHours(answers.q19)}
              </div>
            )}
          </div>
        </div>

        {/* ─── ROADMAP CARDS ─── */}
        <div className="fade-up-2" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 80 }}>
          {renderSections()}
        </div>

        {/* ─── VIDEO CTA — stays dark green ─── */}
        <div className="fade-up-3" style={{ background: 'linear-gradient(135deg, #1a3a2a, #225840)', border: '1px solid rgba(45,106,79,0.35)', borderRadius: 24, padding: '64px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginBottom: 20 }}>
            One More Thing
          </div>
          <h2 style={{ fontFamily: 'Cormorant Garant, serif', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
            We did not want to just give you<br />a plan on a page.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 40px' }}>
            So we created a short video based on exactly where you are, because you deserve more than a generic answer. It is ready for you now.
          </p>

          {noVideoClicked ? (
            <div style={{ background: 'rgba(45,106,79,0.15)', border: '1px solid rgba(45,106,79,0.25)', borderRadius: 14, padding: '20px 32px', display: 'inline-block' }}>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15 }}>Noted. Your full roadmap is right above. We are rooting for you.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <button
                onClick={handleWatchVideo}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: '#fff', color: '#0f2818', fontSize: 17, fontWeight: 700, padding: '18px 44px', borderRadius: 50, border: 'none', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', fontFamily: 'inherit' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}
              >
                <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#225840', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, flexShrink: 0 }}>&#9654;</span>
                Watch My Video
              </button>
              <button
                onClick={handleNoVideo}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', transition: 'color 0.2s ease' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
              >
                No thanks, the roadmap is enough for me
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
