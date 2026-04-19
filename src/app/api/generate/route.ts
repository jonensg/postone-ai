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

  const { brief, tone, imageBase64, imageType, platforms, scheduledAt } = await req.json()

  if (!imageBase64 && !brief?.trim()) {
    return NextResponse.json({ error: '請輸入題目或上傳圖片' }, { status: 400 })
  }

  const userText = imageBase64
    ? `請根據這張產品圖片生成一篇小紅書圖文貼文。語氣：${tone || '輕鬆'}。${brief ? `額外說明：${brief}` : ''}`
    : `題目/Brief：${brief}\n語氣：${tone || '輕鬆'}\n\n請生成一篇小紅書貼文。`

  const userContent = imageBase64
    ? [
        { type: 'image_url' as const, image_url: { url: `data:${imageType || 'image/jpeg'};base64,${imageBase64}` } },
        { type: 'text' as const, text: userText },
      ]
    : userText

  const completion = await qwen.chat.completions.create({
    model: imageBase64 ? 'qwen-vl-plus' : 'qwen-plus',
    ...(imageBase64 ? {} : { response_format: { type: 'json_object' as const } }),
    messages: [
      { role: 'system', content: GENERATE_SYSTEM_PROMPT },
      { role: 'user', content: userContent },
    ],
  })

  const raw = completion.choices[0].message.content || '{}'

  let parsed: { title: string; body: string; hashtags: string[] }
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    parsed = JSON.parse(jsonMatch?.[0] ?? raw)
  } catch {
    return NextResponse.json({ error: '解析 AI 回應失敗' }, { status: 500 })
  }

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      brief: brief || '（以圖生文）',
      tone: tone || '輕鬆',
      title: parsed.title,
      body: parsed.body,
      hashtags: parsed.hashtags,
      platforms: Array.isArray(platforms) ? platforms : [],
      scheduled_at: scheduledAt || null,
      status: scheduledAt ? 'scheduled' : 'draft',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(post)
}
