import OpenAI from 'openai'
import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'
import { JONES_PERSONA } from '@/lib/persona'

const qwen = new OpenAI({
  apiKey: process.env.QWEN_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
})

const SYSTEM_PROMPT = `${JONES_PERSONA}

你係 Jones 嘅內容策略 AI，幫香港品牌揀小紅書選題。

任務：根據指定嘅品類/行業，畀 5 個有潛力嘅小紅書選題。

每個選題要有：
- topic：標題 (12-20字，小紅書風格)
- angle：切入角度（1句話講清楚呢條 post 嘅獨特視角）
- category：分類（例：護膚、旅遊、美食、理財、育兒、職場...）
- reason：點解呢個選題 work（根據小紅書用戶行為 / 當下趨勢）

必須 return 純 JSON array，唔好 markdown：
[
  {"topic":"...","angle":"...","category":"...","reason":"..."},
  ...
]`

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('trending_topics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { category } = await req.json()
  const userPrompt = category
    ? `品類：${category}。畀我 5 個小紅書選題建議。`
    : `畀我 5 個近期香港品牌啱做嘅小紅書選題建議，涵蓋唔同品類。`

  const completion = await qwen.chat.completions.create({
    model: 'qwen-plus',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
  })

  const raw = completion.choices[0].message.content || '[]'
  let topics: { topic: string; angle: string; category: string; reason: string }[]
  try {
    const match = raw.match(/\[[\s\S]*\]/)
    topics = JSON.parse(match?.[0] ?? raw)
  } catch {
    return NextResponse.json({ error: '解析 AI 回應失敗' }, { status: 500 })
  }

  const rows = topics.map(t => ({
    user_id: user.id,
    topic: t.topic,
    angle: t.angle,
    category: t.category,
    reason: t.reason,
  }))

  const { data, error } = await supabase.from('trending_topics').insert(rows).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
