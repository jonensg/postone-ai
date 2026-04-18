import OpenAI from 'openai'
import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { GENERATE_SYSTEM_PROMPT } from '@/lib/persona'

const qwen = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { brief, tone } = await req.json()

  if (!brief?.trim()) {
    return NextResponse.json({ error: 'Brief is required' }, { status: 400 })
  }

  const completion = await qwen.chat.completions.create({
    model: 'qwen-plus',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: GENERATE_SYSTEM_PROMPT },
      { role: 'user', content: `題目/Brief：${brief}\n語氣：${tone || '輕鬆'}\n\n請生成一篇小紅書貼文。` },
    ],
  })

  let parsed: { title: string; body: string; hashtags: string[] }
  try {
    parsed = JSON.parse(completion.choices[0].message.content || '{}')
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      brief,
      tone: tone || '輕鬆',
      title: parsed.title,
      body: parsed.body,
      hashtags: parsed.hashtags,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(post)
}
