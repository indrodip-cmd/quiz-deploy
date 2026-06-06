'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence } from 'framer-motion'

/* ─── Data ─── */
const TICKER_ITEMS = [
  'Coaching Business Blueprint',
  '20 Diagnostic Questions',
  'AI-Powered Roadmap',
  'Free in 45 Seconds',
  'Personalised Strategy',
  '2,400+ Women Profiled',
  'No Generic Advice',
  'Built Around YOUR Story',
]

const STEPS = [
  {
    num: '01',
    title: 'Answer 20 questions',
    body: 'Calibrated questions about your expertise, clients, pricing blocks, and goals — designed to surface what most coaches never put into words.',
    icon: '📋',
  },
  {
    num: '02',
    title: 'AI builds your blueprint',
    body: 'Our model — trained on $15M+ of real coaching data — writes a personalised 15-day action plan. Not a template. Not a PDF. Your exact path.',
    icon: '⚡',
  },
  {
    num: '03',
    title: 'Take action today',
    body: 'Day 1 unlocks immediately. Each day gives you specific tasks, scripts, and checkpoints. Built around your time, your niche, your goals.',
    icon: '🎯',
  },
]

const BENEFITS = [
  {
    num: '01',
    title: 'Offer Clarity',
    body: 'Stop guessing what to sell. The quiz maps your zone of genius to a specific offer that your ideal client is already looking for.',
  },
  {
    num: '02',
    title: 'Pricing Confidence',
    body: 'We diagnose your exact pricing block — whether it\'s imposter syndrome, fear of "no," or inability to articulate ROI — and give you the fix.',
  },
  {
    num: '03',
    title: 'Content That Converts',
    body: 'A content system built around your natural format (video, writing, live) so you never sit down and go blank again.',
  },
  {
    num: '04',
    title: 'Sales Framework',
    body: 'A simple, non-pushy sales process that closes — matched to where you are right now, not where some guru says you should be.',
  },
  {
    num: '05',
    title: 'First Client Path',
    body: 'Specific outreach sequences and DM scripts tailored to your niche and audience, so you know exactly who to contact and what to say.',
  },
  {
    num: '06',
    title: 'Revenue Roadmap',
    body: 'A clear number-to-number plan from where you are today to your 6-month goal. No vague "post more content" advice.',
  },
]

const TESTIMONIALS = [
  {
    quote: "I had spent over $10,000 on coaches before this. None of them gave me the clarity Indrodip did in 45 seconds. Six weeks later I closed my first $5K client.",
    name: 'Jeanne T.',
    role: 'Business Coach · Toronto',
    init: 'J',
    bg: '#2d6a4f',
    badge: '+$5K',
  },
  {
    quote: "I was charging $197/month for something worth $3,000. The blueprint diagnosed exactly why I was undercharging and gave me a script to fix it on my next call.",
    name: 'Angela R.',
    role: 'Career Coach · Atlanta',
    init: 'A',
    bg: '#b8920a',
    badge: '15× price',
  },
  {
    quote: "I've been 'about to launch' for 2 years. This quiz broke that paralysis in one afternoon. Day 3 of my roadmap I landed a discovery call. Day 7 I closed it.",
    name: 'Lynne M.',
    role: 'Life Coach · Melbourne',
    init: 'L',
    bg: '#4a5568',
    badge: 'First client',
  },
  {
    quote: "As a 52-year-old thinking I was too old for online business — this quiz literally said 'your decades of experience ARE your advantage.' I cried. Then I built.",
    name: 'Sandra P.',
    role: 'Wellness Coach · London',
    init: 'S',
    bg: '#6b4c8a',
    badge: 'Late starter',
  },
]

const FAQS = [
  {
    q: 'Is this really free?',
    a: "Yes, completely. The quiz, the AI generation, and the Day 1 roadmap are free. There's no credit card, no trial, no catch. We may offer premium support later — that's always your choice.",
  },
  {
    q: "I'm not tech-savvy. Is this complicated?",
    a: 'No technical skills required. The quiz is 20 multiple-choice and short-answer questions. The roadmap appears automatically. Day 1 tasks are written in plain English.',
  },
  {
    q: 'How is this different from other quizzes?',
    a: "Most quizzes put you in one of 4 buckets and send you the same PDF as everyone else. Every roadmap here is generated fresh from your specific answers — your niche, your pricing block, your available hours, your goals.",
  },
  {
    q: "What if I'm just starting out with no clients?",
    a: "That's exactly who this is built for. The quiz has a 'Just starting out' path that begins with finding your first client, not scaling to 6 figures.",
  },
  {
    q: 'How long does it take?',
    a: 'About 5 minutes for the quiz. The AI generates your roadmap in roughly 45 seconds. You can be reading Day 1 tasks within 6 minutes of starting.',
  },
]

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { font-family: 'DM Sans', system-ui, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }

