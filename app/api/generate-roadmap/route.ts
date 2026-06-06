import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { answers, name } = await req.json()

    const stageMap: Record<string, string> = {
      'starting': 'The Pioneer',
      'idea': 'The Pioneer',
      'launched': 'The Pathfinder',
      'scaling': 'The Builder',
      'established': 'The Luminary',
    }
    const archetype = stageMap[answers.q1] || 'The Pioneer'

    const energyMap: Record<string, string> = {
      'action': 'Driver — action-oriented, executes fast, needs clear direction',
      'connection': 'Flow Worker — relationship-driven, energised by genuine connection, drained by forced outreach',
      'ideas': 'Deep Thinker — creative and strategic, brilliant in bursts, struggles with consistent execution',
      'meaning': 'Gentle Builder — purpose-driven, needs sustainable pace, overwhelmed by hustle culture',
    }
    const personality = energyMap[answers.q2] || 'Driver — action-oriented, executes fast, needs clear direction'

    const hustleMap: Record<string, string> = {
      'thrives': 'thrives under pressure and loves hard work',
      'burnout': 'has burned out from hustle and will not go back',
      'overwhelm': 'gets overwhelmed by hustle and needs a gentler approach',
      'resent': 'rejects hustle culture entirely and needs a soft strategy',
    }
    const hustleStyle = hustleMap[answers.q10] || 'works at their own pace'

    const outreachMap: Record<string, string> = {
      'consistent': 'can do consistent daily outreach',
      'genuine': 'can only do outreach when it feels genuine and organic',
      'limited': 'has limited outreach capacity and gets overwhelmed by volume',
      'avoids': 'avoids cold outreach entirely and needs inbound strategies',
    }
    const outreachStyle = outreachMap[answers.q4] || 'selective with outreach'

    const visibilityMap: Record<string, string> = {
      'comfortable': 'comfortable with consistent public visibility',
      'inspired': 'shows up powerfully when inspired but goes quiet otherwise',
      'selective': 'selective with visibility — quality over quantity',
      'frightened': 'frightened of public visibility and needs gentle exposure',
    }
    const visibilityStyle = visibilityMap[answers.q5] || 'selective with visibility'

    const workMap: Record<string, string> = {
      'structured': 'works best with structured systems and clear processes',
      'intuitive': 'works intuitively and adapts in motion',
      'sprints': 'works in intense sprints and needs recovery time',
      'sustainable': 'needs slow sustainable building over hustle',
    }
    const workStyle = workMap[answers.q3] || 'works at their own pace'

    const supportMap: Record<string, string> = {
      'strategy': 'needs a clear step-by-step strategy they can execute',
      'accountability': 'needs accountability to stay consistent',
      'permission': 'needs permission and encouragement before they believe they are ready',
      'thinking': 'needs a thinking partner to process decisions',
    }
    const supportStyle = supportMap[answers.q19] || 'needs clear direction'

    const consistencyMap: Record<string, string> = {
      'consistent': 'highly consistent and disciplined',
      'intense': 'inconsistent but brilliant when on — needs to harness their peaks',
      'steady': 'steady and gradual — slow build compounds powerfully',
      'deadlines': 'deadline-driven — needs external accountability structures',
    }
    const consistencyStyle = consistencyMap[answers.q14] || 'works consistently'

    const prompt = `You are The5th AI, an expert business strategist specialising in helping women over 40 monetise their expertise.

${name} just completed a 20-question personality and business quiz. Here is everything you know about them:

ARCHETYPE: ${archetype}
PERSONALITY TYPE: ${personality}
HUSTLE RELATIONSHIP: ${hustleStyle}
OUTREACH CAPACITY: ${outreachStyle}
VISIBILITY COMFORT: ${visibilityStyle}
WORK STYLE: ${workStyle}
SUPPORT NEEDED: ${supportStyle}
CONSISTENCY STYLE: ${consistencyStyle}

BUSINESS DETAILS:
Stage: ${answers.q1}
Niche: ${answers.q6}
Client pain point: ${answers.q7}
Zone of genius: ${answers.q11}
Delivery preference: ${answers.q13}
Pricing confidence: ${answers.q15}
Revenue goal: ${answers.q18}
Decision making: ${answers.q8}
When stuck: ${answers.q16}
Content approach: ${answers.q12}
Transformation story: ${answers.q17}
Final readiness: ${answers.q20}

CRITICAL INSTRUCTION:
This person is a ${personality}.
They ${hustleStyle}.
They ${outreachStyle}.
Do NOT recommend strategies that conflict with their personality type.
If they cannot do high-volume outreach, do NOT suggest 20 DMs a day.
If they get overwhelmed by hustle, do NOT suggest a hustle approach.
If they need sustainable pace, build everything around that.
Match every strategy to who they actually are.

Generate a DETAILED personalised business strategy for ${name}.

Use this EXACT structure with these EXACT section headers:

## YOUR SITUATION RIGHT NOW
3 sentences. Mirror exactly where they are based on their archetype and personality. Make them feel deeply seen. Reference their specific answers.

## YOUR ARCHETYPE STRATEGY
Based on their archetype (${archetype}) AND personality (${personality}), write 2-3 paragraphs explaining exactly why their current approach may not be working and what the personality-matched strategy looks like for them specifically. Be direct and honest. Reference their hustle relationship, outreach capacity, and work style specifically.

## YOUR SIGNATURE OFFER
Based on their zone of genius, niche, delivery preference, and personality:
**Offer Name:** [specific name]
**Tagline:** [one line]
**Format:** [delivery format matching their preference]
**Recommended Price:** [based on their stage and revenue goal]
**Transformation Promise:** FROM [their client pain] TO [specific result]
**Why this works for your personality:** [one sentence connecting offer to their personality type]

## YOUR LEAD MAGNET
**Title:** [specific title]
**Format:** [format that suits their content style and personality]
**Why it works for you:** [connect to their visibility comfort and content approach]

## YOUR DIGITAL PRODUCT
**Title:** [specific title]
**Format:** [format, price $27-97]
**Why it works for you:** [connect to their work style and personality]

## YOUR 7-DAY ACTION PLAN
This is the most important section. Every single task must match their personality type.
If they cannot hustle, give them soft sustainable tasks.
If they are a Driver, give them bold decisive tasks.
If they are a Flow Worker, give them relationship and connection tasks.
If they are a Deep Thinker, give them strategic thinking and quality-over-quantity tasks.
If they are a Gentle Builder, give them one small meaningful task per day maximum.

Format each day exactly like this:

**Day 1 — [Theme]**
Main Task: [specific actionable task]
Content: [one specific content idea with hook/opening line]
Mindset: [one sentence addressing their specific fear or block]
Time needed: [realistic time estimate matching their work style]

**Day 2 — [Theme]**
[same format]

**Day 3 — [Theme]**
[same format]

**Day 4 — [Theme]**
[same format]

**Day 5 — [Theme]**
[same format]

**Day 6 — [Theme]**
[same format]

**Day 7 — [Theme]**
Main Task: [their single most important next step]
Content: [one piece of content to publish]
Reflection: [one question to sit with going into week 2]
Time needed: [realistic estimate]

## YOUR CONTENT STRATEGY
Based on their visibility comfort (${visibilityStyle}) and content approach (${consistencyStyle}), recommend:
**Platform:** [primary platform for their personality]
**Frequency:** [realistic frequency for their work style — do NOT say daily if they cannot sustain it]
**Content pillars:** [3 specific content topics connected to their niche and zone of genius]
**Best performing format for your personality:** [reel, carousel, long post, etc — match to their style]
**One content idea to create this week:** [specific title, hook, and format]

## YOUR PRICING STRATEGY
Based on their revenue goal (${answers.q18}) and pricing relationship (${answers.q15}):
**Recommended starting price:** [specific number]
**How to present it matching your personality:** [soft or direct approach based on their type]
**Handling your specific pricing block:** [direct advice for their specific pricing answer]

## YOUR BIGGEST OPPORTUNITY
One paragraph. The single highest-leverage move available to this specific person right now given their archetype AND their personality. Be brutally honest. This should feel like someone who truly sees them.

RULES:
- Speak directly to ${name} using you and your throughout
- No em dashes anywhere. Use commas and periods only.
- Reference their specific answers throughout
- Every strategy must match their personality type
- If they are not a hustler, never suggest hustle
- If they cannot do high outreach, never suggest high outreach
- Be specific. Generic advice is useless.
- Total length: 1200 words minimum. This should feel like a premium paid report.
- Start directly with the first section. No preamble.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })

    const roadmapText = message.content[0].type === 'text'
      ? message.content[0].text : ''

    return NextResponse.json({
      roadmap: roadmapText,
      archetype,
      personality: answers.q2 || 'action',
    })
  } catch (err) {
    console.error('Roadmap generation error:', err)
    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    )
  }
}
