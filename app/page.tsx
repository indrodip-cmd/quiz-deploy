'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useInView, useSpring } from 'framer-motion'

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
      { value: 'financial', emoji: '💰', label: 'Financial freedom seekers', sub: 'Debt freedom, investing, wealth building, passive income' },
      { value: 'relationships', emoji: '❤️', label: 'Relationship and dating coaches', sub: 'Finding love, marriage, divorce recovery, connection' },
      { value: 'spiritual', emoji: '🌙', label: 'Spiritual and energy work', sub: 'Healing, intuition, purpose, consciousness' },
      { value: 'parenting', emoji: '👨‍👩‍👧', label: 'Parents and family coaches', sub: 'Raising kids, family dynamics, empty nest, aging parents' },
      { value: 'creativity', emoji: '🎨', label: 'Creative entrepreneurs', sub: 'Artists, writers, musicians monetizing their craft' },
      { value: 'corporate', emoji: '🏛️', label: 'Corporate and executive coaching', sub: 'Leadership, team performance, executive presence' },
    ]
  },
  {
    id: 'q3', num: 3, title: 'What age range is your ideal client typically in?',
    sub: 'Select all that apply. You can choose more than one.',
    type: 'multi',
    options: [
      { value: '25-34', emoji: '🌟', label: '25-34', sub: 'Younger professionals building their careers' },
      { value: '35-44', emoji: '⭐', label: '35-44', sub: 'Mid-career, established but seeking change' },
      { value: '45-54', emoji: '🌠', label: '45-54', sub: 'Experienced, ready for transformation' },
      { value: '55-69', emoji: '💫', label: '55-69', sub: 'Wisdom years, monetizing decades of experience' },
      { value: '70+', emoji: '✨', label: '70+', sub: 'Legacy stage, sharing lifetime knowledge' },
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
    sub: 'Select all that apply. Your blueprint will be built around your preferred formats.',
    type: 'multi',
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
    sub: 'Select all that apply. Your blueprint will prioritize your most urgent gaps.',
    type: 'multi',
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garant:wght@300;400;600;700;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { background: #f5f2ee; }
body { font-family: 'Inter', system-ui, -apple-system, sans-serif; color: #0a0a0a; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideInRight { from { opacity: 0; transform: translateX(60px); } to { opacity: 1; transform: translateX(0); } }
@keyframes slideInLeft  { from { opacity: 0; transform: translateX(-60px); } to { opacity: 1; transform: translateX(0); } }
@keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
@keyframes dotPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(184,150,12,0.5); } 70% { transform: scale(1.25); box-shadow: 0 0 0 5px rgba(184,150,12,0); } }
@keyframes meshMove { 0% { opacity:0.7 } 100% { opacity:1 } }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(1.3)} }
@keyframes pulseGlow { 0%,100%{box-shadow:0 0 0 0 rgba(34,88,64,0.3)} 50%{box-shadow:0 0 0 12px rgba(34,88,64,0)} }
@keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeInLeft { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
@keyframes fadeInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
@keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
@keyframes float { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }
@keyframes countUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes tabletReveal { from { opacity:0.3; transform:scale(0.85) translateY(40px); } to { opacity:1; transform:scale(1) translateY(0); } }

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

/* ── Landing page ── */
.anim { opacity:0; transform:translateY(24px); transition: opacity 0.7s ease, transform 0.7s ease; }
.anim.animate-in { opacity:1; transform:translateY(0); }

.lp-benefit-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
.lp-benefit-card:hover { transform: translateY(-6px) !important; box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important; }
.lp-step-card { transition: transform 0.3s ease; }
.lp-step-card:hover { transform: translateY(-4px) !important; }
.lp-testimonial { transition: transform 0.22s ease, box-shadow 0.22s ease; }
.lp-testimonial:hover { transform: translateY(-3px) !important; box-shadow: 0 16px 48px rgba(0,0,0,0.08) !important; }

@media (max-width: 768px) {
  .hero-grid { grid-template-columns: 1fr !important; }
  .hero-headline-line { font-size: 40px !important; }
  .grid-3col { grid-template-columns: 1fr !important; }
  .lp-section-pad { padding: 60px 24px !important; }
  .hero-inner { padding: 80px 24px 40px !important; }
  .landing-tablet { max-width: 320px !important; }
}

/* ══ PREMIUM LANDING ══ */
:root {
  --cream: #faf6f1;
  --ink: #0d0d0b;
  --forest: #1c4a32;
  --forest-mid: #2a6647;
  --sage: #4a8c64;
  --gold: #b8920a;
  --gold-light: #e8c84a;
  --warm-grey: #8a8680;
  --border: rgba(28,74,50,0.12);
}
@keyframes grain {
  0%,100%{transform:translate(0,0)}10%{transform:translate(-2%,-3%)}
  20%{transform:translate(3%,2%)}30%{transform:translate(-1%,4%)}
  40%{transform:translate(4%,-1%)}50%{transform:translate(-3%,3%)}
  60%{transform:translate(2%,-4%)}70%{transform:translate(-4%,1%)}
  80%{transform:translate(3%,-2%)}90%{transform:translate(-1%,3%)}
}
@keyframes float-slow {
  0%,100%{transform:translateY(0px) rotate(0deg);}
  33%{transform:translateY(-12px) rotate(1deg);}
  66%{transform:translateY(-6px) rotate(-0.5deg);}
}
@keyframes reveal-up {
  from{opacity:0;transform:translateY(40px);}
  to{opacity:1;transform:translateY(0);}
}
@keyframes reveal-left {
  from{opacity:0;transform:translateX(-30px);}
  to{opacity:1;transform:translateX(0);}
}
@keyframes shimmer {
  0%{background-position:-200% center;}
  100%{background-position:200% center;}
}
@keyframes line-draw {
  from{width:0;}to{width:98%;}
}
@keyframes ticker {
  from{transform:translateX(0);}
  to{transform:translateX(-50%);}
}
@keyframes morph {
  0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%;}
  25%{border-radius:40% 60% 70% 30%/40% 70% 30% 60%;}
  50%{border-radius:30% 70% 40% 60%/50% 40% 60% 50%;}
  75%{border-radius:70% 30% 60% 40%/30% 60% 40% 70%;}
}
.lp-root{min-height:100vh;background:var(--cream);font-family:'DM Sans',sans-serif;overflow-x:hidden;}
.grain-overlay{position:fixed;inset:-200%;width:400%;height:400%;
  background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
  pointer-events:none;z-index:9997;animation:grain 8s steps(2) infinite;opacity:0.4;}
.lp-nav{position:fixed;top:0;left:0;right:0;z-index:100;
  display:flex;align-items:center;justify-content:space-between;
  padding:20px 48px;background:rgba(250,246,241,0.88);
  backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
.lp-nav-logo{font-family:'Playfair Display',serif;font-size:15px;
  font-weight:700;color:var(--forest);letter-spacing:0.04em;}
.lp-nav-pill{background:var(--forest);color:#fff;font-size:11px;
  font-weight:600;padding:6px 16px;border-radius:50px;
  letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;
  transition:background 0.2s ease,transform 0.2s ease;border:none;}
.lp-nav-pill:hover{background:var(--forest-mid);transform:translateY(-1px);}
.lp-hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;
  align-items:center;padding:100px 48px 60px;gap:60px;
  max-width:1280px;margin:0 auto;position:relative;}
.lp-eyebrow{display:inline-flex;align-items:center;gap:8px;
  font-size:11px;font-weight:600;letter-spacing:0.14em;
  text-transform:uppercase;color:var(--sage);margin-bottom:28px;
  opacity:0;animation:reveal-left 0.7s 0.2s ease forwards;}
.lp-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);}
.lp-headline{font-family:'Playfair Display',serif;
  font-size:clamp(42px,4.5vw,68px);font-weight:900;line-height:1.06;
  color:var(--ink);margin-bottom:8px;
  opacity:0;animation:reveal-up 0.8s 0.35s ease forwards;}
.lp-headline-accent{font-family:'Playfair Display',serif;
  font-size:clamp(42px,4.5vw,68px);font-weight:900;line-height:1.06;
  font-style:italic;color:var(--forest);display:block;margin-bottom:24px;
  opacity:0;animation:reveal-up 0.8s 0.45s ease forwards;}
.lp-subtext{font-size:15px;line-height:1.8;color:var(--warm-grey);
  max-width:480px;margin-bottom:36px;
  opacity:0;animation:reveal-up 0.8s 0.6s ease forwards;}
.lp-cta-group{display:flex;flex-direction:column;gap:14px;
  opacity:0;animation:reveal-up 0.8s 0.75s ease forwards;}
.lp-cta-primary{position:relative;overflow:hidden;
  display:inline-flex;align-items:center;gap:12px;
  background:var(--forest);color:#fff;font-size:16px;font-weight:600;
  padding:18px 36px;border-radius:4px;border:none;cursor:pointer;
  width:fit-content;letter-spacing:0.01em;font-family:'DM Sans',sans-serif;
  transition:transform 0.25s ease,box-shadow 0.25s ease;
  box-shadow:0 8px 32px rgba(28,74,50,0.28);}
.lp-cta-primary::before{content:'';position:absolute;inset:0;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent);
  background-size:200% 100%;animation:shimmer 3s ease infinite;}