:root {
  --cream: #faf6f0;
  --cream-dark: #f2ede6;
  --ink: #0d0d0b;
  --ink-soft: #1a1a18;
  --forest: #1c4a32;
  --forest-mid: #2a6647;
  --forest-light: #3d8a60;
  --sage: #4a8c64;
  --gold: #b8920a;
  --gold-light: #e8c84a;
  --warm-grey: #7a7670;
  --border: rgba(28,74,50,0.10);
  --border-dark: rgba(28,74,50,0.18);
}

/* ── Nav ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 56px; height: 72px;
  background: rgba(250,246,240,0.90);
  backdrop-filter: blur(20px) saturate(1.4);
  border-bottom: 1px solid var(--border);
}
.nav-logo {
  font-family: 'Playfair Display', serif;
  font-size: 16px; font-weight: 700;
  color: var(--forest); letter-spacing: 0.03em;
  display: flex; align-items: center; gap: 10px;
}
.nav-right { display: flex; align-items: center; gap: 20px; }
.nav-hint { font-size: 13px; color: var(--warm-grey); }
.nav-cta {
  background: var(--forest); color: #fff;
  font-size: 13px; font-weight: 600;
  padding: 10px 22px; border-radius: 100px;
  border: none; cursor: pointer; font-family: inherit;
  letter-spacing: 0.02em;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
}
.nav-cta:hover {
  background: var(--forest-mid);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(28,74,50,0.25);
}

/* ── Hero ── */
.hero {
  min-height: 100vh;
  background: var(--cream);
  padding: 72px 0 0;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
}
.hero-inner {
  max-width: 1260px; margin: 0 auto;
  padding: 80px 56px 60px;
  display: grid; grid-template-columns: 1fr 1fr;
  align-items: center; gap: 80px;
  flex: 1;
}
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--sage); margin-bottom: 28px;
}
.hero-eyebrow-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--gold); flex-shrink: 0;
}
.hero-h1 {
  font-family: 'Playfair Display', serif;
  font-size: clamp(44px, 4.8vw, 72px);
  font-weight: 900; line-height: 1.05;
  color: var(--ink); margin-bottom: 6px;
}
.hero-h1-em {
  font-family: 'Playfair Display', serif;
  font-size: clamp(44px, 4.8vw, 72px);
  font-weight: 900; line-height: 1.05;
  font-style: italic; color: var(--forest);
  display: block; margin-bottom: 28px;
}
.hero-sub {
  font-size: 16px; line-height: 1.8;
  color: var(--warm-grey); max-width: 460px;
  margin-bottom: 40px;
}
.hero-cta {
  display: inline-flex; align-items: center; gap: 14px;
  background: var(--forest); color: #fff;
  font-size: 16px; font-weight: 600;
  padding: 18px 36px; border-radius: 6px;
  border: none; cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 32px rgba(28,74,50,0.28);
  letter-spacing: 0.01em;
  position: relative; overflow: hidden;
  transition: transform 0.25s, box-shadow 0.25s;
}
.hero-cta::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
  background-size: 200% 100%;
  animation: shimmer 3s ease infinite;
}
@keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
.hero-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(28,74,50,0.36); }
.hero-arrow {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; transition: transform 0.2s;
}
.hero-cta:hover .hero-arrow { transform: translateX(4px); }
.hero-trust {
  margin-top: 24px; display: flex;
  align-items: center; gap: 10px; flex-wrap: wrap;
}
.hero-avatars { display: flex; }
.hero-av {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid var(--cream);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-left: -8px;
}
.hero-av:first-child { margin-left: 0; }
.hero-stars { color: var(--gold); font-size: 13px; letter-spacing: 1px; }
.hero-trust-txt { font-size: 12px; color: var(--warm-grey); }

