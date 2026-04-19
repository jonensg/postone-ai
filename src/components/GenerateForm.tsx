'use client'

import { useRef, useState } from 'react'

type Tone = '輕鬆' | '專業' | '推廣'

interface Props {
  onResult: (post: GeneratedPost) => void
  onLoading: (v: boolean) => void
  loading: boolean
}

export interface GeneratedPost {
  id: string
  brief: string
  title: string
  body: string
  hashtags: string[]
  tone: string
}

const TONES: Tone[] = ['輕鬆', '專業', '推廣']

export default function GenerateForm({ onResult, onLoading, loading }: Props) {
  const [brief, setBrief] = useState('')
  const [tone, setTone] = useState<Tone>('輕鬆')
  const [error, setError] = useState('')
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageType, setImageType] = useState<string>('image/jpeg')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageType(file.type)
    const reader = new FileReader()
    reader.onload = ev => {
      const result = ev.target?.result as string
      setImagePreview(result)
      setImageBase64(result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImageBase64(null)
    setImagePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageBase64 && !brief.trim()) return
    setError('')
    onLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, tone, imageBase64, imageType }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '生成失敗')
      onResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '出現錯誤，請再試')
    } finally {
      onLoading(false)
    }
  }

  const canSubmit = !loading && (!!imageBase64 || brief.trim().length > 0)

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* 圖片上傳 */}
      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          產品圖片 <span style={{ color: 'var(--border)' }}>（選填 — 上傳後 AI 自動分析圖片生成文案）</span>
        </label>

        {imagePreview ? (
          <div className="relative w-full rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <img src={imagePreview} alt="preview" className="w-full max-h-56 object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 px-2 py-1 rounded text-xs"
              style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
            >
              ✕ 移除
            </button>
          </div>
        ) : (
          <label
            className="flex flex-col items-center justify-center w-full py-6 rounded-lg cursor-pointer transition-colors"
            style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}
          >
            <span className="text-2xl mb-1">🖼️</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>點擊上傳圖片</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* 題目 */}
      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          {imageBase64 ? '額外說明（選填）' : '題目 / Brief'}
        </label>
        <textarea
          value={brief}
          onChange={e => setBrief(e.target.value)}
          placeholder={imageBase64 ? '例：強調舒適感、適合送禮...' : '例：推介香港品牌用小紅書做行銷的5個原因'}
          rows={3}
          required={!imageBase64}
          className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-colors"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff' }}
        />
      </div>

      {/* 語氣 */}
      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>語氣</label>
        <div className="flex gap-2">
          {TONES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTone(t)}
              className="px-4 py-2 rounded-lg text-sm transition-all"
              style={{
                background: tone === t ? 'var(--gold)' : 'var(--surface-2)',
                color: tone === t ? '#000' : 'var(--text-muted)',
                border: `1px solid ${tone === t ? 'var(--gold)' : 'var(--border)'}`,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
        style={{ background: 'var(--gold)', color: '#000' }}
      >
        {loading ? '生成中...' : imageBase64 ? '🖼️ 以圖生文' : '✨ 生成貼文'}
      </button>
    </form>
  )
}
