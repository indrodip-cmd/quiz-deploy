import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { answers, name } = await req.json()

    const prompt = `You are The5th AI, a business coach specializing in helping women over 40 monetize their expertise.

A woman named ${name} just completed a 20-question quiz. Here are her answers:

Business Stage: ${answers.q1}
Ideal Client Niche: ${answers.q2}
Client Age Range: ${answers.q3}
Client Pain Point: ${answers.q4}
Zone of Genius: ${answers.q5}
Transformation Story: ${answers.q6}
Client Transformation (FROM/TO): ${answers.q7}
Delivery Format: ${answers.q8}
Program Length: ${answers.q9}
Pricing Confidence (1-5): ${answers.q10}
Pricing Blocker: ${answers.q11}
Content Consistency: ${answers.q12}
Content Formats: ${answers.q13}
Content Block: ${answers.q14}
Sales Relationship: ${answers.q15}
Biggest Fear: ${answers.q16}
Support Needed: ${answers.q17}
Revenue Goal (6 months): ${answers.q18}
Hours Per Week: ${answers.q19}
Urgency (1-5): ${answers.q20}

Write a personalised roadmap for ${name} in exactly 300 words.
Speak directly to her using "you" and "your".
Reference her specific answers - her niche, her pain point, her zone of genius.
Structure it as 3 clear sections:
1. Where You Are Right Now (60 words)
2. Your Biggest Opportunity (120 words)
3. Your Next 3 Steps (120 words)

Use warm, direct, human language. No jargon. No bullet points. Write in flowing paragraphs.
Do not use em dashes or long dashes. Use commas and periods only.
This should feel like a trusted friend who truly sees her potential.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    })

    const roadmapText = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ roadmap: roadmapText })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate roadmap' }, { status: 500 })
  }
}
