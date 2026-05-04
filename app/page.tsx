'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

/* ─── Types ─── */
type QuizAnswers = Record<string, string | string[]>

interface DayPlan {
  day: number; title: string; theme: string; tasks: string[]
  win_condition: string; motivation: string
}
interface Roadmap {
  days: DayPlan[]; summary: string
  biggest_opportunity: string; first_action: string
}
interface Lead {
  id: string; email: string; name: string
  answers: QuizAnswers; roadmap: Roadmap | null
  current_day: number; streak: number
  revenue_logged: number; last_visit: string | null
}
interface ChatMessage { role: 'user' | 'assistant'; content: string }
interface OptionItem { value: string; emoji: string; label: string; sub: string }

type SelectQ   = { id: string; num: number; title: string; sub: string; type: 'select';   options: OptionItem[] }
type MultiQ    = { id: string; num: number; title: string; sub: string; type: 'multi';    options: OptionItem[] }
type TextareaQ = { id: string; num: number; title: string; sub: string; type: 'textarea'; placeholder: string }
type FromToQ   = { id: string; num: number; title: string; sub: string; type: 'fromto';  fromPlaceholder: string; toPlaceholder: string }
type ScaleQ    = { id: string; num: number; title: string; sub: string; type: 'scale';   scaleMin: string; scaleMax: string }
type Question  = SelectQ | MultiQ | TextareaQ | FromToQ | ScaleQ