.lp-cta-primary:hover{transform:translateY(-2px);box-shadow:0 14px 40px rgba(28,74,50,0.35);}
.lp-cta-arrow{width:32px;height:32px;border-radius:50%;
  background:rgba(255,255,255,0.15);display:flex;
  align-items:center;justify-content:center;font-size:16px;
  transition:transform 0.2s ease;}
.lp-cta-primary:hover .lp-cta-arrow{transform:translateX(3px);}
.lp-trust-row{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.lp-avatars{display:flex;}
.lp-avatar{width:32px;height:32px;border-radius:50%;
  border:2px solid var(--cream);font-size:11px;font-weight:700;
  display:flex;align-items:center;justify-content:center;
  margin-left:-8px;position:relative;}
.lp-avatar:first-child{margin-left:0;}
.lp-trust-text{font-size:12px;color:var(--warm-grey);}
.lp-stars{color:var(--gold);font-size:13px;}
.lp-hero-right{opacity:0;animation:reveal-up 0.9s 0.5s ease forwards;}
.lp-stat-card{background:#fff;border:1px solid var(--border);
  border-radius:16px;padding:32px;
  box-shadow:0 24px 64px rgba(0,0,0,0.06);position:relative;}
.lp-stat-card-label{font-size:11px;font-weight:700;letter-spacing:0.12em;
  text-transform:uppercase;color:var(--warm-grey);margin-bottom:24px;}
.lp-big-stat{font-family:'Playfair Display',serif;
  font-size:72px;font-weight:900;line-height:1;color:var(--forest);margin-bottom:4px;}
.lp-big-stat-label{font-size:12px;color:var(--warm-grey);
  margin-bottom:24px;letter-spacing:0.06em;text-transform:uppercase;}
.lp-stat-bar{width:100%;height:6px;background:#f0f0ee;
  border-radius:3px;margin-bottom:4px;overflow:hidden;}
.lp-stat-bar-fill{height:100%;
  background:linear-gradient(90deg,var(--forest),var(--sage));
  border-radius:3px;width:0%;transition:width 1.8s 0.5s ease;}
.lp-mini-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:20px;}
.lp-mini-stat{background:var(--cream);border-radius:10px;padding:16px;}
.lp-mini-stat-num{font-family:'Playfair Display',serif;
  font-size:26px;font-weight:700;color:var(--ink);}
.lp-mini-stat-label{font-size:11px;color:var(--warm-grey);margin-top:2px;line-height:1.4;}
.lp-blob{position:absolute;width:420px;height:420px;
  background:radial-gradient(circle at 40% 40%,rgba(74,140,100,0.07),transparent 70%);
  border-radius:60% 40% 30% 70%/60% 30% 70% 40%;
  animation:morph 12s ease-in-out infinite,float-slow 8s ease-in-out infinite;
  pointer-events:none;z-index:0;}
.lp-ticker-wrap{background:var(--forest);padding:13px 0;overflow:hidden;}
.lp-ticker{display:flex;width:max-content;animation:ticker 22s linear infinite;}
.lp-ticker-item{display:flex;align-items:center;white-space:nowrap;}
.lp-ticker-text{font-size:12px;font-weight:600;color:rgba(255,255,255,0.8);
  padding:0 32px;letter-spacing:0.05em;text-transform:uppercase;}
.lp-ticker-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.3);flex-shrink:0;}
.lp-benefits{padding:100px 48px;max-width:1280px;margin:0 auto;}
.lp-section-eyebrow{font-size:11px;font-weight:700;letter-spacing:0.14em;
  text-transform:uppercase;color:var(--sage);text-align:center;margin-bottom:16px;}
.lp-section-title{font-family:'Playfair Display',serif;
  font-size:clamp(36px,3.5vw,52px);font-weight:900;line-height:1.1;
  text-align:center;color:var(--ink);margin-bottom:8px;}
.lp-section-title em{font-style:italic;color:var(--forest);}
.lp-section-sub{text-align:center;font-size:15px;color:var(--warm-grey);
  line-height:1.75;max-width:520px;margin:0 auto 64px;}
.lp-benefits-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.lp-benefit-card{background:#fff;border:1px solid var(--border);
  border-radius:12px;padding:36px 32px;position:relative;overflow:hidden;
  transition:transform 0.3s ease,box-shadow 0.3s ease;cursor:default;}
.lp-benefit-card:hover{transform:translateY(-6px);box-shadow:0 20px 60px rgba(0,0,0,0.08);}
.lp-benefit-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,var(--forest),var(--sage));
  transform:scaleX(0);transform-origin:left;transition:transform 0.4s ease;}
.lp-benefit-card:hover::before{transform:scaleX(1);}
.lp-benefit-num{font-family:'Playfair Display',serif;font-size:52px;
  font-weight:900;color:rgba(0,0,0,0.05);line-height:1;margin-bottom:16px;}
.lp-benefit-title{font-size:18px;font-weight:700;color:var(--ink);
  margin-bottom:10px;font-family:'DM Sans',sans-serif;}
.lp-benefit-body{font-size:14px;color:var(--warm-grey);line-height:1.75;}
.lp-testimonials{background:var(--ink);padding:100px 48px;}
.lp-testimonials-inner{max-width:1280px;margin:0 auto;}
.lp-testimonials-title{font-family:'Playfair Display',serif;
  font-size:clamp(32px,3vw,48px);font-weight:900;color:#fff;
  text-align:center;margin-bottom:60px;line-height:1.15;}
.lp-testimonials-title em{color:#e8c84a;font-style:italic;}
.lp-testi-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;}
.lp-testi-card{background:rgba(255,255,255,0.04);
  border:1px solid rgba(255,255,255,0.08);
  border-radius:12px;padding:32px;
  transition:background 0.3s ease,transform 0.3s ease;}
.lp-testi-card:hover{background:rgba(255,255,255,0.07);transform:translateY(-4px);}
.lp-testi-quote{font-size:13px;color:rgba(255,255,255,0.75);
  line-height:1.8;margin-bottom:24px;font-style:italic;}
