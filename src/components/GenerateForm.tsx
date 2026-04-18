'use client'

import { useState } from 'react'

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!brief.trim()) return
    setError('')
    onLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, tone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      onResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      onLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          題目 / Brief
        </label>
        <textarea
          value={brief}
          onChange={e => setBrief(e.target.value)}
          placeholder="例：推介香港品牌用小紅書做行銷的5個原因"
          rows={4}
          required
          className="w-full px-4 py-3 rounded-lg text-sm outline-none resize-none transition-colors"
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            color: '#fff',
          }}
        />
      </div>

      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          語氣
        </label>
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
        disabled={loading || !brief.trim()}
        className="w-full py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
        style={{ background: 'var(--gold)', color: '#000' }}
      >
        {loading ? '生成中...' : '✨ 生成貼文'}
      </button>
    </form>
  )
}
