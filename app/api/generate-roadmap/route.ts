import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { answers, name } = await req.json()

    const stageContext = {
      starting: 'just starting with no clients yet',
      idea: 'has an idea but has not launched yet',
      launched: 'has launched and has some clients but income is inconsistent',
      scaling: 'is established with consistent clients and wants to scale'
    }

    const stage = answers.q1 || 'starting'
    const stageDesc = stageContext[stage as keyof typeof stageContext] || stageContext.starting

    const prompt = `You are The5th AI, an expert business strategist specializing in helping women over 40 monetize their expertise.

A person named ${name} just completed a 20-question business quiz. Here are their answers:

Business Stage: ${stage} (${stageDesc})
Ideal Client Niche: ${answers.q2}
Client Age Range: ${answers.q3}
Client Pain Point: ${answers.q4}
Zone of Genius: ${answers.q5}
Transformation Story Strength: ${answers.q6}
Client Transformation FROM/TO: ${answers.q7}
Preferred Delivery Format: ${answers.q8}
Ideal Program Length: ${answers.q9}
Pricing Confidence (1-5): ${answers.q10}
Pricing Blocker: ${answers.q11}
Content Consistency: ${answers.q12}
Content Formats: ${answers.q13}
Content Creation Block: ${answers.q14}
Sales Relationship: ${answers.q15}
Biggest Fear: ${answers.q16}
Support Needed Most: ${answers.q17}
Revenue Goal (6 months): ${answers.q18}
Hours Per Week Available: ${answers.q19}
Urgency (1-5): ${answers.q20}

Generate a DETAILED, SPECIFIC, PERSONALISED business roadmap for ${name}.

This must be based entirely on their specific answers above. Do not give generic advice.

Structure the roadmap with these exact sections:

## YOUR SITUATION RIGHT NOW
2-3 sentences that mirror exactly where they are based on their answers. Reference their specific niche, stage, and biggest blocker. Make them feel deeply understood.

## YOUR SIGNATURE OFFER
Based on their zone of genius, niche, delivery preference, and program length preference, define:
- A specific offer name and tagline
- What it includes (format, duration, what they deliver)
- Recommended price point based on their stage and revenue goal
- The exact transformation promise (FROM their client pain TO the result)

## YOUR LEAD MAGNET IDEA
One specific free lead magnet idea that attracts their ideal client. Include the exact title, format (PDF, video, quiz, challenge), and what it teaches. Make it directly connected to their niche and zone of genius.

## YOUR DIGITAL PRODUCT IDEA
One low-ticket digital product ($27-$97) they can create from their existing knowledge. Include exact title, format, what it contains, and why it works for their audience.

## 7-DAY CONTENT PLAN
Day by day content plan for the next 7 days. For each day provide:
- Platform (Facebook or Instagram based on their preferred formats)
- Post type (story, post, reel, video)
- Exact topic and angle
- First line hook they can use
Make this specific to their niche and transformation story.

## YOUR 30-DAY ACTION PLAN
Week by week breakdown:
Week 1: Foundation (3 specific actions)
Week 2: Visibility (3 specific actions)
Week 3: Outreach (3 specific actions)
Week 4: Conversion (3 specific actions)
Each action must be specific and executable, not generic advice.

## YOUR PRICING STRATEGY
Based on their revenue goal of ${answers.q18} and pricing confidence of ${answers.q10}/5:
- Recommended starting price
- How to present it on a sales call
- One sentence to handle their specific pricing blocker: ${answers.q11}

## YOUR BIGGEST OPPORTUNITY RIGHT NOW
One paragraph. The single most important insight about where the real leverage is for this person specifically. Be direct and honest. Reference their specific answers.

Rules:
- Speak directly to ${name} using "you" and "your"
- No em dashes anywhere. Use commas and periods only.
- No bullet points for the situation and opportunity sections. Flowing paragraphs only.
- Use bullet points only inside the structured sections (offer, content plan, action plan)
- Be specific. Reference their exact niche, their exact pain point, their exact zone of genius.
- If they are at scaling stage give advanced strategies. If starting give foundational steps.
- Total length: 800 to 1000 words minimum. This should feel like a premium paid report.
- Do not add any preamble or closing remarks. Start directly with the first section.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })

    const roadmapText = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ roadmap: roadmapText })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 })
  }
}
