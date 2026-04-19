'use client'

import { useEffect, useMemo, useState } from 'react'
import Nav from '@/components/Nav'

interface Post {
  id: string
  title: string | null
  body: string | null
  status: string
  platforms: string[] | null
  scheduled_at: string | null
  published_at: string | null
  created_at: string
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1)
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280',
  ready: '#A8842A',
  scheduled: '#3b82f6',
  published: '#22c55e',
}

export default function CalendarPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()))
  const [selected, setSelected] = useState<Post | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(d => Array.isArray(d) && setPosts(d))
  }, [])

  const days = useMemo(() => {
    const first = startOfMonth(cursor)
    const startWeekday = first.getDay()
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate()
    const cells: (Date | null)[] = []
    for (let i = 0; i < startWeekday; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d))
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [cursor])

  function postsOn(date: Date) {
    return posts.filter(p => {
      const ref = p.scheduled_at || p.published_at || p.created_at
      return ref && sameDay(new Date(ref), date)
    })
  }

  async function updateSchedule() {
    if (!selected) return
    const iso = scheduleDate ? new Date(scheduleDate).toISOString() : null
    const res = await fetch(`/api/posts/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduled_at: iso,
        status: iso ? 'scheduled' : selected.status,
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPosts(prev => prev.map(p => (p.id === updated.id ? updated : p)))
      setSelected(null)
      setScheduleDate('')
    }
  }

  const monthLabel = cursor.toLocaleDateString('zh-HK', { year: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>內容日曆</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              排程發佈、追蹤草稿進度
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCursor(addMonths(cursor, -1))}
              className="px-3 py-1 rounded text-sm"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff' }}
            >
              ←
            </button>
            <span className="text-sm px-2" style={{ color: '#fff' }}>{monthLabel}</span>
            <button
              onClick={() => setCursor(addMonths(cursor, 1))}
              className="px-3 py-1 rounded text-sm"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff' }}
            >
              →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px" style={{ background: 'var(--border)' }}>
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="px-2 py-2 text-xs text-center" style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}>
              {d}
            </div>
          ))}
          {days.map((d, i) => {
            const items = d ? postsOn(d) : []
            const today = d && sameDay(d, new Date())
            return (
              <div
                key={i}
                className="min-h-24 p-1.5 text-xs"
                style={{ background: 'var(--surface)', opacity: d ? 1 : 0.3 }}
              >
                {d && (
                  <>
                    <div className="mb-1" style={{ color: today ? 'var(--gold)' : 'var(--text-muted)' }}>
                      {d.getDate()}
                    </div>
                    <div className="space-y-1">
                      {items.slice(0, 3).map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelected(p)
                            setScheduleDate(p.scheduled_at ? p.scheduled_at.slice(0, 16) : '')
                          }}
                          className="block w-full text-left px-1.5 py-0.5 rounded truncate"
                          style={{ background: STATUS_COLORS[p.status] || '#6b7280', color: '#fff', fontSize: '10px' }}
                        >
                          {p.title || '（無標題）'}
                        </button>
                      ))}
                      {items.length > 3 && (
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>+{items.length - 3}</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          {Object.entries(STATUS_COLORS).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded" style={{ background: v }} />
              {k}
            </span>
          ))}
        </div>

        {selected && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setSelected(null)}
          >
            <div
              className="rounded-xl p-6 max-w-lg w-full space-y-4"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg" style={{ color: '#fff' }}>{selected.title || '（無標題）'}</h3>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>
                {selected.body?.slice(0, 200)}{selected.body && selected.body.length > 200 ? '...' : ''}
              </p>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>排程發佈時間</label>
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded text-sm outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff' }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={updateSchedule}
                  className="flex-1 py-2 rounded text-sm font-medium"
                  style={{ background: 'var(--gold)', color: '#000' }}
                >
                  儲存排程
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded text-sm"
                  style={{ background: 'var(--surface-2)', color: '#fff' }}
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
