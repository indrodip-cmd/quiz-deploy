import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const getResend = () => {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY not configured')
  return new Resend(key)
}

const CAL_LINK = 'https://cal.com/indrodip-ghosh-ut1vxh/60min'

// ═══════════════════════════════════════════════════
// EMAIL BUILDER HELPERS
// ═══════════════════════════════════════════════════
function ctaButton(text: string, url: string): string {
  return `<div style="text-align:center;margin:28px 0;">
    <a href="${url}" style="display:inline-block;background:#1d5c3a;color:#ffffff;
      text-decoration:none;padding:14px 36px;font-weight:700;font-size:14px;
      border-radius:4px;font-family:sans-serif;letter-spacing:0.5px;">
      ${text} &#8594;
    </a>
  </div>`
}

function ctaSecondary(text: string, url: string): string {
  return `<div style="text-align:center;margin:12px 0 28px;">
    <a href="${url}" style="display:inline-block;color:#1d5c3a;
      text-decoration:underline;font-size:13px;font-family:sans-serif;">
      ${text}
    </a>
  </div>`
}

function buildEmail(name: string, content: string): string {
  const firstName = name.split(' ')[0]
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f6f4f0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f4f0;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <tr><td style="background:#060a07;padding:20px 40px;border-radius:12px 12px 0 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#ffffff;font-weight:700;font-size:12px;
          letter-spacing:2px;font-family:sans-serif;">
          THE5TH CONSULTING
        </td>
        <td align="right" style="color:#3a9a64;font-size:10px;
          font-weight:700;letter-spacing:1px;font-family:sans-serif;">
          AI COACHING SERIES
        </td>
      </tr>
    </table>
  </td></tr>

  <tr><td style="background:#ffffff;padding:40px 40px 32px;
    border-left:1px solid #e8e8e8;border-right:1px solid #e8e8e8;">
    <p style="font-size:14px;color:#888;font-family:sans-serif;
      margin:0 0 24px;">Hey ${firstName},</p>
    <div style="font-size:15px;color:#2d2d2d;line-height:1.85;">
      ${content}
    </div>
    <p style="margin:32px 0 0;font-size:14px;color:#3d3d3d;font-family:sans-serif;">
      Indrodip<br>
      <span style="color:#888;font-size:12px;">The5th Consulting</span>
    </p>
  </td></tr>

  <tr><td style="background:#f6f4f0;padding:20px 40px;
    border:1px solid #e8e8e8;border-top:none;border-radius:0 0 12px 12px;">
    <p style="margin:0;font-size:11px;color:#aaa;font-family:sans-serif;text-align:center;">
      The5th Consulting &nbsp;|&nbsp; support@10kroadmap.org
      &nbsp;|&nbsp; quiz.the5th.consulting
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ═══════════════════════════════════════════════════
// SEQUENCE A — Skipped video (7 days)
// ═══════════════════════════════════════════════════
const sequenceA: Record<number, { subject: string; html: (name: string, videoUrl: string) => string }> = {
  0: {
    subject: 'your AI coach just activated — read this first',
    html: (name, videoUrl) => buildEmail(name, `
      <p>Something I want to be upfront about before anything else — this is not a typical email sequence. You are not going to get seven days of tips and then a sales pitch on day eight.</p>
      <p>What you are getting is real coaching. Daily. Built entirely from your quiz answers.</p>
      <p>We activated our premium AI coaching model for you this morning. It has read everything you told us — your stage, your niche, your zone of genius, your fears, your goals. Every email for the next seven days is written specifically for where you are, not for someone at a different stage with different challenges.</p>
      <p><strong>Here is how to get the most out of this:</strong></p>
      <p><strong>Save this email thread.</strong> Open it every morning before you check social media or anything else. Treat it like your daily coaching session.</p>
      <p><strong>Do the task.</strong> Each email has one task. One. Not a list. Do it that day, even if imperfectly.</p>
      <p><strong>Reply if you are stuck.</strong> Seriously. Indrodip reads replies personally. If something is unclear or you are running into a wall, reply and tell him. He will respond.</p>
      <p><strong>A few things that will slow you down:</strong></p>
      <p>Waiting until you feel ready. You will not feel ready. Do the task anyway.</p>
      <p>Trying to do everything perfectly before moving to the next step. Done is better than perfect at this stage.</p>
      <p>Comparing your day one to someone else's day three hundred.</p>
      <p><strong>Tomorrow your first real coaching session starts.</strong></p>
      <p>Until then, one small thing: write down in one sentence what you want to be true six months from now. Not a goal. A statement. Present tense. "I am earning X per month doing Y for Z." Keep it somewhere you will see it.</p>
      <p>That is your north star for the next seven days.</p>
      <p>Also — your personalised video is ready and waiting for you. We built it specifically around where you are right now. Worth watching before tomorrow.</p>
      ${ctaButton('Watch Your Personalised Video', videoUrl)}
      <p>If you want to shortcut the process and get to clarity faster, Indrodip has a small number of strategy calls available each week.</p>
      ${ctaSecondary('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  1: {
    subject: 'Day 1 — the one thing most coaches get completely wrong',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>Day one. Let's get into it.</p>
      <p>The most common mistake I see — and I have seen it hundreds of times — is coaches trying to build an audience before they have an offer. They spend months on content, on growing followers, on showing up consistently. And then they wonder why no one is buying.</p>
      <p>Here is the uncomfortable truth. You do not need an audience to get your first client. You need an offer and five conversations. That is it.</p>
      <p>Your quiz answers told me something important. You know who you help and you know what you do. What is probably missing is a clear, specific, articulate version of your offer that you can say out loud in one sentence without stumbling.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>The One Sentence Offer</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Complete this sentence and write it down:</p>
        <p style="margin:12px 0;color:#0a0a0a;font-style:italic;background:#fff;padding:12px 16px;border-radius:6px;">"I help [specific person] who [specific problem] to [specific result] in [timeframe] through [your method]."</p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Do not make it beautiful. Do not overthink the words. Just make it specific. Vague offers do not sell. Specific offers do.</p>
      </div>
      <p><strong>Win condition for today:</strong> You have a written one-sentence offer you could say to someone at a dinner party without sounding like a brochure.</p>
      <p>Reply to this email with your offer if you want Indrodip's eyes on it. He reads every reply.</p>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  2: {
    subject: 'Day 2 — your price is probably wrong (here is how to fix it)',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>How did yesterday go? Did you write your one sentence?</p>
      <p>If not, do it before you read the rest of this. The work compounds. Skipping day one and jumping to day two is like skipping the foundation and starting on the walls.</p>
      <p>Today we are talking about pricing. I know. Everyone has feelings about this.</p>
      <p>Here is what I want you to understand before we get into the numbers. Undercharging is not humility. It is a business problem. When you charge too little you attract clients who question your value, you burn out trying to compensate with volume, and you train yourself to believe your work is not worth much.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>Your Real Number</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Answer these three questions honestly:</p>
        <p style="margin:8px 0;color:#3d3d3d;"><strong>1.</strong> What result do you create for a client? Write it in concrete terms.</p>
        <p style="margin:8px 0;color:#3d3d3d;"><strong>2.</strong> What is that result worth to your ideal client?</p>
        <p style="margin:8px 0;color:#3d3d3d;"><strong>3.</strong> What is 10% of that number?</p>
        <p style="margin:12px 0 0;color:#3d3d3d;">That 10% figure is usually close to what you should be charging. Most coaches I work with discover they are charging between 3% and 5% of the value they create. Sometimes less.</p>
      </div>
      <p><strong>Win condition for today:</strong> You have a number on paper that reflects the actual value of what you do, not what you think people will pay.</p>
      <p>Reply with your numbers if you want Indrodip's take on them.</p>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  3: {
    subject: 'Day 3 — where your first client is actually hiding',
    html: (name, videoUrl) => buildEmail(name, `
      <p>Two days in. You have an offer and you have a real price. Today we find the person.</p>
      <p>Most coaches think their first client will come from content. From posting consistently, building an audience, getting discovered. Maybe eventually. Not at the start.</p>
      <p>Your first client is almost certainly someone who already knows you.</p>
      <p>I know that feels uncomfortable. It should. It means there is no hiding behind a strategy. No waiting for the algorithm to do the work. It means reaching out to a real person and having a real conversation.</p>
      <p>Here is the thing though — you are not reaching out to sell them anything. You are reaching out to learn something.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>The Warm Five</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Write a list of five people in your life who match your ideal client description. Then send each of them a message today:</p>
        <p style="margin:12px 0;color:#0a0a0a;font-style:italic;background:#fff;padding:12px 16px;border-radius:6px;">"Hey [Name], I'm working on something and I'd love your honest input. I'm helping [type of person] with [problem]. Does that resonate with anyone you know? Even a 10-minute call would be incredibly helpful."</p>
        <p style="margin:8px 0 0;color:#3d3d3d;">You are asking for help, not making a sale. Most people will say yes to that.</p>
      </div>
      <p><strong>Win condition for today:</strong> Five messages sent. Not drafted. Sent.</p>
      <p>Also — your personalised video is still waiting. It is short and it is specific to where you are. Worth five minutes today.</p>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  4: {
    subject: 'Day 4 — the content that actually builds trust',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>Halfway through. How are the tasks landing?</p>
      <p>Today is about content. Not the exhausting kind where you post every day and wonder if anyone cares. The kind that compounds. The kind that means six months from now people who have never heard of you are finding you and already trusting you before you have ever spoken.</p>
      <p>There is one type of content that does this better than anything else. Your story.</p>
      <p>Not a curated highlight reel. Your actual story. The before and after. What you knew, what you did not know, what you tried, what failed, what finally worked.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>Your Transformation Paragraph</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Write one paragraph. 150 words maximum. The before and after of your own journey.</p>
        <p style="margin:8px 0;color:#3d3d3d;">Start with where you were. Be specific. Not "I was stuck and unfulfilled." More like "Three years ago I was charging $50 an hour for work that was changing people's lives, and I could not figure out why I still felt like a fraud."</p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Then the turning point. Then where you are now. If it does not make you slightly uncomfortable it is probably not honest enough.</p>
      </div>
      <p><strong>Win condition for today:</strong> A 150-word origin story written in your own voice, honest enough to make you slightly nervous to share it.</p>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  5: {
    subject: 'Day 5 — the sales conversation that does not feel like selling',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>Day five. If you have been doing the tasks, you now have an offer, a price, five conversations started, and an origin story. That is more than most coaches have after six months.</p>
      <p>Today we talk about the conversation that converts.</p>
      <p>I want to remove the word "sales" for a minute because I think it creates a mental block. Instead think of it as a diagnostic conversation. You are a doctor. Your ideal client is a patient. They are describing symptoms. Your job is to understand the problem deeply enough to know whether you can help and how.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>The Diagnostic Framework</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Memorise these four questions and use them this week:</p>
        <p style="margin:8px 0;color:#3d3d3d;"><strong>1.</strong> What is the biggest challenge you are facing right now? (Let them talk. Do not interrupt.)</p>
        <p style="margin:8px 0;color:#3d3d3d;"><strong>2.</strong> How long has this been going on?</p>
        <p style="margin:8px 0;color:#3d3d3d;"><strong>3.</strong> What have you already tried?</p>
        <p style="margin:8px 0;color:#3d3d3d;"><strong>4.</strong> What would it mean for you if this was solved in the next 90 days?</p>
        <p style="margin:12px 0 0;color:#3d3d3d;">After those four questions you will know whether you can help, what to offer, and how to frame the investment.</p>
      </div>
      <p><strong>Win condition for today:</strong> You have used these four questions in at least one real conversation.</p>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  6: {
    subject: 'Day 6 — the thing that is actually stopping you',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>We are near the end of the week. I want to be honest with you about something today instead of giving you another task.</p>
      <p>Most people reading this email have done some of the tasks. Maybe all of them, maybe two or three. And there is probably a part of them that feels like the thing holding them back is external. Not enough time. Not enough followers. Not quite the right offer yet. Not ready.</p>
      <p>I have worked with enough coaches to know that is rarely the real answer.</p>
      <p>The real answer is usually one of two things. Either you do not fully believe yet that you are worth the investment you are asking others to make. Or you are afraid that if you go all in and it does not work, you will not have the excuse of not having tried properly.</p>
      <p>Both of those are understandable. Neither of them is permanent.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>The Honest Audit</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Write answers to these two questions. Do not overthink them.</p>
        <p style="margin:8px 0;color:#3d3d3d;">What is the real thing stopping me right now?</p>
        <p style="margin:8px 0 0;color:#3d3d3d;">What would I do tomorrow if I knew it was going to work?</p>
        <p style="margin:8px 0 0;color:#3d3d3d;">That second answer is usually your next step.</p>
      </div>
      <p><strong>Win condition for today:</strong> Two honest sentences. One for each question.</p>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  7: {
    subject: 'Day 7 — what happens now',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>Seven days. We made it.</p>
      <p>I hope this week gave you something real. Not just information — there is too much information everywhere already — but actual movement. An offer that is clearer. A price that is honest. Conversations that started. A story that is yours.</p>
      <p>That is a foundation. It is not everything. But it is more than most people build in months.</p>
      <p>Here is what I want to leave you with.</p>
      <p>The gap between where you are and where you want to be is not as wide as it probably feels. I say that having looked at your quiz answers, knowing your situation, knowing what you know. You are closer than you think.</p>
      <p>What usually closes that gap is not more learning. It is one honest conversation with someone who can see your blind spots and tell you exactly what to do next.</p>
      <p>That is what Indrodip does. Not in a generic way. In the specific, direct, this-is-your-exact-situation way that actually moves things forward.</p>
      <p>The strategy call is free. It is 60 minutes. It is real.</p>
      ${ctaButton('Book Your Free Strategy Call with Indrodip', CAL_LINK)}
      <p style="color:#888;font-size:13px;margin-top:24px;">Either way — thank you for being here this week. Go do the work.</p>
    `)
  },
}

// ═══════════════════════════════════════════════════
// SEQUENCE B — Watched video, not booked (7 days)
// ═══════════════════════════════════════════════════
const sequenceB: Record<number, { subject: string; html: (name: string, videoUrl: string) => string }> = {
  0: {
    subject: 'your AI coach just activated — read this first',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>Something I want to be upfront about before anything else — this is not a typical email sequence. You are not going to get seven days of tips and then a sales pitch on day eight.</p>
      <p>What you are getting is real coaching. Daily. Built entirely from your quiz answers.</p>
      <p>We activated our premium AI coaching model for you this morning. It has read everything you told us — your stage, your niche, your zone of genius, your fears, your goals. Every email for the next seven days is written specifically for where you are.</p>
      <p>You already watched your personalised video. That tells me something about you — you are someone who follows through. That matters more than you might think.</p>
      <p><strong>Here is how to get the most out of this week:</strong></p>
      <p><strong>Save this email thread.</strong> Open it every morning before you check social media. Treat it like your daily coaching session.</p>
      <p><strong>Do the task.</strong> Each email has one task. One. Do it that day, even if imperfectly.</p>
      <p><strong>Reply if you are stuck.</strong> Indrodip reads replies personally. If something is unclear or you are running into a wall, reply and tell him.</p>
      <p>Until then, one small thing: write down in one sentence what you want to be true six months from now. Present tense. "I am earning X per month doing Y for Z."</p>
      <p>That is your north star for the next seven days.</p>
      <p>If you want to skip ahead and talk directly, Indrodip has strategy calls available this week. One conversation often does what seven weeks of solo work cannot.</p>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  1: {
    subject: 'Day 1 — you watched it. here is what that means.',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>You watched your video. I noticed.</p>
      <p>That matters more than you might think. Most people do not. They get the email, they mean to watch it, and it disappears into the noise of their day. You actually sat down and watched it.</p>
      <p>So I am curious — what came up for you?</p>
      <p>Sometimes people watch and feel energised. Sometimes they feel overwhelmed. Sometimes they feel a strange mix of "yes that is exactly right" and "but I do not know if I can actually do this."</p>
      <p>All of that is normal. All of that is worth paying attention to.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>The One Sentence Offer</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Complete this sentence and write it down:</p>
        <p style="margin:12px 0;color:#0a0a0a;font-style:italic;background:#fff;padding:12px 16px;border-radius:6px;">"I help [specific person] who [specific problem] to [specific result] in [timeframe] through [your method]."</p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Do not make it beautiful. Make it specific. Vague offers do not sell. Specific offers do.</p>
      </div>
      <p><strong>Win condition for today:</strong> A written one-sentence offer you could say to someone at a dinner party without sounding like a brochure.</p>
      <p>Reply with your offer if you want Indrodip's eyes on it.</p>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  2: {
    subject: 'Day 2 — what actually happens in 60 minutes with Indrodip',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>I think sometimes people do not book calls because they do not really know what they are signing up for. And fair enough. Most free strategy calls are thinly veiled sales pitches and everyone knows it.</p>
      <p>So let me tell you exactly what happens in 60 minutes with Indrodip.</p>
      <p><strong>First 15 minutes:</strong> he looks at your quiz answers, asks a few clarifying questions, gets a real picture of where you are. Not the polished version you would give a stranger. The actual version.</p>
      <p><strong>Middle 30 minutes:</strong> he diagnoses. Where is the real bottleneck? Is it the offer? The messaging? The pricing? The sales conversation? Almost always it is one specific thing, and almost always it is not what people expect.</p>
      <p><strong>Last 15 minutes:</strong> he prescribes. What should you actually do first. Not a list of 40 things. One or two concrete actions that will move the needle.</p>
      <p>That is it. You leave with something real. Whether you work with him afterwards or not.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>Your Real Number</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">What result do you create for a client? Write it in concrete terms. What is that result worth to your ideal client? What is 10% of that number? That 10% is usually close to what you should be charging.</p>
      </div>
      ${ctaButton('Book Your Free Strategy Call', CAL_LINK)}
    `)
  },
  3: {
    subject: 'Day 3 — she almost did not book either',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>Angela had been sitting on her strategy call invite for almost two weeks.</p>
      <p>She had watched her video. She had read her roadmap. She knew what she needed to do. She just could not quite make herself book the call.</p>
      <p>She told me later that she was scared it would be another thing that got her excited and then did not work out. She had spent $25,000 on coaches at that point. Her trust in the whole industry was basically gone.</p>
      <p>On a Tuesday afternoon she booked it anyway. Not because she felt ready. Because she was tired of waiting to feel ready.</p>
      <p>Two months later she closed her first $2,500 sale. She emailed Indrodip to tell him. She said she was shaking when she hit send on the invoice.</p>
      <p>I am not telling you this to pressure you. I am telling you because that pattern — knowing what to do and still not doing it — is one of the most human things there is. And sometimes hearing that someone else was exactly where you are makes it easier to take the step.</p>
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0;color:#0a0a0a;"><strong>The Warm Five</strong></p>
        <p style="margin:8px 0 0;color:#3d3d3d;">Write a list of five people who match your ideal client. Send each of them a genuine message today — not a pitch, just asking for input or a conversation. Five messages sent. Not drafted. Sent.</p>
      </div>
      ${ctaButton('Book a Free Strategy Call', CAL_LINK)}
    `)
  },
  4: {
    subject: 'Day 4 — the content that actually builds trust',
    html: (name, videoUrl) => sequenceA[4].html(name, videoUrl)
  },
  5: {
    subject: 'Day 5 — the sales conversation that does not feel like selling',
    html: (name, videoUrl) => sequenceA[5].html(name, videoUrl)
  },
  6: {
    subject: 'Day 6 — what you already know but keep postponing',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>You watched your video. You have been doing the work this week. You know what the next step is.</p>
      <p>I am not going to pretend otherwise.</p>
      <p>The honest truth is that at this stage the information is not the bottleneck. You have a roadmap. You have been getting daily coaching. You have clarity you did not have a week ago.</p>
      <p>What moves things forward now is a real conversation. Not more preparation. Not more learning. A conversation with someone who can look at your specific situation and tell you exactly what to do next.</p>
      <p>That is what the strategy call is. It is free. It is 60 minutes. It is real.</p>
      <p>Indrodip has a small number of calls available each week. He takes on a limited number of clients so he can go deep with each one. If you are going to book, sooner is better than later.</p>
      ${ctaButton('Book Your Free Strategy Call', CAL_LINK)}
      <div style="background:#eaf4ee;border-left:3px solid #1d5c3a;padding:20px 24px;margin:24px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0 0 8px;font-weight:700;color:#1d5c3a;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Today's Task</p>
        <p style="margin:0 0 8px;color:#0a0a0a;"><strong>The Honest Audit</strong></p>
        <p style="margin:0;color:#3d3d3d;">What is the real thing stopping me from booking the call? Write it down. Then ask yourself — is that reason real or is it a delay tactic?</p>
      </div>
    `)
  },
  7: {
    subject: 'Day 7 — closing your file after today',
    html: (name, _videoUrl) => buildEmail(name, `
      <p>This is my last email to you. I do not believe in endlessly pinging people who have not responded. That is not respectful of your time or mine.</p>
      <p>But I did want to say one thing before I go.</p>
      <p>You took that quiz for a reason. You answered 20 questions about your business, your fears, your goals. You watched your personalised video. You did a week of real coaching work. That is not nothing. That is someone who wants something different.</p>
      <p>I hope you find it. Whether it is with us or somewhere else entirely.</p>
      <p>If you change your mind, the strategy call is always there. Indrodip takes on a small number of clients at a time and the call is always free.</p>
      ${ctaButton('Book a Strategy Call', CAL_LINK)}
      <p style="color:#888;font-size:13px;margin-top:24px;">Wishing you well.</p>
    `)
  },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, day, sequence, video_slug } = body

    if (!email || !name || day === undefined || !sequence) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const videoUrl = `https://quiz.the5th.consulting/video/${video_slug || 'v1'}`
    const sequences = sequence === 'A' ? sequenceA : sequenceB
    const emailData = sequences[day as keyof typeof sequences]

    if (!emailData) {
      return NextResponse.json({ error: `No email for day ${day} sequence ${sequence}` }, { status: 404 })
    }

    const resend = getResend()
    const { data, error } = await resend.emails.send({
      from: 'Indrodip at The5th <Indrodip@10kroadmap.org>',
      to: email,
      subject: emailData.subject,
      html: emailData.html(name, videoUrl),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, email_id: data?.id, day, sequence })
  } catch (err) {
    console.error('Sequence email error:', err)
    return NextResponse.json({ error: 'Failed to send sequence email' }, { status: 500 })
  }
}
