import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const getResend = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not configured')
  return new Resend(key)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, roadmap, stage, goal, hours, videoSlug } = body

    if (!name || !email || !roadmap) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const videoUrl = `https://quiz.the5th.consulting/video/${videoSlug || 'v1'}`

    // Build HTML email with roadmap content
    const roadmapHtml = roadmap
      .split('\n')
      .map((line: string) => {
        const trimmed = line.trim()
        if (!trimmed) return '<br/>'
        if (trimmed.startsWith('## ')) {
          return `<h2 style="color:#1d5c3a;font-size:16px;margin-top:24px;margin-bottom:8px;font-family:sans-serif;">${trimmed.replace('## ', '')}</h2>`
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return `<p style="font-weight:bold;margin:4px 0;font-family:sans-serif;">${trimmed.replace(/\*\*/g, '')}</p>`
        }
        if (trimmed.includes('**')) {
          const formatted = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          return `<p style="margin:4px 0;font-family:sans-serif;">${formatted}</p>`
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return `<li style="margin:4px 0;font-family:sans-serif;color:#3d3d3d;">${trimmed.slice(2)}</li>`
        }
        return `<p style="margin:6px 0;font-family:sans-serif;color:#3d3d3d;line-height:1.6;">${trimmed}</p>`
      })
      .join('\n')

    const firstName = name.split(' ')[0]

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f6f4;font-family:sans-serif;">

  <!-- Header -->
  <div style="background:#060a07;padding:24px 40px;">
    <div style="max-width:640px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="color:#ffffff;font-weight:700;font-size:14px;letter-spacing:2px;">THE5TH CONSULTING</div>
        <div style="color:#4a9a6a;font-size:11px;margin-top:2px;">quiz.the5th.consulting</div>
      </div>
      <div style="color:#3a9a64;font-size:11px;font-weight:700;letter-spacing:1px;">PERSONALISED BLUEPRINT</div>
    </div>
  </div>

  <!-- Hero -->
  <div style="background:#ffffff;padding:40px 40px 32px;">
    <div style="max-width:640px;margin:0 auto;">
      <div style="color:#1d5c3a;font-size:11px;font-weight:700;letter-spacing:2px;margin-bottom:12px;">YOUR PERSONALISED BLUEPRINT</div>
      <h1 style="margin:0 0 4px;font-size:28px;font-weight:700;color:#0a0a0a;line-height:1.2;">${firstName}, here is your</h1>
      <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:#1d5c3a;font-style:italic;line-height:1.2;">personalised blueprint.</h1>
      <p style="color:#6b6b6b;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Based on your 20 quiz answers, The5th AI has mapped exactly where you are and what needs to happen next. Your full report is below.
      </p>
      <!-- Stat pills -->
      <table style="border-collapse:collapse;width:100%;background:#f6f6f4;">
        <tr>
          <td style="padding:12px 16px;border-top:2px solid #1d5c3a;">
            <div style="font-size:10px;font-weight:700;color:#6b6b6b;letter-spacing:1px;margin-bottom:4px;">STAGE</div>
            <div style="font-size:13px;font-weight:700;color:#0a0a0a;">${stage || 'Launched'}</div>
          </td>
          <td style="padding:12px 16px;border-top:2px solid #1d5c3a;border-left:1px solid #e0e0e0;">
            <div style="font-size:10px;font-weight:700;color:#6b6b6b;letter-spacing:1px;margin-bottom:4px;">6-MONTH GOAL</div>
            <div style="font-size:13px;font-weight:700;color:#0a0a0a;">${goal || '$5K-$10K / month'}</div>
          </td>
          <td style="padding:12px 16px;border-top:2px solid #9a7a1a;border-left:1px solid #e0e0e0;">
            <div style="font-size:10px;font-weight:700;color:#6b6b6b;letter-spacing:1px;margin-bottom:4px;">HOURS / WEEK</div>
            <div style="font-size:13px;font-weight:700;color:#0a0a0a;">${hours || '10-20'} hrs</div>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Divider -->
  <div style="height:1px;background:#e0e0e0;max-width:640px;margin:0 auto;"></div>

  <!-- Roadmap Content -->
  <div style="background:#ffffff;padding:32px 40px;">
    <div style="max-width:640px;margin:0 auto;">
      ${roadmapHtml}
    </div>
  </div>

  <!-- Video CTA -->
  <div style="background:#060a07;padding:40px;margin-top:0;">
    <div style="max-width:640px;margin:0 auto;text-align:center;">
      <div style="color:#3a9a64;font-size:10px;font-weight:700;letter-spacing:2px;margin-bottom:12px;">ONE MORE THING</div>
      <h2 style="color:#ffffff;font-size:22px;margin:0 0 12px;">Your personalised video is ready.</h2>
      <p style="color:#8ab49a;font-size:13px;line-height:1.6;margin:0 0 24px;">
        We created a short video based on exactly where you are, because you deserve more than a generic answer.
      </p>
      <a href="${videoUrl}" style="display:inline-block;background:#1d5c3a;color:#ffffff;text-decoration:none;padding:14px 32px;font-weight:700;font-size:14px;border-radius:4px;">
        Watch My Video
      </a>
      <div style="margin-top:32px;padding-top:20px;border-top:1px solid #1a2a1e;">
        <p style="color:#4a6a54;font-size:11px;margin:0;">
          The5th Consulting  |  support@10kroadmap.org  |  quiz.the5th.consulting
        </p>
      </div>
    </div>
  </div>

</body>
</html>`

    // Send via Resend
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: 'Indrodip at The5th <Indrodip@10kroadmap.org>',
      to: email,
      subject: `${firstName}, your personalised blueprint is ready`,
      html: emailHtml,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, emailId: data?.id })

  } catch (err) {
    console.error('PDF route error:', err)
    return NextResponse.json({ error: 'Failed to send blueprint' }, { status: 500 })
  }
}
