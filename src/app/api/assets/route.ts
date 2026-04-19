import { createClient } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file') as File | null
  const tagsRaw = form.get('tags') as string | null

  if (!file) return NextResponse.json({ error: '請選擇圖片' }, { status: 400 })

  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const bytes = await file.arrayBuffer()

  const { error: upErr } = await supabase.storage
    .from('assets')
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: pub } = supabase.storage.from('assets').getPublicUrl(path)

  const tags = tagsRaw
    ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
    : []

  const { data, error } = await supabase
    .from('assets')
    .insert({
      user_id: user.id,
      name: file.name,
      url: pub.publicUrl,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
      tags,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