/* ─── Questions (all 20) ─── */
const questions: Question[] = [
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
  {
    id: 'q9', num: 9, title: 'How long would your ideal signature program be?',
    sub: 'Program length affects pricing, client commitment, and results.',
    type: 'select',
    options: [
      { value: '4-6wk', emoji: '⚡', label: '4–6 Weeks', sub: 'Quick win, intensive transformation' },
      { value: '8-12wk', emoji: '📅', label: '8–12 Weeks', sub: 'Standard program, solid results' },
      { value: '3-6mo', emoji: '🗓️', label: '3–6 Months', sub: 'Deep transformation, premium pricing' },
      { value: '6-12mo', emoji: '🏆', label: '6–12 Months', sub: 'High-level mentorship and accountability' },
      { value: 'ongoing', emoji: '♾️', label: 'Ongoing / Evergreen', sub: 'Continuous support, membership model' },
    ]
  },
  {
    id: 'q10', num: 10, title: 'How confident are you stating your price out loud on a sales call?',
    sub: '1 = I stumble, lower it, or apologize. 5 = I state it clearly and hold the line.',
    type: 'scale', scaleMin: 'Not confident', scaleMax: 'Fully confident'
  },
  {
    id: 'q11', num: 11, title: "What's holding you back from charging what you're worth?",
    sub: 'Pricing psychology matters. Be brutally honest here.',
    type: 'select',
    options: [
      { value: 'not_worth', emoji: '😟', label: "I don't believe my offer is worth it yet", sub: 'Imposter syndrome — I question my value' },
      { value: 'fear_no', emoji: '😨', label: "Fear clients won't pay that much", sub: 'Scared of rejection or hearing "too expensive"' },
      { value: 'justify', emoji: '🤔', label: "I can't justify the price clearly", sub: "Can't articulate the ROI compellingly" },
      { value: 'guilt', emoji: '💭', label: 'I feel guilty charging premium rates', sub: 'Charging a lot feels wrong or selfish' },
      { value: 'confident', emoji: '💪', label: "Nothing — I'm confident in my pricing", sub: "I charge what I'm worth and don't negotiate" },
    ]
  },
  {
    id: 'q12', num: 12, title: 'How consistently do you create and publish content?',
    sub: 'Content consistency is the #1 predictor of lead flow. Be honest.',
    type: 'select',
    options: [
      { value: 'daily', emoji: '🏆', label: 'Daily', sub: 'I show up every single day, no matter what' },
      { value: 'few_week', emoji: '✅', label: 'A few times per week', sub: 'Consistent but not daily' },
      { value: 'weekly', emoji: '📆', label: 'About once a week', sub: 'Weekly posts when I can manage it' },
      { value: 'sporadic', emoji: '🌊', label: 'Sporadically / when inspired', sub: 'Feast or famine — bursts then silence' },
      { value: 'rarely', emoji: '🔇', label: 'Rarely or never', sub: "Haven't found my content rhythm yet" },
    ]
  },
  {
    id: 'q13', num: 13, title: 'What content formats feel natural to you?',
    sub: 'Select all that apply — your blueprint will use your natural strengths.',
    type: 'multi',
    options: [
      { value: 'video', emoji: '🎥', label: 'Video', sub: 'YouTube, Reels, TikTok' },
      { value: 'writing', emoji: '✍️', label: 'Writing', sub: 'Blog posts, newsletter, LinkedIn articles' },
      { value: 'audio', emoji: '🎙️', label: 'Audio / Podcast', sub: 'Conversations, interviews, voice notes' },
      { value: 'social', emoji: '📱', label: 'Social Media Posts', sub: 'Instagram, Facebook, text-based posts' },
      { value: 'live', emoji: '🎤', label: 'Live Events / Workshops', sub: 'Webinars, masterclasses, in-person' },
    ]
  },
  {
    id: 'q14', num: 14, title: 'What blocks your content creation most?',
    sub: 'Your blueprint will include a strategy to overcome your exact block.',
    type: 'select',
    options: [
      { value: 'what_say', emoji: '💬', label: 'Not knowing what to say', sub: 'I sit down to create and go blank' },
      { value: 'perfectionism', emoji: '😰', label: 'Perfectionism / fear of judgment', sub: "I don't post because it's never quite right" },
      { value: 'time', emoji: '⏰', label: 'No time or energy', sub: 'Too much going on to create consistently' },
      { value: 'tech', emoji: '💻', label: 'Tech overwhelm', sub: 'Editing, scheduling, platforms — too much' },
      { value: 'no_results', emoji: '📉', label: "Not seeing results, so I stop", sub: "I've tried, got no engagement, and gave up" },
    ]
  },
  {
    id: 'q15', num: 15, title: 'What is your current relationship with selling your services?',
    sub: 'Sales is a learnable skill at any stage.',
    type: 'select',
    options: [
      { value: 'hate', emoji: '😬', label: 'I hate sales and avoid it', sub: 'It feels pushy, icky, or like begging' },
      { value: 'lose_price', emoji: '😅', label: "I'm okay but lose people at the price", sub: 'Call goes well until I mention the investment' },
      { value: 'decent', emoji: '👍', label: "I'm decent but inconsistent", sub: "I close sometimes but can't predict it" },
      { value: 'good', emoji: '💼', label: "I'm good and close regularly", sub: 'Most calls convert, I have a basic process' },
      { value: 'strength', emoji: '🔥', label: 'Sales is my strength', sub: 'I love it and consistently close high-ticket' },
    ]
  },
  {
    id: 'q16', num: 16, title: 'What is your biggest fear right now in building this business?',
    sub: 'Your blueprint addresses your specific fear directly.',
    type: 'select',
    options: [
      { value: 'visibility', emoji: '👁️', label: 'Putting myself out there and being judged', sub: 'What will people think? What if I get criticized?' },
      { value: 'wont_work', emoji: '💸', label: 'Investing time and money and it not working', sub: 'What if I do everything right and still fail?' },
      { value: 'money', emoji: '📉', label: 'Running out of money before it takes off', sub: 'The financial pressure is real' },
      { value: 'credibility', emoji: '🎓', label: 'Not being credible enough', sub: 'Who am I to charge that much?' },
      { value: 'success', emoji: '🚀', label: "Success — what if I can't handle it?", sub: "What if it works and I'm overwhelmed?" },
    ]
  },
  {
    id: 'q17', num: 17, title: 'What kind of support do you most need right now?',
    sub: 'Your blueprint will prioritize your most urgent gap.',
    type: 'select',
    options: [
      { value: 'strategy', emoji: '🗺️', label: 'A clear strategy and roadmap', sub: 'Tell me exactly what to do and in what order' },
      { value: 'accountability', emoji: '🤝', label: 'Accountability to stay consistent', sub: "I know what to do — I just need to actually do it" },
      { value: 'tech', emoji: '⚙️', label: 'Technical help with tools and systems', sub: 'Website, funnels, email, automation — overwhelming' },
      { value: 'messaging', emoji: '💬', label: 'Messaging and positioning', sub: 'I need to talk about what I do compellingly' },
      { value: 'sales', emoji: '💰', label: 'Sales and conversion coaching', sub: 'Help me close more calls and get more yeses' },
    ]
  },
  {
    id: 'q18', num: 18, title: 'What is your revenue goal in the next 6 months?',
    sub: 'Your pricing strategy will align to this target.',
    type: 'select',
    options: [
      { value: '1-3k', emoji: '🎯', label: '$1K – $3K per month', sub: 'Building momentum and first consistent clients' },
      { value: '3-5k', emoji: '📊', label: '$3K – $5K per month', sub: 'Creating real income that matters to my household' },
      { value: '5-10k', emoji: '💫', label: '$5K – $10K per month', sub: 'The $10K milestone — financial freedom within reach' },
      { value: '10k+', emoji: '🏆', label: '$10K+ per month', sub: 'Already have traction, scaling to multiple $10K months' },
    ]
  },
  {
    id: 'q19', num: 19, title: 'How many hours per week can you realistically dedicate to this?',
    sub: 'Your roadmap will be built around your actual available time.',
    type: 'select',
    options: [
      { value: 'lt5', emoji: '🌙', label: 'Less than 5 hours', sub: 'Side hustle — nights and weekends only' },
      { value: '5-10', emoji: '⏱️', label: '5–10 hours', sub: 'Dedicated part-time commitment' },
      { value: '10-20', emoji: '📅', label: '10–20 hours', sub: 'Significant investment — this is a priority' },
      { value: '20+', emoji: '🔥', label: '20+ hours', sub: 'Full focus — this is my primary priority' },
    ]
  },
  {
    id: 'q20', num: 20, title: 'How urgent is this for you right now?',
    sub: '1 = When I get around to it. 5 = I need to make this happen NOW.',
    type: 'scale', scaleMin: 'No rush', scaleMax: 'Need this now'
  },
]

