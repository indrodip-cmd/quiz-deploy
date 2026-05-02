import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/lib/supabase'
import { otpEmail, email1, email2, email3, email4, email5, email6, email7 } from '@/lib/email-templates'

function getAnthropicClient() { return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! }) }
function getResendClient() { return new Resend(process.env.RESEND_API_KEY || 'placeholder') }

const FROM = 'Indrodip | The5th <noreply@10kroadmap.org>'

export async function POST(req: NextRequest) {
  try {
    const { email, name, answers } = await req.json()
    if (!email || !name) return NextResponse.json({ error: 'Email and name are required' }, { status: 400 })

    const firstName = name.split(' ')[0]

    // 1. Upsert lead
    const { data: lead, error: leadErr } = await getSupabaseAdmin()
      .from('quiz_leads')
      .upsert({ email, name, answers }, { onConflict: 'email', ignoreDuplicates: false })
      .select()
      .single()
    if (leadErr) return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })

    // 2. Generate AI roadmap
    let roadmap = null
    try {
      const profile = JSON.stringify(answers, null, 2)
      const msg = await getAnthropicClient().messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: 'You are an expert business coach. Generate a personalized 15-day roadmap for someone wanting to make their first $5,000 online from their expertise. Profile: ' + profile + '. Return ONLY valid JSON, no markdown.',
        messages: [{
          role: 'user',
          content: 'Generate a 15-day roadmap as JSON with this exact structure: {"days":[{"day":1,"title":"string","theme":"string","tasks":["task1","task2","task3"],"win_condition":"string","motivation":"string"}],"summary":"string","biggest_opportunity":"string","first_action":"string"}'
        }]
      })
      const raw = msg.content[0].type === 'text' ? msg.content[0].text : ''
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      if (jsonMatch) roadmap = JSON.parse(jsonMatch[0])
    } catch (e) {
      console.error('Roadmap generation failed', e)
      roadmap = { days: [], summary: 'Your personalized roadmap is being built.', biggest_opportunity: 'Leverage your expertise into a premium offer.', first_action: 'Define your ideal client and their #1 problem.' }
    }

    // 3. Save roadmap
    await getSupabaseAdmin().from('quiz_leads').update({ roadmap }).eq('email', email)

    // 4. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    await getSupabaseAdmin().from('roadmap_sessions').insert({ email, otp, expires_at: expiresAt })

    // 5. Send OTP email
    const days3 = (roadmap?.days || []).slice(0, 3)
    await getResendClient().emails.send({
      from: FROM,
      to: email,
      subject: 'Your 6-digit code to unlock your roadmap',
      html: otpEmail(firstName, otp, days3)
    })

    // 6. Trigger email sequence (fire-and-forget)
    triggerEmailSequence(email, firstName, roadmap, lead?.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('send-otp error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function triggerEmailSequence(email: string, firstName: string, roadmap: Record<string, unknown> | null, leadId: string) {
  const days = (roadmap as { days?: { day: number; title: string; tasks: string[] }[] })?.days || []
  const summary = (roadmap as { summary?: string })?.summary || 'Your roadmap is ready to unlock your path to $5K/month.'

  // Email 1 — immediate
  try {
    await getResendClient().emails.send({
      from: FROM, to: email,
      subject: '🗺️ Your Personal 15-Day Roadmap is inside',
      html: email1(firstName, summary, days)
    })
  } catch (e) { console.error('Email 1 failed', e) }

  // Emails 2-7 via scheduled sends (using setTimeout chains — server-side fire-and-forget)
  const delays = [172800000, 96 * 3600000, 144 * 3600000, 192 * 3600000, 240 * 3600000, 288 * 3600000]
  const subjects = [
    'The offer mistake that keeps experts broke',
    "Where your next 3 clients are hiding right now",
    '"Tell me more" — what to say next',
    "You're closer than you think",
    'The pricing conversation that changes everything',
    "Your 15 days are almost up — here's what's next"
  ]
  const templates = [email2, email3, email4, email5, email6, email7]

  delays.forEach((delay, i) => {
    setTimeout(async () => {
      try {
        await getResendClient().emails.send({
          from: FROM, to: email,
          subject: subjects[i],
          html: templates[i](firstName)
        })
      } catch (e) { console.error(`Email ${i + 2} failed`, e) }
    }, delay)
  })

  void leadId // suppress unused warning
}