.lp-testi-author{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.lp-testi-avatar{width:40px;height:40px;border-radius:50%;font-size:14px;
  font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.lp-testi-name{font-size:13px;font-weight:700;color:#fff;}
.lp-testi-role{font-size:11px;color:rgba(255,255,255,0.45);margin-top:1px;}
.lp-testi-badge{margin-left:auto;background:rgba(74,140,100,0.25);
  color:rgba(160,220,160,0.9);font-size:11px;font-weight:700;
  padding:4px 10px;border-radius:20px;flex-shrink:0;}
.lp-final-cta{padding:120px 48px;text-align:center;
  background:var(--cream);position:relative;overflow:hidden;}
.lp-final-cta-inner{max-width:640px;margin:0 auto;position:relative;z-index:1;}
.lp-final-headline{font-family:'Playfair Display',serif;
  font-size:clamp(36px,4vw,56px);font-weight:900;
  line-height:1.1;color:var(--ink);margin-bottom:12px;}
.lp-final-headline em{font-style:italic;color:var(--forest);}
.lp-final-sub{font-size:15px;color:var(--warm-grey);line-height:1.75;margin-bottom:40px;}
.lp-final-cta-bg{position:absolute;width:600px;height:600px;
  background:radial-gradient(circle,rgba(28,74,50,0.06) 0%,transparent 70%);
  border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;}
@media (max-width: 1024px) {
  .lp-hero { grid-template-columns: 1fr !important; padding: 88px 40px 60px !important; gap: 48px !important; min-height: auto !important; }
  .lp-hero-right { max-width: 560px !important; margin: 0 auto !important; width: 100% !important; }
  .lp-nav { padding: 16px 32px !important; }
  .lp-benefits-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
  .lp-testi-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
  .lp-benefits { padding: 80px 40px !important; }
  .lp-testimonials { padding: 80px 40px !important; }
  .lp-final-cta { padding: 80px 40px !important; }
}
@media (max-width: 768px) {
  .lp-hero { grid-template-columns: 1fr !important; padding: 80px 24px 48px !important; gap: 40px !important; }
  .lp-hero-right { display: none !important; }
  .lp-nav { padding: 14px 20px !important; }
  .lp-nav-logo { font-size: 13px !important; }
  .lp-headline { font-size: 36px !important; line-height: 1.1 !important; }
  .lp-headline-accent { font-size: 36px !important; line-height: 1.1 !important; }
  .lp-subtext { font-size: 15px !important; }
  .lp-cta-primary { width: 100% !important; justify-content: center !important; font-size: 15px !important; padding: 16px 24px !important; }
  .lp-benefits { padding: 60px 24px !important; }
  .lp-benefits-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
  .lp-benefit-card { padding: 28px 24px !important; }
  .lp-section-title { font-size: 32px !important; }
  .lp-testimonials { padding: 60px 24px !important; }
  .lp-testi-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
  .lp-testi-card { padding: 24px !important; }
  .lp-final-cta { padding: 60px 24px !important; }
  .lp-final-headline { font-size: 32px !important; }
  .lp-ticker-text { font-size: 11px !important; padding: 0 20px !important; }
}
@media (max-width: 480px) {
  .lp-hero { padding: 72px 20px 40px !important; }
  .lp-nav { padding: 12px 16px !important; }
  .lp-eyebrow { font-size: 10px !important; }
  .lp-headline { font-size: 30px !important; }
  .lp-headline-accent { font-size: 30px !important; }
  .lp-subtext { font-size: 14px !important; line-height: 1.7 !important; }
  .lp-cta-primary { font-size: 14px !important; padding: 15px 20px !important; }
  .lp-trust-text { font-size: 11px !important; }
  .lp-benefits { padding: 48px 20px !important; }
  .lp-section-title { font-size: 26px !important; }
  .lp-section-sub { font-size: 14px !important; }
  .lp-benefit-card { padding: 24px 20px !important; }
  .lp-benefit-title { font-size: 16px !important; }
  .lp-benefit-body { font-size: 13px !important; }
  .lp-testimonials { padding: 48px 20px !important; }
  .lp-testimonials-title { font-size: 26px !important; }
  .lp-testi-quote { font-size: 12px !important; }
  .lp-testi-card { padding: 20px !important; }
  .lp-final-cta { padding: 48px 20px !important; }
  .lp-final-headline { font-size: 26px !important; }
  .lp-final-sub { font-size: 13px !important; }
  .quiz-title { font-size: 22px !important; line-height: 1.25 !important; }
  .quiz-sub { font-size: 14px !important; }
  .qopt { padding: 14px 16px !important; margin-bottom: 8px !important; }
  .qopt span { font-size: 15px !important; }
  .scale-btn { height: 52px !important; font-size: 18px !important; }
  .gbtn { padding: 16px 24px !important; font-size: 16px !important; }
  .dot-cur { width: 8px !important; height: 8px !important; }
  .site-header-logo-text { display: none !important; }
  .site-header-tag { display: none !important; }
  .email-screen-inner { padding: 72px 20px 40px !important; }
}
@media (max-width: 768px) and (orientation: landscape) {
  .lp-hero { min-height: auto !important; padding: 70px 32px 40px !important; }
  .lp-headline { font-size: 28px !important; }
  .lp-headline-accent { font-size: 28px !important; margin-bottom: 16px !important; }
  .lp-subtext { font-size: 13px !important; margin-bottom: 24px !important; }
}
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  .lp-hero { grid-template-columns: 1fr 1fr !important; padding: 88px 40px 60px !important; min-height: 100vh !important; }
  .lp-hero-right { display: block !important; }
  .lp-headline { font-size: 40px !important; }
  .lp-headline-accent { font-size: 40px !important; }
  .lp-benefits-grid { grid-template-columns: repeat(3,1fr) !important; }
  .lp-testi-grid { grid-template-columns: 1fr 1fr !important; }
}
@media (hover: none) and (pointer: coarse) {
  .qopt { min-height: 56px !important; }
  .gbtn { min-height: 52px !important; }
  .scale-btn { min-height: 52px !important; }
  .lp-cta-primary { min-height: 52px !important; }
  .lp-nav-pill { min-height: 40px !important; padding: 10px 18px !important; }
}
html { -webkit-text-size-adjust: 100%; text-size-adjust: 100%; scroll-behavior: smooth; }
* { -webkit-tap-highlight-color: rgba(28,74,50,0.1); }
`

/* ─── Flame Logo ─── */
function FlameLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
      <svg width="32" height="36" viewBox="0 0 32 36" fill="none">
        <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#2d6a4f"/>
        <path d="M12 20C12 20 10 22 10 24C10 27.3 12.7 30 16 30C19.3 30 22 27.3 22 24C22 22 20 20 20 20C20 20 19 22 17 23C16.5 23.3 16 23.3 16 23.3C16 23.3 17 21 12 20Z" fill="#2d6a4f" opacity="0.7"/>
        <path d="M14 25C14 25 13 26.5 13 27.5C13 29.4 14.3 31 16 31C17.7 31 19 29.4 19 27.5C19 26.5 18 25 18 25C18 25 17.5 26 16.5 26.5C16 26.7 16 26.7 16 26.7C16 26.7 16.5 25.5 14 25Z" fill="#1a4a35"/>
      </svg>
      <span className="site-header-logo-text" style={{ fontSize: 14, fontWeight: 800, color: '#225840', letterSpacing: '.06em', textTransform: 'uppercase' }}>THE5TH CONSULTING</span>
    </div>
  )
}

/* ─── Site Header (start / quiz / email / otp) ─── */
function SiteHeader({ screen, currentQ }: { screen: string; currentQ: number }) {
  const isQuiz = screen === 'quiz'
  const allDone = screen === 'email'

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
      <div className="site-header-tag" style={{
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
      <div style={{ width: '100%', textAlign: 'center', fontSize: 'clamp(64px, 12vw, 140px)', fontWeight: 900, color: '#fff', letterSpacing: '-4px', lineHeight: 1, marginBottom: 40 }}>
        THE5TH CONSULTING
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

/* ─── AnimateOnScroll ─── */
function AnimateOnScroll({ children, delay = 0, style: extraStyle }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ ...extraStyle, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms` }}>
      {children}
    </div>
  )
}

