import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const getResend = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not configured')
  return new Resend(key)
}

const buildRoadmapHtml = (roadmap: string): string => {
  const lines = roadmap.split('\n')
  let html = ''
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      if (inList) { html += '</ul>'; inList = false }
      html += '<div style="height:8px"></div>'
      continue
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false }
      const title = trimmed.replace('## ', '')
      html += `
        <div style="margin-top:28px;margin-bottom:10px;padding-top:20px;
          border-top:2px solid #eaf4ee;">
          <div style="font-size:10px;font-weight:700;letter-spacing:2px;
            color:#1d5c3a;text-transform:uppercase;margin-bottom:6px;
            font-family:sans-serif;">
            ${title}
          </div>
        </div>`
      continue
    }
    if (trimmed.startsWith('# ')) continue
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul style="margin:8px 0;padding-left:0;list-style:none;">'; inList = true }
      const item = trimmed.slice(2).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      html += `<li style="padding:4px 0 4px 16px;position:relative;
        font-size:13px;color:#3d3d3d;line-height:1.65;font-family:sans-serif;
        border-left:2px solid #1d5c3a;margin-bottom:4px;">
        ${item}</li>`
      continue
    }
    if (inList) { html += '</ul>'; inList = false }
    const formatted = trimmed
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#0a0a0a;">$1</strong>')
    html += `<p style="margin:6px 0;font-size:13px;color:#3d3d3d;
      line-height:1.75;font-family:sans-serif;">${formatted}</p>`
  }
  if (inList) html += '</ul>'
  return html
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, roadmap, stage, goal, hours, videoSlug } = body

    if (!name || !email || !roadmap) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const firstName = name.split(' ')[0]
    const videoUrl = `https://quiz.the5th.consulting/video/${videoSlug || 'v1'}`

    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${firstName}, your personalised blueprint is ready</title>
</head>
<body style="margin:0;padding:0;background:#f6f4f0;font-family:sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f0;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- HEADER -->
  <tr><td style="background:#060a07;padding:24px 40px;border-radius:12px 12px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#ffffff;font-weight:700;font-size:13px;
          letter-spacing:2px;font-family:sans-serif;">
          THE5TH CONSULTING
        </td>
        <td align="right" style="color:#3a9a64;font-size:10px;
          font-weight:700;letter-spacing:1px;font-family:sans-serif;">
          PERSONALISED BLUEPRINT
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding-top:4px;color:#4a7a5a;
          font-size:11px;font-family:sans-serif;">
          quiz.the5th.consulting
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- HERO -->
  <tr><td style="background:#ffffff;padding:40px 40px 32px;
    border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
    <div style="font-size:10px;font-weight:700;letter-spacing:2px;
      color:#1d5c3a;text-transform:uppercase;margin-bottom:12px;
      font-family:sans-serif;">
      YOUR PERSONALISED BLUEPRINT
    </div>
    <div style="font-size:28px;font-weight:700;color:#0a0a0a;
      line-height:1.2;margin-bottom:4px;font-family:Georgia,serif;">
      ${firstName}, here is your
    </div>
    <div style="font-size:28px;font-weight:700;color:#1d5c3a;
      font-style:italic;line-height:1.2;margin-bottom:20px;
      font-family:Georgia,serif;">
      personalised blueprint.
    </div>
    <p style="font-size:14px;color:#6b6b6b;line-height:1.65;
      margin:0 0 28px;font-family:sans-serif;">
      Based on your 20 quiz answers, The5th AI has mapped exactly
      where you are and what needs to happen next.
      Your full personalised report is below.
    </p>
    <!-- Stat pills -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f6f4f0;border-top:2px solid #1d5c3a;">
      <tr>
        <td style="padding:12px 16px;border-right:1px solid #e0e0e0;">
          <div style="font-size:9px;font-weight:700;color:#888;
            letter-spacing:1px;text-transform:uppercase;
            margin-bottom:4px;font-family:sans-serif;">STAGE</div>
          <div style="font-size:13px;font-weight:700;color:#0a0a0a;
            font-family:sans-serif;">${stage || 'Launched'}</div>
        </td>
        <td style="padding:12px 16px;border-right:1px solid #e0e0e0;">
          <div style="font-size:9px;font-weight:700;color:#888;
            letter-spacing:1px;text-transform:uppercase;
            margin-bottom:4px;font-family:sans-serif;">6-MONTH GOAL</div>
          <div style="font-size:13px;font-weight:700;color:#0a0a0a;
            font-family:sans-serif;">${goal || '$5K-$10K / month'}</div>
        </td>
        <td style="padding:12px 16px;">
          <div style="font-size:9px;font-weight:700;color:#888;
            letter-spacing:1px;text-transform:uppercase;
            margin-bottom:4px;font-family:sans-serif;">HOURS / WEEK</div>
          <div style="font-size:13px;font-weight:700;color:#9a7a1a;
            font-family:sans-serif;">${hours || '10-20'} hrs</div>
        </td>
      </tr>
    </table>
  </td></tr>

  <!-- DIVIDER -->
  <tr><td style="height:1px;background:#e0e0e0;
    border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
  </td></tr>

  <!-- ROADMAP CONTENT -->
  <tr><td style="background:#ffffff;padding:32px 40px;
    border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
    ${buildRoadmapHtml(roadmap)}
  </td></tr>

  <!-- VIDEO CTA -->
  <tr><td style="background:#060a07;padding:48px 40px;
    border-top:2px solid #1d5c3a;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <div style="font-size:9px;font-weight:700;letter-spacing:2px;
          color:#3a9a64;text-transform:uppercase;margin-bottom:12px;
          font-family:sans-serif;">ONE MORE THING</div>
        <div style="font-size:22px;font-weight:700;color:#ffffff;
          margin-bottom:12px;font-family:Georgia,serif;">
          Your personalised video is ready.
        </div>
        <p style="font-size:13px;color:#8ab49a;line-height:1.65;
          margin:0 0 28px;font-family:sans-serif;">
          We created a short video based on exactly where you are,
          because you deserve more than a generic answer.
        </p>
        <a href="${videoUrl}"
          style="display:inline-block;background:#1d5c3a;color:#ffffff;
          text-decoration:none;padding:14px 36px;font-weight:700;
          font-size:14px;border-radius:4px;font-family:sans-serif;
          letter-spacing:0.5px;">
          Watch My Video &#8594;
        </a>
        <div style="margin-top:32px;padding-top:20px;
          border-top:1px solid #1a2a1e;">
          <p style="color:#4a6a54;font-size:11px;margin:0;
            font-family:sans-serif;text-align:center;">
            The5th Consulting &nbsp;|&nbsp; support@10kroadmap.org
            &nbsp;|&nbsp; quiz.the5th.consulting
          </p>
        </div>
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

    // Send via Resend
    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: 'Indrodip at The5th <Indrodip@10kroadmap.org>',
      to: email,
      subject: `Your personalised blueprint is ready, ${firstName}`,
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
