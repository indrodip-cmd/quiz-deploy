import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, quiz_answers, video_assigned, video_requested, no_video } = body

    const { data, error } = await supabase
      .from('leads')
      .upsert({
        name,
        email,
        quiz_answers,
        video_assigned,
        video_requested: video_requested || false,
        no_video: no_video || false,
        created_at: new Date().toISOString()
      }, { onConflict: 'email' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, lead: data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
