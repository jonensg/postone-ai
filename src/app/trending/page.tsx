'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'

interface Topic {
  id: string
  topic: string
  angle: string | null
  category: string | null
  reason: string | null
  used: boolean
  created_at: string
}

const CATEGORIES = ['', '護膚美妝', '旅遊', '美食', '理財', '育兒', '職場', '數碼', '時尚']

export default function TrendingPage() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [category, setCategory] = useState('')
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/trending')
    const data = await res.json()
    if (res.ok) setTopics(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function generate() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/trending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '生成失敗')
      setTopics(prev => [...data, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失敗')
    } finally {
      setGenerating(false)
    }
  }

  function useTopic(t: Topic) {
    const brief = `${t.topic}\n\n切入角度：${t.angle || ''}`
    router.push(`/generate?brief=${encodeURIComponent(brief)}`)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>熱門話題推薦</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            AI 幫你諗 5 個小紅書選題，一click 攞去生成貼文
          </p>
        </div>

        <div
          className="rounded-xl p-6 space-y-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div>
            <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>品類（選填）</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button
                  key={c || 'all'}
                  onClick={() => setCategory(c)}
                  className="px-3 py-1.5 rounded text-sm transition-all"
                  style={{
                    background: category === c ? 'var(--gold)' : 'var(--surface-2)',
                    color: category === c ? '#000' : 'var(--text-muted)',
                    border: `1px solid ${category === c ? 'var(--gold)' : 'var(--border)'}`,
                  }}
                >
                  {c || '全部'}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="w-full py-3 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--gold)', color: '#000' }}
          >
            {generating ? '諗緊...' : '🔥 生成 5 個選題'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {loading ? (
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>載入中...</p>
        ) : topics.length === 0 ? (
          <p className="text-center text-sm py-12" style={{ color: 'var(--text-muted)' }}>
            仲未有選題，撳上面個掣生成啦
          </p>
        ) : (
          <div className="space-y-3">
            {topics.map(t => (
              <div
                key={t.id}
                className="rounded-xl p-5 space-y-2"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg" style={{ color: '#fff' }}>{t.topic}</h3>
                  {t.category && (
                    <span className="text-xs px-2 py-1 rounded whitespace-nowrap"
                      style={{ background: 'var(--surface-2)', color: 'var(--gold)' }}
                    >
                      {t.category}
                    </span>
                  )}
                </div>
                {t.angle && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--gold)' }}>切入：</span>{t.angle}
                  </p>
                )}
                {t.reason && (
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--gold)' }}>點解 work：</span>{t.reason}
                  </p>
                )}
                <div className="pt-2">
                  <button
                    onClick={() => useTopic(t)}
                    className="px-4 py-2 rounded text-sm"
                    style={{ background: 'var(--gold)', color: '#000' }}
                  >
                    ✨ 用呢個選題生成貼文
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
