'use client'

import { useEffect, useMemo, useState } from 'react'
import Nav from '@/components/Nav'

interface Post {
  id: string
  title: string | null
  status: string
  platforms: string[] | null
  published_at: string | null
  created_at: string
  metrics: Record<string, number> | null
}

const METRIC_FIELDS: { key: string; label: string }[] = [
  { key: 'views', label: '瀏覽' },
  { key: 'likes', label: '讚' },
  { key: 'comments', label: '留言' },
  { key: 'saves', label: '收藏' },
  { key: 'shares', label: '分享' },
]

export default function AnalyticsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d)) setPosts(d)
        setLoading(false)
      })
  }, [])

  const totals = useMemo(() => {
    const t: Record<string, number> = {}
    for (const p of posts) {
      for (const { key } of METRIC_FIELDS) {
        t[key] = (t[key] || 0) + (p.metrics?.[key] || 0)
      }
    }
    return t
  }, [posts])

  const topPosts = useMemo(() => {
    return [...posts]
      .filter(p => p.metrics && Object.values(p.metrics).some(v => v > 0))
      .sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))
      .slice(0, 5)
  }, [posts])

  function startEdit(p: Post) {
    setEditing(p.id)
    const initial: Record<string, string> = {}
    for (const { key } of METRIC_FIELDS) {
      initial[key] = String(p.metrics?.[key] || '')
    }
    setForm(initial)
  }

  async function saveMetrics(id: string) {
    const metrics: Record<string, number> = {}
    for (const { key } of METRIC_FIELDS) {
      const n = parseInt(form[key] || '0', 10)
      if (!isNaN(n)) metrics[key] = n
    }
    const res = await fetch(`/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metrics }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPosts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      setEditing(null)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>數據分析</h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            每篇 post 發佈後手動回填數據，睇邊啲 topic 最 work
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {METRIC_FIELDS.map(f => (
            <div
              key={f.key}
              className="rounded-xl p-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>總{f.label}</p>
              <p className="text-2xl mt-1" style={{ color: 'var(--gold)', fontFamily: 'var(--font-heading)' }}>
                {(totals[f.key] || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {topPosts.length > 0 && (
          <div>
            <h3 className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>表現最好 Top 5</h3>
            <div className="space-y-2">
              {topPosts.map((p, i) => (
                <div
                  key={p.id}
                  className="rounded-lg p-4 flex items-center justify-between gap-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg" style={{ color: 'var(--gold)' }}>#{i + 1}</span>
                    <p className="text-sm truncate" style={{ color: '#fff' }}>{p.title || '（無標題）'}</p>
                  </div>
                  <div className="flex gap-3 text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                    {METRIC_FIELDS.map(f => (
                      <span key={f.key}>
                        {f.label} <span style={{ color: '#fff' }}>{p.metrics?.[f.key] || 0}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>所有 post（click 回填數據）</h3>
          {loading ? (
            <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>載入中...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-sm py-12" style={{ color: 'var(--text-muted)' }}>仲未有 post</p>
          ) : (
            <div className="space-y-2">
              {posts.map(p => (
                <div
                  key={p.id}
                  className="rounded-lg p-4"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm truncate" style={{ color: '#fff' }}>{p.title || '（無標題）'}</p>
                    <button
                      onClick={() => (editing === p.id ? setEditing(null) : startEdit(p))}
                      className="text-xs px-3 py-1 rounded whitespace-nowrap"
                      style={{ background: 'var(--surface-2)', color: 'var(--gold)', border: '1px solid var(--border)' }}
                    >
                      {editing === p.id ? '取消' : '填數據'}
                    </button>
                  </div>

                  {editing === p.id ? (
                    <div className="mt-3 grid grid-cols-3 md:grid-cols-6 gap-2">
                      {METRIC_FIELDS.map(f => (
                        <input
                          key={f.key}
                          type="number"
                          placeholder={f.label}
                          value={form[f.key] || ''}
                          onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                          className="px-2 py-1 rounded text-sm outline-none"
                          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff' }}
                        />
                      ))}
                      <button
                        onClick={() => saveMetrics(p.id)}
                        className="px-3 py-1 rounded text-sm font-medium"
                        style={{ background: 'var(--gold)', color: '#000' }}
                      >
                        儲存
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {METRIC_FIELDS.map(f => (
                        <span key={f.key}>
                          {f.label} <span style={{ color: '#fff' }}>{p.metrics?.[f.key] || 0}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