/* ─── TabletMockup ─── */
function TabletMockup() {
  const days = [
    { label: 'Day 1', title: 'Clarity & Positioning', done: true },
    { label: 'Day 2', title: 'Define Your Offer', done: false },
    { label: 'Day 3', title: 'Find Your First Lead', done: false },
  ]
  return (
    <div style={{ display: 'block', margin: '40px auto', width: 480 }}>
      {/* Tablet frame */}
      <div className="tablet-float" style={{ background: '#1a1a1a', borderRadius: 24, padding: 12, boxShadow: '0 30px 80px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333' }} />
        </div>
        <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ background: '#225840', padding: '14px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>Your 15-Day Roadmap</div>
          </div>
          {days.map(({ label, title, done }, i) => (
            <div key={i} style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', background: done ? '#f6faf7' : '#fff' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#225840', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0a0a0a', marginBottom: 8 }}>{title}</div>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, flexShrink: 0, background: done ? '#225840' : 'transparent', border: `1.5px solid ${done ? '#225840' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {done && <span style={{ fontSize: 8, color: '#fff', lineHeight: 1 }}>✓</span>}
                  </div>
                  <div style={{ height: 7, background: done ? '#d1fae5' : '#f0f0f0', borderRadius: 4, flex: 1 }} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ padding: '12px 20px', background: '#fef9ec', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 10, color: '#b8960c', fontWeight: 700, whiteSpace: 'nowrap' }}>Day 1 of 15</div>
            <div style={{ height: 4, background: '#f0e0a0', borderRadius: 2, flex: 1 }}>
              <div style={{ height: '100%', background: '#b8960c', borderRadius: 2, width: '7%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── BrowserMockup (Step 1) ─── */
function BrowserMockup() {
  return (
    <div style={{ border: '2px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', background: '#fff', maxWidth: 280, margin: '0 auto' }}>
      <div style={{ background: '#f5f5f5', padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #e8e8e8' }}>
        <div style={{ display: 'flex', gap: 5 }}>
          {['#ff5f57', '#febc2e', '#28c840'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
        </div>
        <div style={{ flex: 1, background: '#e8e8e8', borderRadius: 5, height: 17, display: 'flex', alignItems: 'center', padding: '0 8px' }}>
          <span style={{ fontSize: 8, color: '#888' }}>10kroadmap.org</span>
        </div>
      </div>
      <div style={{ background: '#f9f9f9', padding: '14px 12px' }}>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 12 }}>
          {Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: i <= 1 ? '#225840' : '#e0e0e0' }} />)}
        </div>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: '#0a0a0a', textAlign: 'center', marginBottom: 10, lineHeight: 1.4 }}>Where are you in your coaching business?</div>
        {['Just starting out 🌱', 'Have some clients 🚀', 'Ready to scale 📈'].map((opt, i) => (
          <div key={opt} style={{ background: '#fff', border: `1.5px solid ${i === 0 ? '#225840' : '#e0e0e0'}`, borderRadius: 6, padding: '6px 10px', marginBottom: 5, fontSize: 8.5, color: i === 0 ? '#225840' : '#555', fontWeight: i === 0 ? 600 : 400 }}>
            {opt}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── PhoneMockup (Step 2) ─── */
function PhoneMockup() {
  return (
    <div style={{ width: 160, margin: '0 auto' }}>
      <div style={{ background: '#1a1a1a', borderRadius: 22, padding: '10px 8px', position: 'relative', boxShadow: '0 12px 30px rgba(0,0,0,0.18)' }}>
        <div style={{ position: 'absolute', right: -3, top: 48, width: 3, height: 20, background: '#2a2a2a', borderRadius: '0 3px 3px 0' }} />
        <div style={{ position: 'absolute', left: -3, top: 40, width: 3, height: 16, background: '#2a2a2a', borderRadius: '3px 0 0 3px' }} />
        <div style={{ position: 'absolute', left: -3, top: 62, width: 3, height: 16, background: '#2a2a2a', borderRadius: '3px 0 0 3px' }} />
        <div style={{ width: 40, height: 4, background: '#000', borderRadius: 3, margin: '0 auto 8px' }} />
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ background: '#225840', padding: '7px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: '#fff' }}>Your Roadmap is Ready ✓</div>
          </div>
          {['Day 1: Clarity & Positioning', 'Day 2: Define Your Offer', 'Day 3: Find Your First Lead'].map((d, i) => (
            <div key={i} style={{ padding: '6px 10px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 6, alignItems: 'center' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: i === 0 ? '#225840' : '#e0e0e0', flexShrink: 0 }} />
              <span style={{ fontSize: 7.5, color: '#0a0a0a', fontWeight: 500 }}>{d}</span>
            </div>
          ))}
          <div style={{ padding: '6px 10px', background: '#fef9ec' }}>
            <div style={{ height: 3, background: '#f0e0a0', borderRadius: 2, marginBottom: 4 }}>
              <div style={{ width: '7%', height: '100%', background: '#b8960c', borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 7, color: '#b8960c', fontWeight: 600 }}>Day 1 of 15</div>
          </div>
          <div style={{ padding: '8px 10px' }}>
            <div style={{ background: 'linear-gradient(135deg,#225840,#2d6a4f)', borderRadius: 6, padding: '7px 10px', textAlign: 'center' }}>
              <span style={{ fontSize: 8, color: '#fff', fontWeight: 700 }}>View Day 1 →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── ChatMockup (Step 3) ─── */
function ChatMockup() {
  return (
    <div style={{ border: '7px solid #1a1a1a', borderRadius: 18, overflow: 'hidden', maxWidth: 280, margin: '0 auto', background: '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.14)' }}>
      <div style={{ background: '#225840', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>🤖</div>
        <div>
          <div style={{ fontSize: 8.5, fontWeight: 700, color: '#fff' }}>AI Coach</div>
          <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.6)' }}>Online</div>
        </div>
      </div>
      <div style={{ padding: '10px 10px', background: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ maxWidth: '85%' }}>
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px 10px 10px 2px', padding: '6px 9px', fontSize: 7.5, color: '#333', lineHeight: 1.55 }}>
            Great work on Day 3! Your next step is to reach out to 5 warm contacts using the DM script I&apos;m sending you today...
          </div>
        </div>
        <div style={{ maxWidth: '80%', alignSelf: 'flex-end' }}>
          <div style={{ background: '#225840', borderRadius: '10px 10px 2px 10px', padding: '6px 9px', fontSize: 7.5, color: '#fff', lineHeight: 1.55 }}>
            Done! Got 2 responses already 🎉
          </div>
        </div>
        <div style={{ maxWidth: '85%' }}>
          <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px 10px 10px 2px', padding: '6px 9px', fontSize: 7.5, color: '#333', lineHeight: 1.55 }}>
            That&apos;s amazing! Here&apos;s exactly what to say next...
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── LandingTabletMockup ─── */
function LandingTabletMockup() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setVisible(true) }) },
      { threshold: [0, 0.25, 0.5, 0.75, 1.0] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const sidebarDays = [
    { day: 1, label: 'Clarity & Positioning', done: true, current: false, locked: false },
    { day: 2, label: 'Define Your Offer', done: true, current: false, locked: false },
    { day: 3, label: 'First Outreach', done: true, current: false, locked: false },
    { day: 4, label: 'Build Outreach System', done: false, current: true, locked: false },
    { day: 5, label: 'Content Strategy', done: false, current: false, locked: true },
    { day: 6, label: 'Sales Framework', done: false, current: false, locked: true },
    { day: 7, label: 'Pricing Confidence', done: false, current: false, locked: true },
    { day: 8, label: 'Client Conversion', done: false, current: false, locked: true },
  ]
  const taskItems = [
    { task: 'Identify 10 warm leads in your network', done: true },
    { task: 'Write your personalized DM script', done: true },
    { task: 'Send your first 3 outreach messages', done: false },
  ]

  return (
    <div
      ref={ref}
      className="landing-tablet"
      style={{
        maxWidth: 1000, margin: '0 auto',
        transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1s ease',
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(40px)',
        opacity: visible ? 1 : 0.3,
      }}
    >
      <div style={{ background: '#111', borderRadius: 20, padding: 16, boxShadow: '0 60px 120px rgba(0,0,0,0.3)' }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#333', margin: '0 auto 10px' }} />
        <div style={{ background: '#f8f8f8', borderRadius: 10, overflow: 'hidden' }}>
          {/* Nav bar */}
          <div style={{ background: 'white', borderBottom: '1px solid #eee', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="10" height="12" viewBox="0 0 32 36" fill="none">
                <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#2d6a4f"/>
              </svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#225840' }}>The5th</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, background: '#fef9ec', color: '#b8960c', padding: '3px 8px', borderRadius: 10 }}>Day 3 of 15</span>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e8d5b7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>A</div>
            </div>
          </div>
          {/* Main content */}
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, minHeight: 320 }}>
            {/* Sidebar */}
            <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#aaa', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>15-DAY ROADMAP</div>
              {sidebarDays.map(({ day, label, done, current, locked }) => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 28, borderRadius: 6, padding: '0 6px', marginBottom: 2, background: done ? '#e8f5ee' : 'transparent', border: current ? '1.5px solid #b8960c' : 'none' }}>
                  <span style={{ fontSize: 9, color: done ? '#225840' : current ? '#b8960c' : '#aaa', fontWeight: 700, flexShrink: 0 }}>{done ? '✓' : locked ? '🔒' : '→'}</span>
                  <span style={{ fontSize: 9, color: done ? '#225840' : current ? '#b8960c' : '#bbb', fontWeight: current ? 700 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: 9, color: '#888' }}>3 of 15 complete</div>
              <div style={{ height: 3, background: '#f0f0f0', borderRadius: 2, marginTop: 4 }}>
                <div style={{ width: '20%', height: '100%', background: '#225840', borderRadius: 2 }} />
              </div>
            </div>
            {/* Main panel */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#b8960c', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>TODAY&apos;S MISSION</div>
              <div style={{ background: 'white', borderRadius: 12, padding: 16, borderLeft: '4px solid #b8960c', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 10 }}>Day 4: Build Your Outreach System</div>
                {taskItems.map(({ task, done }, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: done ? '#225840' : 'transparent', border: `1.5px solid ${done ? '#225840' : '#d1d5db'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {done && <span style={{ fontSize: 7, color: '#fff' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: 10, color: done ? '#aaa' : '#333', textDecoration: done ? 'line-through' : 'none' }}>{task}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, background: '#b8960c', color: 'white', borderRadius: 6, padding: '6px 12px', fontSize: 10, fontWeight: 600, textAlign: 'center' }}>Complete Today</div>
              </div>
              <div style={{ background: 'white', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#333', marginBottom: 8 }}>$0 of $10,000</div>
                <div style={{ height: 4, background: '#f0f0f0', borderRadius: 2, marginBottom: 8 }}>
                  <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg, #225840, #4a9a6a)', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 10, color: '#225840', fontWeight: 600 }}>Log Today&apos;s Revenue +</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Landing page data ─── */
const LP_TICKER = ['Niche Clarity','Signature Offer','Pricing Strategy','7-Day Content Plan','30-Day Roadmap','Lead Magnet','Digital Product','AI Coaching']

const LP_BENEFITS = [
  { num:'01', title:'Your $10K Personalised Blueprint',
    body:'20 answers analysed against 2,400 real coaching profiles. Your niche, your offer, your pricing, your 30-day plan. Not a template. Not recycled advice. Yours.' },
  { num:'02', title:'7 Days of AI Coaching Emails',
    body:'For a week after your quiz, The5th AI sends you one coaching email a day written from your exact answers. Real homework. Real strategies. It reads like someone who actually knows your situation — because it does.' },
  { num:'03', title:'Your Personalised Video',
    body:'Based on where you are in your business journey, we created a short video speaking directly to your stage. Not a webinar replay. Just the one thing you probably need to hear right now.' },
]

const LP_TESTIMONIALS = [
  { quote:'After a failed launch I had lost confidence completely. We rebuilt the strategy, repositioned my pricing from $79 to $225, and within three months generated $26,000 in revenue. I still find that number hard to believe.',
    name:'Laurie Gerber', role:'Online Course Creator', badge:'$26K in 3 months', init:'L', bg:'#2a5c3a' },
  { quote:'I had spoken to multiple agencies before finding Indrodip. None delivered. Within one month I became an Amazon bestselling author. I honestly did not think it would happen that fast.',
    name:'Abbas Jamie', role:'Author and Speaker', badge:'Bestselling Author', init:'A', bg:'#3a3a5c' },
  { quote:'I had spent over $10,000 on coaches before working with Indrodip. None gave me the clarity he did. He rebuilt how I saw my business from niche to offer to the sales conversation. Six weeks later I closed my first client.',
    name:'Jeanne Tomasak', role:'Business Coach', badge:'First client in 6 weeks', init:'J', bg:'#5c3a3a' },
  { quote:'Twenty years running education programs across the UK. I burned through $25,000 on coaches who did not get my context. Two months with Indrodip and I closed my first $2,500 sale. For someone who had nearly given up, that meant everything.',
    name:'Angela Gregg', role:'Education Director', badge:'$2,500 first sale', init:'G', bg:'#3a5c4a' },
]

const LP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
:root{--cream:#faf6f1;--ink:#0d0d0b;--forest:#1c4a32;--forest-mid:#2a6647;--sage:#4a8c64;--gold:#b8920a;--warm-grey:#8a8680;--border:rgba(28,74,50,0.12);}
.lp2{min-height:100vh;background:var(--cream);font-family:'DM Sans',sans-serif;overflow-x:hidden;cursor:none;}
.lp2 *,.lp2 *::before,.lp2 *::after{box-sizing:border-box;margin:0;padding:0;}
.lp2-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:20px 64px;background:rgba(250,246,241,0.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--border);}
.lp2-logo{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--forest);letter-spacing:.04em;}
.lp2-nav-right{display:flex;align-items:center;gap:24px;}
.lp2-nav-hint{font-size:13px;color:var(--warm-grey);}
.lp2-pill{background:var(--forest);color:#fff;font-size:11px;font-weight:600;padding:8px 20px;border-radius:50px;letter-spacing:.06em;text-transform:uppercase;cursor:none;border:none;font-family:'DM Sans',sans-serif;}
.lp2-hero-wrap{position:relative;overflow:hidden;}
.lp2-hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:100px 64px 60px;gap:64px;max-width:1320px;margin:0 auto;position:relative;z-index:1;}
.lp2-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:var(--sage);margin-bottom:28px;}
.lp2-eyebrow-dot{width:6px;height:6px;border-radius:50%;background:var(--gold);flex-shrink:0;}
.lp2-h1{font-family:'Playfair Display',serif;font-size:clamp(44px,4.8vw,70px);font-weight:900;line-height:1.04;color:var(--ink);}
.lp2-h1-accent{font-family:'Playfair Display',serif;font-size:clamp(44px,4.8vw,70px);font-weight:900;line-height:1.04;font-style:italic;color:var(--forest);display:block;margin-bottom:28px;}
.lp2-sub{font-size:15px;line-height:1.82;color:var(--warm-grey);max-width:460px;margin-bottom:40px;}
.lp2-cta-wrap{display:flex;flex-direction:column;align-items:flex-start;gap:16px;}
.lp2-cta{position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:14px;background:var(--forest);color:#fff;font-size:15px;font-weight:600;padding:18px 36px;border-radius:4px;border:none;cursor:none;letter-spacing:.01em;font-family:'DM Sans',sans-serif;box-shadow:0 8px 32px rgba(28,74,50,0.28);}
.lp2-cta::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.1) 50%,transparent 100%);background-size:200% 100%;animation:lp2sh 2.8s linear infinite;}
@keyframes lp2sh{0%{background-position:-200% center}100%{background-position:200% center}}
.lp2-arrow{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;}
.lp2-trust{display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.lp2-avatars{display:flex;}
.lp2-av{width:32px;height:32px;border-radius:50%;border:2px solid var(--cream);font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;margin-left:-8px;}
.lp2-av:first-child{margin-left:0;}
.lp2-stars{color:var(--gold);font-size:13px;letter-spacing:1px;}
.lp2-trust-txt{font-size:12px;color:var(--warm-grey);}
.lp2-blob{position:absolute;width:480px;height:480px;background:radial-gradient(circle at 40% 40%,rgba(74,140,100,0.09),transparent 70%);pointer-events:none;z-index:0;}
.lp2-stat-card{background:#fff;border:1px solid var(--border);border-left:3px solid var(--forest);border-radius:20px;padding:36px;box-shadow:0 24px 64px rgba(0,0,0,0.07);}
.lp2-card-lbl{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--warm-grey);margin-bottom:20px;}
.lp2-big-num{font-family:'Playfair Display',serif;font-size:80px;font-weight:900;line-height:1;color:var(--forest);}
.lp2-big-sub{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--warm-grey);margin:6px 0 20px;}
.lp2-bar-track{width:100%;height:5px;background:#f0efee;border-radius:3px;overflow:hidden;margin-bottom:4px;}
.lp2-bar-fill{height:100%;background:linear-gradient(90deg,var(--forest),var(--sage));border-radius:3px;transition:width 1.8s cubic-bezier(0.16,1,0.3,1);}
.lp2-bar-lbls{display:flex;justify-content:space-between;font-size:10px;color:var(--warm-grey);margin-bottom:24px;}
.lp2-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}
.lp2-mini{background:var(--cream);border-radius:10px;padding:14px 16px;}
.lp2-mini-num{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--ink);line-height:1;margin-bottom:4px;}
.lp2-mini-lbl{font-size:10px;color:var(--warm-grey);line-height:1.45;}
.lp2-cq{padding:16px 18px;background:var(--cream);border-radius:10px;border-left:3px solid var(--forest);}
.lp2-cq-txt{font-size:12px;color:#555;line-height:1.65;font-style:italic;}
.lp2-cq-attr{font-size:11px;font-weight:700;color:var(--forest);margin-top:8px;}
.lp2-ticker-wrap{background:var(--forest);padding:14px 0;overflow:hidden;-webkit-overflow-scrolling:touch;}
.lp2-ticker-inner{display:flex;width:max-content;will-change:transform;-webkit-animation-play-state:running !important;animation-play-state:running !important;}
.lp2-ticker-txt{font-size:11px;font-weight:600;color:rgba(255,255,255,0.82);padding:0 28px;letter-spacing:.06em;text-transform:uppercase;white-space:nowrap;}
.lp2-ticker-dot{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,0.3);flex-shrink:0;align-self:center;}
.lp2-benefits-wrap{background:var(--cream);}
.lp2-benefits{padding:120px 64px;max-width:1320px;margin:0 auto;}
.lp2-sect-ey{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sage);text-align:center;margin-bottom:16px;}
.lp2-sect-h{font-family:'Playfair Display',serif;font-size:clamp(36px,3.5vw,54px);font-weight:900;line-height:1.1;text-align:center;color:var(--ink);}
.lp2-sect-h em{font-style:italic;color:var(--forest);}
.lp2-sect-sub{text-align:center;font-size:15px;color:var(--warm-grey);line-height:1.8;max-width:520px;margin:18px auto 64px;}
.lp2-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
.lp2-benefit{background:#fff;border:1px solid var(--border);border-radius:14px;padding:40px 32px;position:relative;overflow:hidden;cursor:default;}
.lp2-benefit::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--forest),var(--sage));transform:scaleX(0);transform-origin:left;transition:transform .4s ease;}
.lp2-benefit:hover::before{transform:scaleX(1);}
.lp2-benefit-num{font-family:'Playfair Display',serif;font-size:56px;font-weight:900;color:rgba(0,0,0,0.05);line-height:1;margin-bottom:16px;}
.lp2-benefit-title{font-size:18px;font-weight:700;color:var(--ink);margin-bottom:10px;font-family:'DM Sans',sans-serif;}
.lp2-benefit-body{font-size:14px;color:var(--warm-grey);line-height:1.78;}
.lp2-testi-section{background:var(--ink);padding:120px 64px;}
.lp2-testi-inner{max-width:1320px;margin:0 auto;}
.lp2-testi-h{font-family:'Playfair Display',serif;font-size:clamp(36px,3.5vw,52px);font-weight:900;color:#fff;text-align:center;margin-bottom:64px;line-height:1.12;}
.lp2-testi-h em{color:#e8c84a;font-style:italic;}
.lp2-grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;}
.lp2-testi{background:rgba(255,255,255,0.045);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:32px;backdrop-filter:blur(4px);cursor:default;}
.lp2-testi-q{font-size:13px;color:rgba(255,255,255,0.72);line-height:1.82;margin-bottom:24px;font-style:italic;}
.lp2-testi-auth{display:flex;align-items:center;gap:12px;flex-wrap:wrap;}
.lp2-testi-av{width:40px;height:40px;border-radius:50%;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.lp2-testi-name{font-size:13px;font-weight:700;color:#fff;}
.lp2-testi-role{font-size:11px;color:rgba(255,255,255,0.42);margin-top:1px;}
.lp2-testi-badge{margin-left:auto;background:rgba(74,140,100,0.22);color:rgba(160,220,160,0.9);font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;flex-shrink:0;}
.lp2-final{padding:140px 64px;text-align:center;background:var(--cream);position:relative;overflow:hidden;}
.lp2-final-inner{max-width:640px;margin:0 auto;position:relative;z-index:1;}
.lp2-final-ey{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--sage);margin-bottom:20px;}
.lp2-final-h{font-family:'Playfair Display',serif;font-size:clamp(40px,4.5vw,60px);font-weight:900;line-height:1.1;color:var(--ink);margin-bottom:20px;}
.lp2-final-h em{font-style:italic;color:var(--forest);}
.lp2-final-sub{font-size:15px;color:var(--warm-grey);line-height:1.8;margin-bottom:44px;}
.lp2-final-note{margin-top:16px;font-size:12px;color:var(--warm-grey);}
.lp2-glow{position:absolute;width:640px;height:640px;background:radial-gradient(circle,rgba(28,74,50,0.06) 0%,transparent 70%);border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;}
@media(max-width:1024px){.lp2-hero{gap:40px;padding:100px 40px 60px}.lp2-benefits{padding:80px 40px}.lp2-testi-section{padding:80px 40px}.lp2-final{padding:100px 40px}}
@media(max-width:768px){.lp2-hero{grid-template-columns:1fr;padding:88px 24px 40px}.lp2-stat-card{display:none}.lp2-nav{padding:16px 24px}.lp2-benefits{padding:60px 24px}.lp2-grid3{grid-template-columns:1fr}.lp2-testi-section{padding:60px 24px}.lp2-grid2{grid-template-columns:1fr}.lp2-final{padding:80px 24px}.lp2{cursor:auto}.lp2-pill,.lp2-cta{cursor:pointer}.lp2-h1{font-size:38px !important;line-height:1.08 !important;letter-spacing:-0.5px !important}.lp2-h1-accent{font-size:38px !important;line-height:1.08 !important;letter-spacing:-0.5px !important}}
@media(max-width:480px){.lp2-h1{font-size:34px !important;line-height:1.06 !important;letter-spacing:-0.5px !important}.lp2-h1-accent{font-size:34px !important;line-height:1.06 !important;letter-spacing:-0.5px !important}}
@media(min-width:390px) and (max-width:480px){.lp2-h1{font-size:40px !important;line-height:1.06 !important;letter-spacing:-0.5px !important}.lp2-h1-accent{font-size:40px !important;line-height:1.06 !important;letter-spacing:-0.5px !important}}
@media(max-width:375px){.lp2-h1{font-size:30px !important;line-height:1.06 !important;letter-spacing:-0.5px !important}.lp2-h1-accent{font-size:30px !important;line-height:1.06 !important}}
`

/* ─── LandingPage component ─── */
function LandingPage({ onStart }: { onStart: () => void }) {
  const [prefersReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  /* ── Custom cursor ── */
  const dotX = useSpring(-100, { stiffness: 800, damping: 40 })
  const dotY = useSpring(-100, { stiffness: 800, damping: 40 })
  const ringX = useSpring(-100, { stiffness: 140, damping: 22 })
  const ringY = useSpring(-100, { stiffness: 140, damping: 22 })
  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    if (prefersReduced) return
    const move = (e: MouseEvent) => {
      dotX.set(e.clientX - 5)
      dotY.set(e.clientY - 5)
      ringX.set(e.clientX - 17)
      ringY.set(e.clientY - 17)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [dotX, dotY, ringX, ringY, prefersReduced])

  /* ── Scroll parallax ── */
  const heroWrapRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroWrapRef, offset: ['start start', 'end start'] })
  const headlineY   = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const blobY       = useTransform(scrollYProgress, [0, 1], ['0px', '-70px'])
  const statCardY   = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])

  /* ── Stat counters ── */
  const statsRef  = useRef<HTMLDivElement>(null)
  const statsInView = useInView(statsRef, { once: true, amount: 0.25 })
  const [c98, setC98]     = useState(0)
  const [c2400, setC2400] = useState(0)
  const [c20, setC20]     = useState(0)
  const [c7, setC7]       = useState(0)
  const [barW, setBarW]   = useState('0%')

  useEffect(() => {
    if (!statsInView) return
    setBarW('98%')
    const run = (setter: (v: number) => void, target: number, frames: number) => {
      let f = 0
      const id = setInterval(() => {
        f++
        setter(Math.min(Math.round((f / frames) * target), target))
        if (f >= frames) clearInterval(id)
      }, 16)
      return id
    }
    const t1 = run(setC98,   98,   90)
    const t2 = run(setC2400, 2400, 125)
    const t3 = run(setC20,   20,   50)
    const t4 = run(setC7,    7,    50)
    return () => [t1, t2, t3, t4].forEach(clearInterval)
  }, [statsInView])

  /* ── Section in-view refs ── */
  const benefitsRef = useRef<HTMLDivElement>(null)
  const benefitsInView = useInView(benefitsRef, { once: true, amount: 0.12 })
  const testiRef    = useRef<HTMLDivElement>(null)
  const testiInView = useInView(testiRef, { once: true, amount: 0.1 })
  const finalRef    = useRef<HTMLDivElement>(null)
  const finalInView = useInView(finalRef, { once: true, amount: 0.2 })

  /* ── Magnetic buttons ── */
  const ctaRef     = useRef<HTMLButtonElement>(null)
  const pillRef    = useRef<HTMLButtonElement>(null)
  const ctaMX  = useSpring(0, { stiffness: 200, damping: 20 })
  const ctaMY  = useSpring(0, { stiffness: 200, damping: 20 })
  const pillMX = useSpring(0, { stiffness: 200, damping: 20 })
  const pillMY = useSpring(0, { stiffness: 200, damping: 20 })

  const magMove = (
    e: React.MouseEvent, el: HTMLElement | null,
    mx: ReturnType<typeof useSpring>, my: ReturnType<typeof useSpring>
  ) => {
    if (prefersReduced || !el) return
    const r = el.getBoundingClientRect()
    mx.set((e.clientX - r.left - r.width / 2) * 0.28)
    my.set((e.clientY - r.top  - r.height / 2) * 0.28)
  }
  const magLeave = (mx: ReturnType<typeof useSpring>, my: ReturnType<typeof useSpring>) => {
    mx.set(0); my.set(0)
  }

  /* ── Shared transition helper ── */
  const ease = [0.22, 1, 0.36, 1] as const
  const tr = (d = 0) => prefersReduced ? { duration: 0 } : { duration: 0.65, delay: d, ease }
  const spr = { type: 'spring' as const, stiffness: 260, damping: 24 }
  const fadeUp = (d = 0) => ({
    initial: prefersReduced ? {} : { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    transition: tr(d),
  })

  return (
    <div className="lp2">
      <style>{LP_CSS}</style>

      {/* ── Cursor ── */}
      {!prefersReduced && (<>
        <motion.div style={{
          position:'fixed',top:0,left:0,width:10,height:10,borderRadius:'50%',
          background:'var(--forest)',pointerEvents:'none',zIndex:9999,
          x:dotX, y:dotY,
        }}
          animate={{ scale: hovering ? 3 : 1 }}
          transition={{ type:'spring', stiffness:400, damping:20 }}
        />
        <motion.div style={{
          position:'fixed',top:0,left:0,width:34,height:34,borderRadius:'50%',
          border:'1.5px solid var(--forest)',pointerEvents:'none',zIndex:9998,
          x:ringX, y:ringY, opacity:0.45,
        }}
          animate={{ scale: hovering ? 1.5 : 1 }}
          transition={{ type:'spring', stiffness:300, damping:22 }}
        />
      </>)}

      {/* ── Grain overlay ── */}
      <motion.div style={{
        position:'fixed',top:'-50%',left:'-50%',width:'200%',height:'200%',
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        pointerEvents:'none',zIndex:9997,opacity:0.35,
      }}
        animate={prefersReduced ? {} : { x:[0,-4,6,-3,0], y:[0,-6,4,8,0] }}
        transition={{ duration:8, repeat:Infinity, ease:'linear' }}
      />

      {/* ══ NAV ══════════════════════════════════ */}
      <motion.nav className="lp2-nav"
        initial={prefersReduced ? {} : { y:-64, opacity:0 }}
        animate={{ y:0, opacity:1 }}
        transition={tr(0)}
      >
        <div className="lp2-logo">The5th Consulting</div>
        <div className="lp2-nav-right">
          <span className="lp2-nav-hint">Free · 5 min quiz</span>
          <motion.button ref={pillRef} className="lp2-pill"
            onClick={onStart}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => { setHovering(false); magLeave(pillMX, pillMY) }}
            onMouseMove={e => magMove(e, pillRef.current, pillMX, pillMY)}
            style={{ x:pillMX, y:pillMY }}
            whileHover={prefersReduced ? {} : { scale:1.05, y:-2 }}
            whileTap={{ scale:0.96 }}
            transition={spr}
          >Take The Quiz</motion.button>
        </div>
      </motion.nav>

      {/* ══ HERO ═════════════════════════════════ */}
      <div className="lp2-hero-wrap" ref={heroWrapRef}>
        <div className="lp2-hero">

          {/* Morphing blob */}
          <motion.div className="lp2-blob"
            style={{ top:'-120px', right:'-80px', y:blobY }}
            animate={prefersReduced ? {} : { borderRadius:[
              '60% 40% 30% 70% / 60% 30% 70% 40%',
              '40% 60% 70% 30% / 40% 70% 30% 60%',
              '30% 70% 40% 60% / 50% 40% 60% 50%',
              '70% 30% 60% 40% / 30% 60% 40% 70%',
              '60% 40% 30% 70% / 60% 30% 70% 40%',
            ]}}
            transition={{ duration:16, repeat:Infinity, ease:'easeInOut' }}
          />

          {/* Left — copy */}
          <motion.div style={{ position:'relative', zIndex:1, y: prefersReduced ? 0 : headlineY }}>
            <motion.div className="lp2-eyebrow" {...fadeUp(0.1)}>
              <div className="lp2-eyebrow-dot" />
              Free AI Business Blueprint
            </motion.div>

            <motion.h1 className="lp2-h1" {...fadeUp(0.28)}>If you&apos;re over 40, you already have</motion.h1>
            <motion.span className="lp2-h1-accent" {...fadeUp(0.44)}>what it takes.</motion.span>

            <motion.p className="lp2-sub" {...fadeUp(0.52)}>
              You&apos;ve spent years building real expertise. Maybe raising a family,
              surviving a career shift, or simply living through things most people
              only read about. That experience is worth something. Probably more than
              you think. Take our 20-question quiz and get a free personalised roadmap
              showing exactly how to turn what you know into consistent income.
            </motion.p>

            <motion.div className="lp2-cta-wrap"
              initial={prefersReduced ? {} : { opacity:0, scale:0.9 }}
              animate={{ opacity:1, scale:1 }}
              transition={{ ...spr, delay:0.7 }}
            >
              <motion.button ref={ctaRef} className="lp2-cta"
                onClick={onStart}
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => { setHovering(false); magLeave(ctaMX, ctaMY) }}
                onMouseMove={e => magMove(e, ctaRef.current, ctaMX, ctaMY)}
                style={{ x:ctaMX, y:ctaMY }}
                whileHover={prefersReduced ? {} : {
                  scale:1.02, y:-3,
                  boxShadow:'0 18px 48px rgba(28,74,50,0.38)',
                }}
                whileTap={{ scale:0.97 }}
                transition={spr}
              >
                Find My Business Blueprint
                <motion.div className="lp2-arrow"
                  whileHover={prefersReduced ? {} : { x:4 }}
                  transition={spr}
                >&#8594;</motion.div>
              </motion.button>

              <div className="lp2-trust">
                <div className="lp2-avatars">
                  {[{i:'L',bg:'#d4e8d5'},{i:'A',bg:'#e8d5b7'},{i:'J',bg:'#d5d4e8'},{i:'M',bg:'#e8d5d5'},{i:'S',bg:'#d5e8e8'}]
                    .map((a, idx) => (
                      <div key={idx} className="lp2-av"
                        style={{ background:a.bg, color:'#333', zIndex:5-idx }}>{a.i}</div>
                    ))}
                </div>
                <span className="lp2-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
                <span className="lp2-trust-txt">2,400+ women already got their blueprint</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right — Stats card */}
          <motion.div
            ref={statsRef}
            style={{ y: prefersReduced ? 0 : statCardY }}
            initial={prefersReduced ? {} : { opacity:0, x:50 }}
            animate={{ opacity:1, x:0 }}
            transition={tr(0.42)}
          >
            <div className="lp2-stat-card">
              <div className="lp2-card-lbl">Women who get offer clarity</div>
              <div className="lp2-big-num">{c98}%</div>
              <div className="lp2-big-sub">clarity rate</div>
              <div className="lp2-bar-track">
                <div className="lp2-bar-fill" style={{ width: barW }} />
              </div>
              <div className="lp2-bar-lbls">
                <span>0%</span>
                <span>{c2400.toLocaleString()} profiled</span>
                <span>100%</span>
              </div>
              <div className="lp2-mini-grid">
                {[
                  { num:`${c20}`,   lbl:'Deep questions that reveal your path' },
                  { num:`${c7}`,    lbl:'Business archetypes mapped' },
                  { num:'$15M+',    lbl:'Real coaching data trained in' },
                  { num:'45s',      lbl:'To generate your roadmap' },
                ].map((s, i) => (
                  <div key={i} className="lp2-mini">
                    <div className="lp2-mini-num">{s.num}</div>
                    <div className="lp2-mini-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
              <div className="lp2-cq">
                <div className="lp2-cq-txt">
                  &ldquo;I had spent over $10,000 on coaches before. None gave me the clarity
                  Indrodip did. Six weeks later I closed my first client.&rdquo;
                </div>
                <div className="lp2-cq-attr">Jeanne T. &mdash; Business Coach</div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ══ TICKER ═══════════════════════════════ */}
      <div className="lp2-ticker-wrap">
        <motion.div className="lp2-ticker-inner"
          animate={prefersReduced ? {} : { x:['0%','-50%'] }}
          transition={{ duration:25, repeat:Infinity, ease:'linear' }}
          style={{ willChange: 'transform' }}
        >
          {[0, 1].map(pass => (
            <div key={pass} style={{ display:'flex', alignItems:'center' }}>
              {LP_TICKER.map((item, i) => (
                <React.Fragment key={`${pass}-${i}`}>
                  <span className="lp2-ticker-txt">{item}</span>
                  <div className="lp2-ticker-dot" />
                </React.Fragment>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ BENEFITS ═════════════════════════════ */}
      <div className="lp2-benefits-wrap">
        <div className="lp2-benefits" ref={benefitsRef}>
          <motion.div
            initial={prefersReduced ? {} : { opacity:0, y:32 }}
            animate={benefitsInView ? { opacity:1, y:0 } : {}}
            transition={tr(0)}
          >
            <div className="lp2-sect-ey">What You Get &mdash; Completely Free</div>
            <h2 className="lp2-sect-h">
              Not a generic quiz.<br /><em>Your actual blueprint.</em>
            </h2>
            <p className="lp2-sect-sub">
              Most online quizzes put you in a box and hand you a PDF everyone else got too.
              This is different. Each roadmap is written for you, about you,
              around what you actually told us.
            </p>
          </motion.div>
          <div className="lp2-grid3">
            {LP_BENEFITS.map((b, i) => (
              <motion.div key={i} className="lp2-benefit"
                initial={prefersReduced ? {} : { opacity:0, y:40 }}
                animate={benefitsInView ? { opacity:1, y:0 } : {}}
                transition={tr(i * 0.12)}
                whileHover={prefersReduced ? {} : {
                  y:-8,
                  boxShadow:'0 20px 56px rgba(0,0,0,0.09)',
                  borderColor:'rgba(28,74,50,0.24)',
                }}
              >
                <div className="lp2-benefit-num">{b.num}</div>
                <div className="lp2-benefit-title">{b.title}</div>
                <div className="lp2-benefit-body">{b.body}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ TESTIMONIALS ═════════════════════════ */}
      <section className="lp2-testi-section">
        <div className="lp2-testi-inner" ref={testiRef}>
          <motion.h2 className="lp2-testi-h"
            initial={prefersReduced ? {} : { opacity:0, y:40 }}
            animate={testiInView ? { opacity:1, y:0 } : {}}
            transition={tr(0)}
          >
            Real women.<br /><em>Real results.</em>
          </motion.h2>
          <div className="lp2-grid2">
            {LP_TESTIMONIALS.map((t, i) => (
              <motion.div key={i} className="lp2-testi"
                initial={prefersReduced ? {} : { opacity:0, y:30 }}
                animate={testiInView ? { opacity:1, y:0 } : {}}
                transition={tr(i * 0.1)}
                whileHover={prefersReduced ? {} : {
                  y:-5,
                  background:'rgba(255,255,255,0.075)',
                  borderColor:'rgba(255,255,255,0.16)',
                }}
              >
                <p className="lp2-testi-q">&ldquo;{t.quote}&rdquo;</p>
                <div className="lp2-testi-auth">
                  <div className="lp2-testi-av" style={{ background:t.bg, color:'#fff' }}>{t.init}</div>
                  <div>
                    <div className="lp2-testi-name">{t.name}</div>
                    <div className="lp2-testi-role">{t.role}</div>
                  </div>
                  <div className="lp2-testi-badge">{t.badge}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ════════════════════════════ */}
      <section className="lp2-final">
        <div className="lp2-glow" />
        <div className="lp2-final-inner" ref={finalRef}>
          <motion.div
            initial={prefersReduced ? {} : { opacity:0, y:40 }}
            animate={finalInView ? { opacity:1, y:0 } : {}}
            transition={tr(0)}
          >
            <div className="lp2-final-ey">Start Now &mdash; It Is Free</div>
            <h2 className="lp2-final-h">
              You already have<br /><em>what it takes.</em>
            </h2>
            <p className="lp2-final-sub">
              You just need the roadmap. 20 questions. 45 seconds to generate.
              A plan built entirely around your experience, your goals,
              and where you actually are right now.
            </p>
            <motion.button className="lp2-cta"
              onClick={onStart}
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              style={{ margin:'0 auto' }}
              whileHover={prefersReduced ? {} : {
                scale:1.02, y:-3,
                boxShadow:'0 18px 48px rgba(28,74,50,0.38)',
              }}
              whileTap={{ scale:0.97 }}
              transition={spr}
            >
              Take The Free Quiz
              <div className="lp2-arrow">&#8594;</div>
            </motion.button>
            <div className="lp2-final-note">Free &middot; 5 minutes &middot; No credit card</div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

/* ─── Page ─── */
export default function Page() {
  const [screen, setScreen] = useState<'start' | 'quiz' | 'email' | 'dashboard'>('start')
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

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])
  const chatEndRef = useRef<HTMLDivElement>(null)

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
  const BLOCKED_DOMAINS = [
    'mailinator.com','guerrillamail.com','tempmail.com','throwam.com',
    'sharklasers.com','yopmail.com','yopmail.fr','trashmail.com',
    'trashmail.me','trashmail.net','trashmail.io','trashmail.xyz',
    'trashmail.at','trashmail.org','10minutemail.com','10minutemail.net',
    'minutemail.com','tempail.com','emailondeck.com','getairmail.com',
    'fakeinbox.com','mailnesia.com','discard.email','tempr.email',
    'spambox.us','mytrashmail.com','mohmal.com','maildrop.cc',
    'spam4.me','dispostable.com','mailnull.com','spamgourmet.com',
    'nwldx.com','filzmail.com','tempemail.net','fakemail.net',
    'spamspot.com','obobbo.com','wegwerfmail.de','wegwerfmail.net',
    'tempinbox.com','spammotel.com','spamfree24.org','spamthisplease.com',
    'guerrillamailblock.com','grr.la','spam.la','ass.pp.ua',
    'binkmail.com','bobmail.info','chammy.info','devnullmail.com',
    'discardmail.com','discardmail.de','dudmail.com','dumpmail.de',
    'email60.com','emailias.com','emailinfive.com','etranquil.com',
    'explodemail.com','fastacura.com','fleckens.hu','frapmail.com',
    'garliclife.com','gishpuppy.com','great-host.in','gustr.com',
    'h8s.org','haltospam.com','herp.in','hidemail.de','hidzz.com',
    'hmamail.com','hopemail.biz','ieatspam.eu','ieatspam.info',
    'ieh-mail.de','imail1.net','inoutmail.de','inoutmail.eu',
    'inoutmail.info','inoutmail.net','internet-e-mail.de',
    'internet-mail.org','internetemails.net','internetmailing.net',
    'inwind.it','ipoo.org','irish2me.com','iwi.net',
    'jetable.com','jetable.fr.nf','jetable.net','jetable.org',
    'jnxjn.com','jourrapide.com','jsrsolutions.com','kasmail.com',
    'kaspop.com','keepmymail.com','killmail.com','killmail.net',
    'kimsdisk.com','klzlk.com','koszmail.pl','kurzepost.de',
    'lawlita.com','letthemeatspam.com','lhsdv.com','lifebyfood.com',
    'link2mail.net','litedrop.com','lolfreak.net','lookugly.com',
    'lortemail.dk','lucky-mail.info','lv0.in','m21.cc',
    'mail-filter.com','mail-temporaire.com','mail-temporaire.fr',
    'mail2rss.org','mail333.com','mailbidon.com','mailbiz.biz',
    'mailblocks.com','mailbucket.org','mailcat.biz','mailcatch.com',
    'mailde.de','mailde.info','mailexpire.com','mailfa.tk',
    'mailforspam.com','mailfreeonline.com','mailfs.com','mailguard.me',
    'mailin8r.com','mailinatar.com','mailincubator.com',
    'mailismagic.com','mailme.ir','mailme.lv','mailme24.com',
    'mailmetrash.com','mailmoat.com','mailms.com','mailnew.com',
    'mailorg.org','mailpick.biz','mailproxsy.com','mailquack.com',
    'mailrock.biz','mailscrap.com','mailshell.com','mailsiphon.com',
    'mailslite.com','mailspeed.ru','mailtemp.info','mailtome.de',
    'mailtothis.com','mailtrash.net','mailtv.net','mailzilla.com',
    'mailzilla.org','makemetheking.com','mbx.cc','mega.zik.dj',
    'meinspamschutz.de','meltmail.com','mezimages.net','mierdamail.com',
    'migumail.com','mintemail.com','moncourrier.fr.nf','monemail.fr.nf',
    'monmail.fr.nf','mt2009.com','mt2014.com','mx0.wwwnew.eu',
    'mxfuel.com','myalias.pw','mycleaninbox.net','mymail-in.net',
    'mypacks.net','mypartyclip.de','myphantomemail.com','mysamp.de',
    'mytempemail.com','mytempmail.com','nabuma.com','neomailbox.com',
    'nepwk.com','nervmich.net','nervtmich.net','netmails.com',
    'netmails.net','netzidiot.de','neverbox.com','nice-4u.com',
    'nincsmail.hu','nnh.com','no-spam.ws','noblepioneer.com',
    'nobulk.com','noclickemail.com','nogmailspam.info','nomail.pw',
    'nomail.xl.cx','nomail2me.com','nomorespamemails.com','nonspam.eu',
    'nonspammer.de','noref.in','nospam.ze.tc','nospamfor.us',
    'nospammail.net','nospamthanks.info','notmailinator.com',
    'nowhere.org','nowmymail.com','objectmail.com','odaymail.com',
    'one-time.email','oneoffemail.com','onewaymail.com','online.ms',
    'onqin.com','oopi.org','ordinaryamerican.net','otherinbox.com',
    'ourklips.com','outlawspam.com','ovpn.to','owlpic.com',
    'pancakemail.com','pjjkp.com','plexolan.de','politikerclub.de',
    'poofy.org','pookmail.com','privacy.net','privatdemail.net',
    'proxymail.eu','prtnx.com','punkass.com','r4nd0m.de',
    'recode.me','recursor.net','regbypass.com','safetymail.info',
    'safetypost.de','sandelf.de','saynotospams.com','schafmail.de',
    'schrott-email.de','secretemail.de','secure-mail.biz',
    'selfdestructingmail.com','sendspamhere.com','sharklasers.com',
    'shieldedmail.com','shieldemail.com','shitmail.de','shitmail.me',
    'shitmail.org','shitware.nl','skeefmail.com','slopsbox.com',
    'slowslow.de','smellfear.com','snakemail.com','sneakemail.com',
    'sneakmail.de','snkmail.com','sofimail.com','sofort-mail.de',
    'sogetthis.com','solopilotos.com','soodonims.com','spam.su',
    'spamavert.com','spambob.com','spambob.net','spambob.org',
    'spambog.com','spambog.de','spambog.ru','spambox.info',
    'spamcannon.com','spamcannon.net','spamcero.com','spamcon.org',
    'spamcorptastic.com','spamcowboy.com','spamcowboy.net',
    'spamcowboy.org','spamday.com','spamex.com','spamfree.eu',
    'spamfree24.de','spamfree24.eu','spamfree24.info','spamfree24.net',
    'spamgoes.in','spamgrid.com','spamhereplease.com','spamhole.com',
    'spamify.com','spaminator.de','spamkill.info','spaml.com',
    'spaml.de','spammy.host','spamoff.de','spamslicer.com',
    'spamstack.net','spamthis.co.uk','spamtrail.com','spamtroll.net',
    'speed.1s.fr','spoofmail.de','stuffmail.de','super-auswahl.de',
    'supergreatmail.com','supermailer.jp','superrito.com',
    'superstachel.de','suremail.info','svk.jp','sweetxxx.de',
    'tafmail.com','tagyourself.com','teleworm.com','teleworm.us',
    'tempalias.com','tempe-mail.com','tempemail.biz','tempemail.org',
    'tempinbox.co.uk','tempmail.eu','tempmail.it','tempmail2.com',
    'tempmaildemo.com','tempmailer.com','tempmailer.de','tempomail.fr',
    'temporaryemail.net','temporaryemail.us','temporaryforwarding.com',
    'temporaryinbox.com','temporarymail.org','tempthe.net',
    'thanksnospam.com','thanksnospam.info','thisisnotmyrealemail.com',
    'throam.com','throwaway.email','tilien.com','tittbit.in',
    'tizi.com','tmailinator.com','toiea.com','tradermail.info',
    'trash-amil.com','trash-mail.at','trash-mail.cf','trash-mail.de',
    'trash-mail.ga','trash-mail.gq','trash-mail.io','trash-mail.ml',
    'trash-mail.tk','trash2009.com','trash2010.com','trash2011.com',
    'trashdevil.com','trashdevil.de','trashemail.de','trashimail.com',
    'trashinbox.com','trashmailer.com','trashme.dk','trashmails.com',
    'trashtipper.com','trbvm.com','trickmail.net','trillianpro.com',
    'trin.ch','tryalert.com','turual.com','twinmail.de','tyldd.com',
    'uggsrock.com','umail.net','upliftnow.com','uplipht.com',
    'uroid.com','us.af','venompen.com','veryrealemail.com',
    'vidchart.com','viditag.com','viewcastmedia.com','viewcastmedia.net',
    'viewcastmedia.org','viralplays.com','vomoto.com','vpn.st',
    'vsimcard.com','vubby.com','walala.org','walkmail.net',
    'watchfull.net','webemail.me','webm4il.info','wegwerf-email.de',
    'wegwerf-email.net','wegwerf-email.org','wegwerfadresse.de',
    'wegwerfmail.info','wh4f.org','whatiaas.com','whatifnot.com',
    'whatsaas.com','whopy.com','wilemail.com',
    'willselfdestruct.com','winemaven.info','wronghead.com',
    'wuzup.net','wuzupmail.net','wwwnew.eu','xagloo.com',
    'xemaps.com','xents.com','xmaily.com','xoxy.net',
    'xsmail.com','xzapmail.com','ya.ru','yapped.net','yeah.net',
    'yep.it','ykool.com','yogamaven.com','yopmail.pp.ua',
    'yourdomain.com','yuurok.com','z1p.biz','za.com',
    'zehnminuten.de','zehnminutenmail.de','zetmail.com','zippymail.info',
    'zoemail.net','zoemail.org','zomg.info','zxcv.com',
    'zxcvbnm.com','zzz.com',
  ]

  const handleEmailSubmit = () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    const emailValue = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      setError('Please enter a valid email address')
      return
    }
    const emailDomain = emailValue.split('@')[1]?.toLowerCase()
    if (!emailDomain) {
      setError('Please enter a valid email address')
      return
    }
    if (BLOCKED_DOMAINS.includes(emailDomain)) {
      setError('Please use your real email address. Temporary emails are not accepted.')
      return
    }
    setSubmitting(true); setError('')
    sessionStorage.setItem('quiz_name', name)
    sessionStorage.setItem('quiz_email', emailValue)
    sessionStorage.setItem('quiz_answers', JSON.stringify(answers))
    window.location.href = '/results'
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
      sessionStorage.setItem('quiz_name', name)
      sessionStorage.setItem('quiz_email', email)
      sessionStorage.setItem('quiz_answers', JSON.stringify(answers))
      window.location.href = '/results'
      return
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
  if (screen === 'start') return <LandingPage onStart={() => setScreen('quiz')} />

  /* ══════════════ QUIZ ══════════════ */
  if (screen === 'quiz') {
    const q = questions[currentQ]
    const hasAnswer = q.type === 'select' ? !!answers[q.id] : q.type === 'scale' ? !!answers[q.id] : true

    return (
      <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
        <style>{CSS}</style>

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

      <div className="email-screen-inner" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px' }}>
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
              {submitting ? 'Building your roadmap…' : 'Get My Roadmap →'}
            </button>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 14 }}>🔒 Your info is private. We never spam.</p>
          </div>
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