/* ── Hero Right: Dashboard mockup ── */
.dashboard-wrap {
  position: relative;
}
.dashboard-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.04);
  overflow: hidden;
}
.dash-header {
  background: var(--forest); padding: 16px 24px;
  display: flex; align-items: center; justify-content: space-between;
}
.dash-header-left { display: flex; align-items: center; gap: 10px; }
.dash-logo-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.4); }
.dash-logo-txt { font-size: 13px; font-weight: 700; color: #fff; }
.dash-badge {
  background: rgba(255,255,255,0.15); color: rgba(255,255,255,0.9);
  font-size: 11px; font-weight: 600;
  padding: 4px 10px; border-radius: 20px;
}
.dash-body { padding: 20px; }
.dash-progress-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 8px;
}
.dash-progress-label { font-size: 12px; font-weight: 600; color: var(--ink); }
.dash-progress-pct { font-size: 12px; color: var(--warm-grey); }
.dash-progress-track {
  height: 6px; background: #f0f0ee; border-radius: 3px;
  margin-bottom: 20px; overflow: hidden;
}
.dash-progress-fill {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, var(--forest), var(--sage));
  transition: width 1.5s ease;
}
.dash-days { display: flex; flex-direction: column; gap: 8px; }
.dash-day {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: 10px;
  border: 1.5px solid transparent;
}
.dash-day.done { background: #f0faf5; border-color: rgba(45,106,79,0.15); }
.dash-day.active { background: #fefde8; border-color: rgba(184,146,10,0.3); }
.dash-day.locked { background: #fafafa; border-color: #f0f0f0; }
.dash-day-num {
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}
.dash-day.done .dash-day-num { background: var(--forest); color: #fff; }
.dash-day.active .dash-day-num { background: var(--gold); color: #fff; }
.dash-day.locked .dash-day-num { background: #e8e8e8; color: #aaa; }
.dash-day-info { flex: 1; min-width: 0; }
.dash-day-title { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dash-day.locked .dash-day-title { color: #ccc; }
.dash-day-sub { font-size: 11px; color: var(--warm-grey); }
.dash-day.locked .dash-day-sub { color: #ddd; }
.dash-day-status { font-size: 11px; font-weight: 700; flex-shrink: 0; }
.dash-day.done .dash-day-status { color: var(--forest); }
.dash-day.active .dash-day-status { color: var(--gold); }
.dash-day.locked .dash-day-status { color: #ccc; }
.dash-footer {
  padding: 14px 20px; background: var(--cream);
  border-top: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.dash-footer-txt { font-size: 12px; color: var(--warm-grey); }
.dash-footer-btn {
  background: var(--forest); color: #fff;
  font-size: 12px; font-weight: 600;
  padding: 8px 16px; border-radius: 20px;
  border: none; cursor: default;
}

/* ── Floating cards on dashboard ── */
.float-card {
  position: absolute; background: #fff;
  border-radius: 12px; padding: 14px 18px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.10);
  border: 1px solid rgba(0,0,0,0.04);
  white-space: nowrap;
}
.float-card-top {
  top: -24px; right: -24px;
}
.float-card-bottom {
  bottom: -24px; left: -24px;
}
.float-card-label {
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--warm-grey); margin-bottom: 4px;
}
.float-card-value {
  font-family: 'Playfair Display', serif;
  font-size: 26px; font-weight: 900; color: var(--ink);
  line-height: 1;
}
.float-card-sub {
  font-size: 11px; color: var(--warm-grey); margin-top: 2px;
}

/* ── Blob ── */
.hero-blob {
  position: absolute; pointer-events: none;
  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  animation: morph 16s ease-in-out infinite;
  opacity: 0.55;
}
@keyframes morph {
  0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
  25%{border-radius:40% 60% 70% 30%/40% 70% 30% 60%}
  50%{border-radius:30% 70% 40% 60%/50% 40% 60% 50%}
  75%{border-radius:70% 30% 60% 40%/30% 60% 40% 70%}
}

/* ── Ticker ── */
.ticker-wrap {
  background: var(--ink-soft); padding: 14px 0; overflow: hidden;
}
.ticker-inner { display: flex; width: max-content; }
.ticker-item { display: flex; align-items: center; }
.ticker-txt {
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.6);
  padding: 0 28px; letter-spacing: 0.06em; text-transform: uppercase;
  white-space: nowrap;
}
.ticker-dot {
  width: 3px; height: 3px; border-radius: 50%;
  background: rgba(255,255,255,0.2); flex-shrink: 0;
}

/* ── Section base ── */
.section { padding: 110px 56px; }
.section-inner { max-width: 1260px; margin: 0 auto; }
.sect-ey {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--sage); margin-bottom: 16px;
}
.sect-h {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 3.5vw, 54px);
  font-weight: 900; line-height: 1.1;
  color: var(--ink); margin-bottom: 16px;
}
.sect-h em { font-style: italic; color: var(--forest); }
.sect-sub {
  font-size: 15px; color: var(--warm-grey);
  line-height: 1.8; max-width: 540px;
  margin-bottom: 64px;
}

/* ── Steps ── */
.steps-bg { background: var(--cream-dark); }
.steps-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 2px; margin-top: 0;
  background: var(--border-dark);
  border-radius: 16px; overflow: hidden;
}
.step-card {
  background: var(--cream-dark);
  padding: 40px 36px; position: relative;
  transition: background 0.3s;
}
.step-card:hover { background: #fff; }
.step-num {
  font-family: 'Playfair Display', serif;
  font-size: 72px; font-weight: 900;
  color: rgba(0,0,0,0.04); line-height: 1;
  margin-bottom: 20px;
}
.step-icon { font-size: 28px; margin-bottom: 16px; display: block; }
.step-title {
  font-size: 19px; font-weight: 700;
  color: var(--ink); margin-bottom: 12px;
}
.step-body { font-size: 14px; color: var(--warm-grey); line-height: 1.75; }
.step-line {
  position: absolute; top: 50%; right: -1px;
  width: 2px; height: 40%; background: var(--border-dark);
  transform: translateY(-50%);
}

/* ── Benefits ── */
.benefits-bg { background: #fff; }
.benefits-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.benefit-card {
  border: 1px solid var(--border-dark);
  border-radius: 12px; padding: 36px 32px;
  position: relative; overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
  cursor: default;
}
.benefit-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0,0,0,0.06);
  border-color: rgba(28,74,50,0.22);
}
.benefit-card::before {
  content: ''; position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--forest), var(--sage));
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.4s ease;
}
.benefit-card:hover::before { transform: scaleX(1); }
.benefit-num {
  font-family: 'Playfair Display', serif;
  font-size: 56px; font-weight: 900;
  color: rgba(0,0,0,0.04); line-height: 1; margin-bottom: 16px;
}
.benefit-title {
  font-size: 17px; font-weight: 700;
  color: var(--ink); margin-bottom: 10px;
}
.benefit-body { font-size: 14px; color: var(--warm-grey); line-height: 1.75; }

/* ── Testimonials ── */
.testi-bg { background: var(--ink); }
.testi-inner { max-width: 1260px; margin: 0 auto; padding: 110px 56px; }
.testi-h {
  font-family: 'Playfair Display', serif;
  font-size: clamp(36px, 3.2vw, 50px);
  font-weight: 900; color: #fff; line-height: 1.15;
  margin-bottom: 56px; text-align: center;
}
.testi-h em { font-style: italic; color: var(--gold-light); }
.testi-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
.testi-card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px; padding: 32px;
  transition: background 0.3s, transform 0.3s, border-color 0.3s;
}
.testi-card:hover {
  background: rgba(255,255,255,0.07);
  border-color: rgba(255,255,255,0.16);
  transform: translateY(-4px);
}
.testi-stars { color: var(--gold-light); font-size: 14px; letter-spacing: 2px; margin-bottom: 16px; }
.testi-quote {
  font-size: 14px; color: rgba(255,255,255,0.75);
  line-height: 1.8; margin-bottom: 24px; font-style: italic;
}
.testi-author { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.testi-av {
  width: 40px; height: 40px; border-radius: 50%;
  font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  color: #fff; flex-shrink: 0;
}
.testi-name { font-size: 13px; font-weight: 700; color: #fff; }
.testi-role { font-size: 11px; color: rgba(255,255,255,0.45); margin-top: 2px; }
.testi-badge {
  margin-left: auto;
  background: rgba(74,140,100,0.25);
  color: rgba(160,220,160,0.9);
  font-size: 11px; font-weight: 700;
  padding: 4px 10px; border-radius: 20px; flex-shrink: 0;
}

/* ── Stats bar ── */
.stats-bg { background: var(--forest); }
.stats-grid {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 0; border-radius: 0;
  max-width: 1260px; margin: 0 auto;
  padding: 0 56px;
}
.stat-item {
  padding: 56px 0; text-align: center;
  border-right: 1px solid rgba(255,255,255,0.12);
}
.stat-item:last-child { border-right: none; }
.stat-num {
  font-family: 'Playfair Display', serif;
  font-size: clamp(40px, 4vw, 60px);
  font-weight: 900; color: #fff; line-height: 1; margin-bottom: 8px;
}
.stat-num span { color: var(--gold-light); }
.stat-label {
  font-size: 13px; color: rgba(255,255,255,0.6);
  letter-spacing: 0.02em; line-height: 1.5;
}

/* ── FAQ ── */
.faq-bg { background: var(--cream); }
.faq-list { max-width: 720px; margin: 0 auto; }
.faq-item {
  border-bottom: 1px solid var(--border-dark);
  padding: 0;
}
.faq-q {
  width: 100%; padding: 24px 0;
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: none; border: none; cursor: pointer; text-align: left;
  font-size: 16px; font-weight: 600; color: var(--ink); font-family: inherit;
  transition: color 0.2s;
}
.faq-q:hover { color: var(--forest); }
.faq-icon {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--cream-dark); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; transition: background 0.2s, transform 0.3s;
  color: var(--forest);
}
.faq-icon.open { background: var(--forest); color: #fff; transform: rotate(45deg); }
.faq-a {
  overflow: hidden; padding-bottom: 0;
  font-size: 14px; color: var(--warm-grey); line-height: 1.8;
}

/* ── Final CTA ── */
.final-bg {
  background: var(--ink-soft); padding: 130px 56px;
  text-align: center; position: relative; overflow: hidden;
}
.final-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 700px; height: 700px;
  background: radial-gradient(circle, rgba(28,74,50,0.14) 0%, transparent 70%);
  border-radius: 50%; pointer-events: none;
}
.final-inner { position: relative; z-index: 1; max-width: 640px; margin: 0 auto; }
.final-ey {
  font-size: 11px; font-weight: 700;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(184,146,10,0.9); margin-bottom: 24px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.final-ey::before, .final-ey::after {
  content: ''; flex: 1; max-width: 60px;
  height: 1px; background: rgba(184,146,10,0.3);
}
.final-h {
  font-family: 'Playfair Display', serif;
  font-size: clamp(38px, 4.5vw, 60px);
  font-weight: 900; color: #fff; line-height: 1.1;
  margin-bottom: 20px;
}
.final-h em { font-style: italic; color: var(--gold-light); }
.final-sub {
  font-size: 15px; color: rgba(255,255,255,0.5);
  line-height: 1.8; margin-bottom: 48px;
}
.final-cta {
  display: inline-flex; align-items: center; gap: 14px;
  background: #fff; color: var(--ink);
  font-size: 16px; font-weight: 700;
  padding: 20px 44px; border-radius: 6px;
  border: none; cursor: pointer; font-family: inherit;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  transition: transform 0.25s, box-shadow 0.25s;
}
.final-cta:hover { transform: translateY(-3px); box-shadow: 0 18px 48px rgba(0,0,0,0.4); }
.final-cta-note {
  margin-top: 20px; font-size: 12px;
  color: rgba(255,255,255,0.3); letter-spacing: 0.04em;
}

/* ── Footer ── */
.footer { background: #060b06; padding: 60px 56px 40px; }
.footer-logo-txt {
  font-size: clamp(48px, 8vw, 100px);
  font-weight: 900; color: rgba(255,255,255,0.07);
  letter-spacing: -3px; line-height: 1; margin-bottom: 40px;
  user-select: none;
}
.footer-rule { height: 1px; background: rgba(255,255,255,0.08); margin-bottom: 28px; }
.footer-bottom {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 16px;
}
.footer-copy { font-size: 13px; color: rgba(255,255,255,0.25); }
.footer-links { display: flex; gap: 28px; }
.footer-link {
  font-size: 13px; color: rgba(255,255,255,0.25);
  text-decoration: none; transition: color 0.2s;
}
.footer-link:hover { color: rgba(255,255,255,0.6); }

/* ── Grain overlay ── */
.grain {
  position: fixed; inset: -100%; width: 300%; height: 300%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none; z-index: 9997; opacity: 0.3;
  animation: grain-move 8s steps(2) infinite;
}
@keyframes grain-move {
  0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)}
  20%{transform:translate(3%,2%)} 30%{transform:translate(-1%,4%)}
  40%{transform:translate(4%,-1%)} 50%{transform:translate(-3%,3%)}
  60%{transform:translate(2%,-4%)} 70%{transform:translate(-4%,1%)}
  80%{transform:translate(3%,-2%)} 90%{transform:translate(-1%,3%)}
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .nav { padding: 0 32px; }
  .hero-inner { gap: 48px; padding: 64px 32px 48px; }
  .section { padding: 80px 32px; }
  .testi-inner { padding: 80px 32px; }
  .final-bg { padding: 100px 32px; }
  .footer { padding: 48px 32px 32px; }
  .stats-grid { padding: 0 32px; }
  .steps-grid { grid-template-columns: 1fr; }
  .step-line { display: none; }
  .benefits-grid { grid-template-columns: 1fr 1fr; }
  .testi-grid { grid-template-columns: 1fr 1fr; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .nav { padding: 0 20px; height: 60px; }
  .nav-hint { display: none; }
  .hero-inner { grid-template-columns: 1fr !important; padding: 56px 20px 40px; gap: 40px; }
  .dashboard-wrap { display: none; }
  .section { padding: 64px 20px; }
  .testi-inner { padding: 64px 20px; }
  .final-bg { padding: 80px 20px; }
  .footer { padding: 40px 20px 28px; }
  .stats-grid { padding: 0 20px; grid-template-columns: 1fr 1fr; }
  .benefits-grid { grid-template-columns: 1fr; }
  .testi-grid { grid-template-columns: 1fr; }
  .hero-h1 { font-size: 38px; }
  .hero-h1-em { font-size: 38px; }
}
@media (max-width: 480px) {
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .stat-item { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.12); }
  .stat-item:nth-child(odd) { border-right: 1px solid rgba(255,255,255,0.12); }
  .stat-item:last-child, .stat-item:nth-last-child(2):nth-child(odd) { border-bottom: none; }
  .hero-h1 { font-size: 32px; }
  .hero-h1-em { font-size: 32px; }
  .sect-h { font-size: 28px; }
  .testi-h { font-size: 28px; }
  .final-h { font-size: 30px; }
}
`

/* ─── Helpers ─── */
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!active) return
    let frame = 0
    const total = Math.round(duration / 16)
    const id = setInterval(() => {
      frame++
      setVal(Math.min(Math.round((frame / total) * target), target))
      if (frame >= total) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [active, target, duration])
  return val
}

function AnimOnScroll({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.12 })
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.65s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms, transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

/* ─── Dashboard Mockup ─── */
function DashboardMockup() {
  const days = [
    { num: '1', title: 'Clarity & Positioning', sub: '3 tasks · Est. 45 min', status: '✓ Done', type: 'done' },
    { num: '2', title: 'Define Your Signature Offer', sub: '4 tasks · Est. 1hr', status: '✓ Done', type: 'done' },
    { num: '3', title: 'First Outreach', sub: '3 tasks · Est. 30 min', status: '✓ Done', type: 'done' },
    { num: '4', title: 'Build Your Outreach System', sub: '5 tasks · Est. 1hr 15min', status: 'In Progress', type: 'active' },
    { num: '5', title: 'Content Strategy', sub: 'Unlocks tomorrow', status: '🔒', type: 'locked' },
  ]
  const [progress, setProgress] = useState('0%')
  useEffect(() => { setTimeout(() => setProgress('20%'), 600) }, [])

  return (
    <div className="dashboard-wrap">
      {/* Top floating card */}
      <motion.div
        className="float-card float-card-top"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="float-card-label">Offer Clarity Score</div>
        <div className="float-card-value">98<span style={{ fontSize: 16, color: 'var(--warm-grey)' }}>%</span></div>
        <div className="float-card-sub">2,400+ coaches profiled</div>
      </motion.div>

      {/* Main dashboard */}
      <div className="dashboard-card">
        <div className="dash-header">
          <div className="dash-header-left">
            <div className="dash-logo-dot" />
            <div className="dash-logo-txt">The5th · Your Roadmap</div>
          </div>
          <div className="dash-badge">Day 4 of 15</div>
        </div>
        <div className="dash-body">
          <div className="dash-progress-row">
            <div className="dash-progress-label">15-Day Progress</div>
            <div className="dash-progress-pct">20% complete</div>
          </div>
          <div className="dash-progress-track">
            <div className="dash-progress-fill" style={{ width: progress }} />
          </div>
          <div className="dash-days">
            {days.map((d, i) => (
              <div key={i} className={`dash-day ${d.type}`}>
                <div className="dash-day-num">{d.type === 'done' ? '✓' : d.num}</div>
                <div className="dash-day-info">
                  <div className="dash-day-title">{d.title}</div>
                  <div className="dash-day-sub">{d.sub}</div>
                </div>
                <div className="dash-day-status">{d.status}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-footer">
          <div className="dash-footer-txt">Next: Send 3 DMs using your script</div>
          <div className="dash-footer-btn">Continue →</div>
        </div>
      </div>

      {/* Bottom floating card */}
      <motion.div
        className="float-card float-card-bottom"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      >
        <div className="float-card-label">Roadmap generated in</div>
        <div className="float-card-value">45<span style={{ fontSize: 16, color: 'var(--warm-grey)' }}>s</span></div>
        <div className="float-card-sub">AI-powered · Personalised</div>
      </motion.div>
    </div>
  )
}

/* ─── FAQ Item ─── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <AnimOnScroll delay={index * 80} className="faq-item">
      <button className="faq-q" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <span className={`faq-icon ${open ? 'open' : ''}`}>+</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="faq-a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, paddingBottom: 20 }}
            exit={{ height: 0, opacity: 0, paddingBottom: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {a}
          </motion.div>
        )}
      </AnimatePresence>
    </AnimOnScroll>
  )
}

/* ─── Stats counter section ─── */
function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const c2400 = useCountUp(2400, inView)
  const c98 = useCountUp(98, inView)
  const c15 = useCountUp(15, inView)
  const c45 = useCountUp(45, inView)
  return (
    <div className="stats-bg" ref={ref}>
      <div className="stats-grid">
        {[
          { num: c2400.toLocaleString(), suffix: '+', label: 'coaches profiled\nwith their blueprint' },
          { num: c98, suffix: '%', label: 'gain offer clarity\nwithin 24 hours' },
          { num: c15, suffix: '', label: 'action-packed days\nin every roadmap' },
          { num: c45, suffix: 's', label: 'to generate your\npersonalised plan' },
        ].map((s, i) => (
          <div key={i} className="stat-item">
            <div className="stat-num">{s.num}<span>{s.suffix}</span></div>
            <div className="stat-label" style={{ whiteSpace: 'pre-line' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Main Page ─── */
export default function HomePage() {
  const ease = [0.22, 1, 0.36, 1] as const
  const spr = { type: 'spring' as const, stiffness: 260, damping: 24 }

  /* Parallax on hero blob */
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const blobY = useTransform(scrollYProgress, [0, 1], ['0px', '-80px'])

  const handleStart = () => { window.location.href = '/' }

  return (
    <>
      <style>{CSS}</style>
      <div className="grain" aria-hidden />

      {/* ── NAV ── */}
      <motion.nav
        className="nav"
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease }}
      >
        <div className="nav-logo">
          <svg width="24" height="28" viewBox="0 0 32 36" fill="none" aria-hidden>
            <path d="M16 2C16 2 8 10 8 18C8 22.4 11.6 26 16 26C20.4 26 24 22.4 24 18C24 14 21 10 21 10C21 10 20 14 18 16C17 17 16 17 16 17C16 17 18 13 16 2Z" fill="#2d6a4f"/>
            <path d="M12 20C12 20 10 22 10 24C10 27.3 12.7 30 16 30C19.3 30 22 27.3 22 24C22 22 20 20 20 20C20 20 19 22 17 23C16.5 23.3 16 23.3 16 23.3C16 23.3 17 21 12 20Z" fill="#2d6a4f" opacity="0.7"/>
          </svg>
          The5th Consulting
        </div>
        <div className="nav-right">
          <span className="nav-hint">Free · 5 min quiz</span>
          <motion.button
            className="nav-cta"
            onClick={handleStart}
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={spr}
          >
            Take The Quiz
          </motion.button>
        </div>
      </motion.nav>

      {/* ══ HERO ══ */}
      <section className="hero" ref={heroRef}>
        {/* Background blob */}
        <motion.div
          className="hero-blob"
          style={{
            width: 500, height: 500,
            background: 'radial-gradient(circle at 40% 40%, rgba(74,140,100,0.10), transparent 70%)',
            top: -100, right: -100,
            position: 'absolute',
            y: blobY,
          }}
          animate={{ borderRadius: [
            '60% 40% 30% 70% / 60% 30% 70% 40%',
            '40% 60% 70% 30% / 40% 70% 30% 60%',
            '30% 70% 40% 60% / 50% 40% 60% 50%',
            '70% 30% 60% 40% / 30% 60% 40% 70%',
            '60% 40% 30% 70% / 60% 30% 70% 40%',
          ]}}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="hero-inner">
          {/* LEFT: copy */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              className="hero-eyebrow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
            >
              <div className="hero-eyebrow-dot" />
              Free AI Business Blueprint
            </motion.div>

            <motion.h1
              className="hero-h1"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
            >
              If you&apos;re over 40, you already have
            </motion.h1>
            <motion.span
              className="hero-h1-em"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.38, ease }}
            >
              what it takes.
            </motion.span>

            <motion.p
              className="hero-sub"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.5, ease }}
            >
              You&apos;ve spent years building real expertise. That experience is worth
              something — probably more than you think. Answer 20 questions and receive
              a free, personalised 15-day roadmap showing exactly how to turn what you
              know into consistent income.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...spr, delay: 0.65 }}
            >
              <button className="hero-cta" onClick={handleStart}>
                Find My Business Blueprint
                <div className="hero-arrow">→</div>
              </button>

              <div className="hero-trust">
                <div className="hero-avatars">
                  {[
                    { i: 'L', bg: '#d4e8d5' },
                    { i: 'A', bg: '#e8d5b7' },
                    { i: 'J', bg: '#d5d4e8' },
                    { i: 'M', bg: '#e8d5d5' },
                    { i: 'S', bg: '#d5e8e8' },
                  ].map((a, idx) => (
                    <div key={idx} className="hero-av" style={{ background: a.bg, color: '#555', zIndex: 5 - idx }}>
                      {a.i}
                    </div>
                  ))}
                </div>
                <span className="hero-stars">★★★★★</span>
                <span className="hero-trust-txt">2,400+ women already got their blueprint</span>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Dashboard */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, delay: 0.42, ease }}
            style={{ position: 'relative' }}
          >
            <DashboardMockup />
          </motion.div>
        </div>
      </section>

      {/* ══ TICKER ══ */}
      <div className="ticker-wrap" aria-hidden>
        <motion.div
          className="ticker-inner"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          style={{ willChange: 'transform' }}
        >
          {[0, 1].map(pass => (
            <div key={pass} style={{ display: 'flex', alignItems: 'center' }}>
              {TICKER_ITEMS.map((item, i) => (
                <React.Fragment key={`${pass}-${i}`}>
                  <span className="ticker-txt">{item}</span>
                  <div className="ticker-dot" />
                </React.Fragment>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══ STATS ══ */}
      <StatsSection />

      {/* ══ HOW IT WORKS ══ */}
      <section className="section steps-bg">
        <div className="section-inner">
          <AnimOnScroll>
            <div className="sect-ey">How It Works</div>
            <h2 className="sect-h">
              From zero clarity to<br /><em>a plan in minutes.</em>
            </h2>
            <p className="sect-sub">
              No fluff, no filler. Just a process that works — built on thousands
              of real coaching businesses.
            </p>
          </AnimOnScroll>

          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <AnimOnScroll key={i} delay={i * 120}>
                <div className="step-card" style={{ position: 'relative' }}>
                  <div className="step-num">{s.num}</div>
                  <span className="step-icon">{s.icon}</span>
                  <div className="step-title">{s.title}</div>
                  <div className="step-body">{s.body}</div>
                  {i < STEPS.length - 1 && <div className="step-line" />}
                </div>
              </AnimOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BENEFITS ══ */}
      <section className="section benefits-bg">
        <div className="section-inner">
          <AnimOnScroll>
            <div className="sect-ey">What You Get — Completely Free</div>
            <h2 className="sect-h">
              Not a generic quiz.<br /><em>Your actual blueprint.</em>
            </h2>
            <p className="sect-sub">
              Most online quizzes put you in a box and hand you a PDF everyone else got too.
              This is different. Each roadmap is written for you, about you, around what you
              actually told us.
            </p>
          </AnimOnScroll>

          <div className="benefits-grid">
            {BENEFITS.map((b, i) => (
              <AnimOnScroll key={i} delay={i * 80} className="benefit-card">
                <div className="benefit-num">{b.num}</div>
                <div className="benefit-title">{b.title}</div>
                <div className="benefit-body">{b.body}</div>
              </AnimOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="testi-bg">
        <div className="testi-inner">
          <AnimOnScroll>
            <h2 className="testi-h">
              Real women.<br /><em>Real results.</em>
            </h2>
          </AnimOnScroll>

          <div className="testi-grid">
            {TESTIMONIALS.map((t, i) => (
              <AnimOnScroll key={i} delay={i * 100} className="testi-card">
                <div className="testi-stars">★★★★★</div>
                <p className="testi-quote">&ldquo;{t.quote}&rdquo;</p>
                <div className="testi-author">
                  <div className="testi-av" style={{ background: t.bg }}>{t.init}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                  <div className="testi-badge">{t.badge}</div>
                </div>
              </AnimOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section className="section faq-bg">
        <div className="section-inner" style={{ maxWidth: 1260 }}>
          <AnimOnScroll style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="sect-ey" style={{ textAlign: 'center' }}>FAQ</div>
            <h2 className="sect-h" style={{ textAlign: 'center' }}>
              Common <em>questions</em>
            </h2>
          </AnimOnScroll>

          <div className="faq-list">
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="final-bg">
        <div className="final-glow" aria-hidden />
        <div className="final-inner">
          <AnimOnScroll>
            <div className="final-ey">Start Now — It Is Free</div>
            <h2 className="final-h">
              You already have<br /><em>what it takes.</em>
            </h2>
            <p className="final-sub">
              20 questions. 45 seconds to generate. A plan built entirely around your
              experience, your goals, and where you actually are right now.
            </p>
            <motion.button
              className="final-cta"
              onClick={handleStart}
              whileHover={{ scale: 1.02, y: -3 }}
              whileTap={{ scale: 0.97 }}
              transition={spr}
            >
              Get My Free Blueprint
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(28,74,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>→</div>
            </motion.button>
            <p className="final-cta-note">No credit card · No email wall · 100% free</p>
          </AnimOnScroll>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-logo-txt" aria-hidden>THE5TH CONSULTING</div>
        <div className="footer-rule" />
        <div className="footer-bottom">
          <span className="footer-copy">© 2026 The5th Consulting. All rights reserved.</span>
          <div className="footer-links">
            {['Privacy Policy', 'Data Usage', 'Contact'].map(l => (
              <a key={l} href="#" className="footer-link">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