/* ─── useCountUp ─── */
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

/* ─── StatCard ─── */
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

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garant:wght@300;400;600;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { background: #f9f9f9; }
body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0a0a0a; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInLeft  { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
@keyframes dotPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(184,150,12,0.5); } 70% { transform: scale(1.25); box-shadow: 0 0 0 5px rgba(184,150,12,0); } }
@keyframes meshMove { 0% { opacity:0.7 } 100% { opacity:1 } }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.3)} }
@keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(212,160,23,.4)} 50%{box-shadow:0 0 0 6px rgba(212,160,23,.0)} }

.afu-1 { animation: fadeUp 0.6s ease both; }
.afu-2 { animation: fadeUp 0.6s 0.1s ease both; }
.afu-3 { animation: fadeUp 0.6s 0.2s ease both; }
.afu-4 { animation: fadeUp 0.6s 0.3s ease both; }
.afu-5 { animation: fadeUp 0.6s 0.4s ease both; }
.afu-6 { animation: fadeUp 0.6s 0.5s ease both; }

.sir { animation: slideInRight 0.25s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.sil { animation: slideInLeft  0.25s cubic-bezier(0.25,0.46,0.45,0.94) both; }
.popup-in { animation: scaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both; }
.dot-cur  { animation: dotPulse 1.5s ease-in-out infinite; }

.gbtn {
  display: block; width: 100%; padding: 18px 32px;
  background: linear-gradient(135deg, #225840, #2d6a4f);
  border: none; border-radius: 6px;
  box-shadow: 0 4px 14px rgba(34,88,64,0.35);
  color: #fff; font-size: 18px; font-weight: 700;
  cursor: pointer; transition: opacity 0.2s ease, transform 0.2s ease;
  text-align: center; font-family: inherit;
}
.gbtn:hover { opacity: 0.92; transform: translateY(-1px); }
.gbtn:active { transform: scale(0.98); opacity: 1; }
.gbtn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

.qopt {
  display: flex; align-items: center; width: 100%;
  padding: 18px 24px; background: #fff;
  border: 2px solid #e0e0e0; border-radius: 6px;
  cursor: pointer; transition: border-color 0.15s ease, background 0.15s ease;
  text-align: left; margin-bottom: 12px; font-family: inherit;
}
.qopt:hover { border-color: #225840; }
.qopt.sel { background: #225840; border-color: #225840; }

.qinput {
  width: 100%; padding: 16px; border: 2px solid #e0e0e0;
  border-radius: 6px; font-size: 17px; font-family: inherit;
  transition: border-color 0.2s ease; outline: none;
  color: #0a0a0a; background: #fff;
}
.qinput:focus { border-color: #225840; }
.qinput::placeholder { color: #9ca3af; }

.scale-btn {
  flex: 1; height: 56px; border-radius: 6px;
  border: 2px solid #e0e0e0; background: #fff;
  font-size: 20px; font-weight: 700; cursor: pointer;
  transition: all 0.15s ease; color: #6b7280; font-family: inherit;
}
.scale-btn:hover { border-color: #225840; color: #225840; }
.scale-btn.sel { background: #225840; border-color: #225840; color: #fff; }

.otp-box {
  width: 52px; height: 60px; border: 2px solid #e0e0e0;
  border-radius: 6px; text-align: center; font-size: 24px;
  font-weight: 700; color: #0a0a0a; background: #fff;
  font-family: inherit; outline: none; transition: all 0.2s ease;
}
.otp-box:focus { border-color: #225840; }
.otp-box.filled { border-color: #225840; }
.otp-box.otp-err { border-color: #ef4444; background: #fef2f2; }

.timeline-day:hover { border-color: rgba(45,106,79,0.6) !important; }
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: #0a0f0a; }
::-webkit-scrollbar-thumb { background: #2d6a4f; border-radius: 3px; }
`

/* ─── Exit Popup ─── */
function ExitPopup({ onClose, onResume }: { onClose: () => void; onResume: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div
        className="popup-in"
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 12, maxWidth: 460, width: '100%', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 20, background: 'none', border: 'none', fontSize: 24, color: '#9ca3af', cursor: 'pointer', lineHeight: 1 }}>
          ×
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0a0a0a', marginBottom: 12, lineHeight: 1.25 }}>
            Wait — your roadmap takes 90 seconds to unlock.
          </h2>
          <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, marginBottom: 28 }}>
            You&apos;re almost there. Get your free AI-generated 15-day plan showing exactly what to do to make your first $5,000 online. Completely free.
          </p>
          <button className="gbtn" onClick={onResume} style={{ marginBottom: 14 }}>
            Finish My Quiz →
          </button>
          <button
            onClick={() => { sessionStorage.setItem('exit_dismissed', '1'); onClose(); }}
            style={{ display: 'block', margin: '0 auto', background: 'none', border: 'none', color: '#9ca3af', fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>
            No thanks, I&apos;ll figure it out alone
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Flame Logo ─── */
function FlameLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <svg width="26" height="40" viewBox="0 0 26 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left flame */}
        <path
          d="M5 38 C2 30 1 20 4 13 C6 8 8 5 7 1 C10 5 10 12 9 18 C8 24 8 32 5 38 Z"
          fill="#2d6a4f"
        />
        {/* Center flame (tallest) */}
        <path
          d="M13 40 C10 31 9 20 12 12 C14 6 15 3 13 0 C15 3 17 7 16 13 C18 21 16 32 13 40 Z"
          fill="#2d6a4f"
        />
        {/* Right flame */}
        <path
          d="M21 38 C18 30 18 24 17 18 C16 12 17 5 20 1 C19 5 22 8 23 13 C25 20 24 30 21 38 Z"
          fill="#2d6a4f"
        />
      </svg>
      <span style={{ fontSize: 18, fontWeight: 700, color: '#2d6a4f', letterSpacing: '2px', fontFamily: 'Inter, system-ui, sans-serif' }}>
        THE5TH CONSULTING
      </span>
    </div>
  )
}

/* ─── Site Header (start / quiz / email / otp) ─── */
function SiteHeader({ screen, currentQ }: { screen: string; currentQ: number }) {
  const isQuiz = screen === 'quiz'
  const allDone = screen === 'email' || screen === 'otp'

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)',
      padding: '16px 40px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 16,
      borderBottom: '1px solid #f0f0f0',
    }}>
      {/* Left: Logo */}
      <FlameLogo />

      {/* Center: Progress dots */}
      <div style={{ flex: 1, maxWidth: 480, position: 'relative', height: 10, margin: '0 16px' }}>
        {/* Connecting line */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#e0e0e0', transform: 'translateY(-50%)' }} />
        {/* Dots */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
          {questions.map((_, i) => {
            const done = allDone || (isQuiz && i < currentQ)
            const cur = isQuiz && i === currentQ
            return (
              <div
                key={i}
                className={cur ? 'dot-cur' : ''}
                style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                  background: done ? '#225840' : cur ? '#b8960c' : '#fff',
                  border: `2px solid ${done ? '#225840' : cur ? '#b8960c' : '#e0e0e0'}`,
                  transition: 'background 0.3s ease, border-color 0.3s ease',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Right: tag line — invisible during quiz to preserve layout */}
      <div style={{
        fontSize: 13, color: '#999', whiteSpace: 'nowrap', flexShrink: 0,
        visibility: isQuiz ? 'hidden' : 'visible',
        minWidth: 110, textAlign: 'right',
      }}>
        Free · 3 min quiz
      </div>
    </header>
  )
}

/* ─── Footer (landing page only) ─── */
function Footer() {
  return (
    <footer style={{ background: '#0a1a0f', padding: '60px 40px 40px' }}>
      <div style={{ textAlign: 'center', fontSize: 'clamp(56px, 10vw, 96px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1, marginBottom: 40 }}>
        THE5TH
      </div>
      <div style={{ height: 1, background: '#225840', marginBottom: 28 }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <span style={{ fontSize: 14, color: '#aaa' }}>© 2026 The5th Consulting. All rights reserved.</span>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {['Privacy Policy', 'Data Usage', 'Contact'].map(link => (
            <a
              key={link}
              href="#"
              style={{ fontSize: 14, color: '#aaa', textDecoration: 'none', transition: 'color 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

/* ─── Page ─── */
export default function Page() {
  const [screen, setScreen] = useState<'start' | 'quiz' | 'email' | 'otp' | 'dashboard'>('start')
  const [currentQ, setCurrentQ] = useState(0)
  const [cardKey, setCardKey] = useState(0)
  const [slideDir, setSlideDir] = useState<'sir' | 'sil'>('sir')
  const [answers, setAnswers] = useState<QuizAnswers>({})
  const [fromTo, setFromTo] = useState({ from: '', to: '' })
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({})
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({})
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

  const [showExitPopup, setShowExitPopup] = useState(false)
  const exitShown = useRef(false)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

  /* ── Exit intent ── */
  useEffect(() => {
    if (screen === 'dashboard') return
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 0 && !exitShown.current && !sessionStorage.getItem('exit_dismissed')) {
        setShowExitPopup(true)
        exitShown.current = true
      }
    }
    document.addEventListener('mouseleave', handler)
    return () => document.removeEventListener('mouseleave', handler)
  }, [screen])

  /* ── Navigation ── */
  const goForward = useCallback(() => {
    setError('')
    setSlideDir('sir')
    setCardKey(k => k + 1)
    if (currentQ < questions.length - 1) setCurrentQ(q => q + 1)
    else setScreen('email')
  }, [currentQ])

  const goBack = useCallback(() => {
    setError('')
    setSlideDir('sil')
    setCardKey(k => k + 1)
    if (currentQ > 0) setCurrentQ(q => q - 1)
    else setScreen('start')
  }, [currentQ])

  const handleSelectAnswer = (qId: string, value: string) => {
    setAnswers(a => ({ ...a, [qId]: value }))
    setError('')
  }

  const validateAndNext = () => {
    const q = questions[currentQ]
    if (q.type === 'select') {
      if (!answers[q.id]) { setError('Please select an option to continue'); return }
    } else if (q.type === 'textarea') {
      const val = (textAnswers[q.id] || '').trim()
      if (val.length < 5) { setError('Please describe this before continuing'); return }
      setAnswers(a => ({ ...a, [q.id]: val }))
    } else if (q.type === 'fromto') {
      if (!fromTo.from.trim() || !fromTo.to.trim()) { setError('Please complete both fields'); return }
      setAnswers(a => ({ ...a, [q.id]: `FROM: ${fromTo.from} → TO: ${fromTo.to}` }))
    } else if (q.type === 'scale') {
      if (!answers[q.id]) { setError('Please select a number before continuing'); return }
    } else if (q.type === 'multi') {
      const sel = multiAnswers[q.id] || []
      if (sel.length === 0) { setError('Please select at least one option'); return }
      setAnswers(a => ({ ...a, [q.id]: sel }))
    }
    goForward()
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

  /* ── Dashboard handlers ── */
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

  /* ── Dashboard style tokens ── */
  const greenBtn: React.CSSProperties = { padding: '16px 32px', borderRadius: 8, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: '1px solid #1a4a35', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', letterSpacing: '.03em', transition: 'all .2s', boxShadow: '0 8px 24px rgba(45,106,79,0.3)', width: '100%', marginTop: 22 }
  const MESH = (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 15% 0%, rgba(45,106,79,0.18) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 85% 100%, rgba(45,106,79,0.1) 0%, transparent 60%)', animation: 'meshMove 12s ease-in-out infinite alternate' }} />
  )
  const DASH_NAV = (right?: React.ReactNode) => (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(10,15,10,0.88)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(45,106,79,0.18)' }}>
      <span style={{ fontFamily: "'Cormorant Garant', serif", fontSize: 22, fontWeight: 700, color: '#fff' }}>
        The<span style={{ color: '#2d6a4f' }}>5th</span>
      </span>
      {right}
    </nav>
  )

  /* ══════════════ START ══════════════ */
  if (screen === 'start') return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      <style>{CSS}</style>
      {showExitPopup && <ExitPopup onClose={() => setShowExitPopup(false)} onResume={() => setShowExitPopup(false)} />}

      <SiteHeader screen="start" currentQ={0} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px' }}>
        <div style={{ maxWidth: 680, width: '100%', textAlign: 'center' }}>
          {/* Emoji */}
          <div className="afu-2" style={{ fontSize: 64, lineHeight: 1, marginBottom: 28 }}>👋</div>

          {/* Headline */}
          <h1 className="afu-3" style={{ fontSize: 'clamp(36px, 7vw, 56px)', fontWeight: 900, color: '#0a0a0a', lineHeight: 1.05, textTransform: 'uppercase', letterSpacing: '-1px', marginBottom: 20 }}>
            Discover Your Path to Your First $5,000 Month
          </h1>

          {/* Subtext */}
          <p className="afu-4" style={{ fontSize: 18, color: '#555', maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
            Answer a few questions and get a free personalized AI roadmap built around your expertise and goals. No fluff. No generic advice. Just your plan.
          </p>

          {/* CTA Button */}
          <div className="afu-5" style={{ maxWidth: 480, margin: '0 auto 20px' }}>
            <button className="gbtn" onClick={() => setScreen('quiz')}>
              Get Started →
            </button>
          </div>

          {/* Social proof */}
          <div className="afu-6" style={{ fontSize: 14, color: '#666' }}>
            ⭐⭐⭐⭐⭐ Trusted by 500+ women building their first $5K month
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )

  /* ══════════════ QUIZ ══════════════ */
  if (screen === 'quiz') {
    const q = questions[currentQ]
    const hasAnswer = q.type === 'select' ? !!answers[q.id] : q.type === 'scale' ? !!answers[q.id] : true

    return (
      <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
        <style>{CSS}</style>
        {showExitPopup && <ExitPopup onClose={() => setShowExitPopup(false)} onResume={() => setShowExitPopup(false)} />}

        <SiteHeader screen="quiz" currentQ={currentQ} />

        {/* Content area */}
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '88px 20px 100px' }}>
          {/* Back arrow */}
          <button
            onClick={goBack}
            aria-label="Go back"
            style={{ background: 'none', border: 'none', fontSize: 22, color: '#9ca3af', cursor: 'pointer', padding: '18px 0 0', display: 'block', lineHeight: 1 }}>
            ←
          </button>

          {/* Animated question wrapper */}
          <div key={cardKey} className={slideDir}>
            {/* Question title */}
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, color: '#0a0a0a', textAlign: 'center', margin: '40px auto 12px', lineHeight: 1.2, maxWidth: 560 }}>
              {q.title}
            </h2>
            {q.sub && (
              <p style={{ fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 36, lineHeight: 1.65, maxWidth: 500, margin: '0 auto 36px' }}>
                {q.sub}
              </p>
            )}

            {/* Options container */}
            <div style={{ maxWidth: 500, margin: '0 auto' }}>

              {/* SELECT */}
              {q.type === 'select' && q.options.map(opt => {
                const sel = answers[q.id] === opt.value
                return (
                  <button
                    key={opt.value}
                    className={`qopt${sel ? ' sel' : ''}`}
                    onClick={() => handleSelectAnswer(q.id, opt.value)}>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 17, fontWeight: 500, color: sel ? '#fff' : '#0a0a0a' }}>
                        {opt.label}
                      </span>
                      {opt.sub && (
                        <span style={{ display: 'block', fontSize: 13, color: sel ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: 3 }}>
                          {opt.sub}
                        </span>
                      )}
                    </span>
                    {sel && <span style={{ fontSize: 14, color: '#fff', flexShrink: 0, fontWeight: 700, marginLeft: 12 }}>✓</span>}
                  </button>
                )
              })}

              {/* TEXTAREA */}
              {q.type === 'textarea' && (
                <>
                  <textarea
                    className="qinput"
                    style={{ minHeight: 130, resize: 'vertical', marginBottom: 10 }}
                    placeholder={q.placeholder}
                    value={textAnswers[q.id] || ''}
                    onChange={e => setTextAnswers(t => ({ ...t, [q.id]: e.target.value }))}
                  />
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{error}</p>}
                  <button className="gbtn" onClick={validateAndNext}>Continue →</button>
                </>
              )}

              {/* FROMTO */}
              {q.type === 'fromto' && (
                <>
                  {(['from', 'to'] as const).map(key => (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <span style={{ width: 46, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', color: '#b8960c', flexShrink: 0, textTransform: 'uppercase' }}>
                        {key}
                      </span>
                      <input
                        className="qinput"
                        placeholder={key === 'from' ? q.fromPlaceholder : q.toPlaceholder}
                        value={fromTo[key]}
                        onChange={e => setFromTo(f => ({ ...f, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{error}</p>}
                  <button className="gbtn" onClick={validateAndNext}>Continue →</button>
                </>
              )}

              {/* SCALE */}
              {q.type === 'scale' && (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        className={`scale-btn${answers[q.id] === String(n) ? ' sel' : ''}`}
                        onClick={() => { setAnswers(a => ({ ...a, [q.id]: String(n) })); setError('') }}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 28 }}>
                    <span>{q.scaleMin}</span><span>{q.scaleMax}</span>
                  </div>
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{error}</p>}
                  <div style={{ opacity: hasAnswer ? 1 : 0, transform: hasAnswer ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.2s ease, transform 0.2s ease', pointerEvents: hasAnswer ? 'auto' : 'none' }}>
                    <button className="gbtn" onClick={validateAndNext}>Continue →</button>
                  </div>
                </>
              )}

              {/* MULTI */}
              {q.type === 'multi' && (
                <>
                  {q.options.map(opt => {
                    const sel = (multiAnswers[q.id] || []).includes(opt.value)
                    return (
                      <button
                        key={opt.value}
                        className={`qopt${sel ? ' sel' : ''}`}
                        onClick={() => {
                          setMultiAnswers(m => {
                            const cur = m[q.id] || []
                            return { ...m, [q.id]: sel ? cur.filter(v => v !== opt.value) : [...cur, opt.value] }
                          })
                          setError('')
                        }}>
                        <span style={{ flex: 1 }}>
                          <span style={{ display: 'block', fontSize: 17, fontWeight: 500, color: sel ? '#fff' : '#0a0a0a' }}>
                            {opt.label}
                          </span>
                          {opt.sub && (
                            <span style={{ display: 'block', fontSize: 13, color: sel ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: 3 }}>
                              {opt.sub}
                            </span>
                          )}
                        </span>
                        {sel && <span style={{ fontSize: 14, color: '#fff', flexShrink: 0, fontWeight: 700, marginLeft: 12 }}>✓</span>}
                      </button>
                    )
                  })}
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 8, marginTop: 4 }}>{error}</p>}
                  <button className="gbtn" style={{ marginTop: 8 }} onClick={validateAndNext}>Continue →</button>
                </>
              )}

              {/* Continue button for SELECT — fades in after selection */}
              {q.type === 'select' && (
                <div style={{ marginTop: 4 }}>
                  {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>{error}</p>}
                  <div style={{ opacity: hasAnswer ? 1 : 0, transform: hasAnswer ? 'translateY(0)' : 'translateY(10px)', transition: 'opacity 0.2s ease, transform 0.2s ease', pointerEvents: hasAnswer ? 'auto' : 'none' }}>
                    <button className="gbtn" onClick={validateAndNext}>Continue →</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ══════════════ EMAIL ══════════════ */
  if (screen === 'email') return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      <style>{CSS}</style>
      <SiteHeader screen="email" currentQ={questions.length} />
      {showExitPopup && <ExitPopup onClose={() => setShowExitPopup(false)} onResume={() => setShowExitPopup(false)} />}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
        <div className="afu-1" style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          {/* Gold label */}
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#b8960c', marginBottom: 20 }}>
            YOUR ROADMAP IS READY ✨
          </div>

          <h2 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 800, color: '#0a0a0a', marginBottom: 12, lineHeight: 1.2 }}>
            Your personalized 15-day roadmap is ready
          </h2>
          <p style={{ fontSize: 16, color: '#555', marginBottom: 32, lineHeight: 1.7 }}>
            Enter your details below to unlock your free AI dashboard
          </p>

          {/* Benefits */}
          <div style={{ marginBottom: 32, display: 'inline-block', textAlign: 'left' }}>
            {['Your full AI-generated 15-day roadmap', 'Daily tasks built from your quiz answers', 'AI business coach available 24/7', 'Revenue tracker toward your $5K goal', '7-day personalized email coaching series'].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#e8f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#225840', fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 15, color: '#374151' }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <input className="qinput" style={{ marginBottom: 12 }} type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} />
            <input className="qinput" style={{ marginBottom: 20 }} type="email" placeholder="Your best email address" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()} />
            {error && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 14, textAlign: 'left' }}>{error}</p>}
            <button className="gbtn" onClick={handleEmailSubmit} disabled={submitting}>
              {submitting ? 'Sending your roadmap…' : 'Send My Code →'}
            </button>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14 }}>🔒 Your info is private. We never spam.</p>
          </div>
        </div>
      </div>
    </div>
  )

  /* ══════════════ OTP ══════════════ */
  if (screen === 'otp') return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
      <style>{CSS}</style>
      <SiteHeader screen="otp" currentQ={questions.length} />
      {showExitPopup && <ExitPopup onClose={() => setShowExitPopup(false)} onResume={() => setShowExitPopup(false)} />}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
        <div className="afu-1" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
          {/* Green check icon */}
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#e8f0eb', border: '2px solid #225840', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 24, color: '#225840', fontWeight: 700 }}>
            ✓
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0a0a0a', marginBottom: 12, lineHeight: 1.2 }}>Check your inbox</h2>
          <p style={{ fontSize: 16, color: '#555', marginBottom: 36, lineHeight: 1.7 }}>
            We sent a 6-digit code to<br /><strong style={{ color: '#0a0a0a' }}>{email}</strong>
          </p>

          {/* OTP boxes */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
            {otpDigits.map((d, i) => (
              <input
                key={i}
                className={`otp-box${d ? ' filled' : ''}${otpError ? ' otp-err' : ''}`}
                type="text" inputMode="numeric" maxLength={1} value={d}
                ref={el => { otpRefs.current[i] = el }}
                onChange={e => handleOtpDigit(i, e.target.value)}
                onKeyDown={e => handleOtpKey(i, e)}
              />
            ))}
          </div>
          {otpError && <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 16 }}>{otpError}</p>}

          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <button className="gbtn" onClick={handleOtpSubmit} disabled={submitting}>
              {submitting ? 'Verifying…' : 'Verify & Unlock →'}
            </button>
          </div>
          <button
            onClick={handleEmailSubmit}
            style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#9ca3af', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>
            Didn&apos;t receive a code? Resend
          </button>
        </div>
      </div>
    </div>
  )

  /* ══════════════ DASHBOARD ══════════════ */
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0a', color: '#fff', paddingBottom: 80 }}>
      <style>{CSS}</style>
      {MESH}
      {DASH_NAV(
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
            <button onClick={handleMarkAllComplete} style={{ ...greenBtn, width: 'auto', padding: '14px 32px', marginTop: 0 }}>
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
            <input
              style={{ flex: 1, padding: '12px 20px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 15, fontFamily: 'inherit', transition: 'border-color .2s', outline: 'none' }}
              type="number" placeholder="Amount earned ($)" value={revenueInput}
              onChange={e => setRevenueInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleRevenueLog()} />
            <button onClick={handleRevenueLog}
              style={{ padding: '12px 26px', borderRadius: 8, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: '1px solid #1a4a35', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap', boxShadow: '0 6px 20px rgba(45,106,79,0.28)' }}>
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
            <input
              style={{ flex: 1, padding: '12px 20px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 14, fontFamily: 'inherit', transition: 'border-color .2s', outline: 'none' }}
              placeholder="Ask your AI coach…" value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChatSend()} />
            <button onClick={handleChatSend} disabled={chatLoading}
              style={{ padding: '12px 22px', borderRadius: 8, background: 'linear-gradient(135deg,#2d6a4f,#1a4a35)', border: '1px solid #1a4a35', color: '#fff', fontSize: 14, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 6px 20px rgba(45,106,79,0.28)' }}>
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
          style={{ padding: '10px 26px', borderRadius: 8, background: '#fff', color: '#172e20', fontSize: 14, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0, transition: 'transform .2s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
          Book your free strategy call →
        </a>
      </div>
    </div>
  )
}
