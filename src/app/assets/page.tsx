'use client'

import { useEffect, useRef, useState } from 'react'
import Nav from '@/components/Nav'

interface Asset {
  id: string
  name: string
  url: string
  tags: string[]
  mime_type: string | null
  size_bytes: number | null
  created_at: string
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [tags, setTags] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/assets')
    const data = await res.json()
    if (res.ok) setAssets(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('tags', tags)

    try {
      const res = await fetch('/api/assets', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || '上傳失敗')
      setAssets(prev => [data, ...prev])
      setTags('')
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : '上傳失敗')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('刪除呢張圖？')) return
    const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' })
    if (res.ok) setAssets(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            素材庫
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            上傳產品圖片、場景圖，之後生成貼文時可以直接抽用
          </p>
        </div>

        <div
          className="rounded-xl p-6 space-y-3"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <input
            type="text"
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tag（選填，用逗號分隔，例：護膚,秋冬,送禮）"
            className="w-full px-4 py-2 rounded-lg text-sm outline-none"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff' }}
          />
          <label
            className="flex flex-col items-center justify-center w-full py-6 rounded-lg cursor-pointer"
            style={{ background: 'var(--surface-2)', border: '1px dashed var(--border)' }}
          >
            <span className="text-2xl mb-1">📤</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {uploading ? '上傳中...' : '點擊上傳圖片'}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {loading ? (
          <p className="text-center text-sm" style={{ color: 'var(--text-muted)' }}>載入中...</p>
        ) : assets.length === 0 ? (
          <p className="text-center text-sm py-12" style={{ color: 'var(--text-muted)' }}>
            仲未有素材，上傳第一張圖啦
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assets.map(a => (
              <div
                key={a.id}
                className="rounded-lg overflow-hidden group relative"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <img src={a.url} alt={a.name} className="w-full h-40 object-cover" />
                <div className="p-3 space-y-1">
                  <p className="text-xs truncate" style={{ color: '#fff' }}>{a.name}</p>
                  {a.tags?.length > 0 && (
                    <p className="text-xs" style={{ color: 'var(--gold)' }}>
                      {a.tags.map(t => `#${t}`).join(' ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 px-2 py-1 rounded text-xs transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
