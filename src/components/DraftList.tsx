'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export interface Post {
  id: string
  brief: string
  title: string
  body: string
  hashtags: string[]
  tone: string
  status: string
  created_at: string
}

interface Props {
  initialPosts: Post[]
}

export default function DraftList({ initialPosts }: Props) {
  const [posts, setPosts] = useState(initialPosts)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  async function toggleStatus(post: Post) {
    const next = post.status === 'draft' ? 'ready' : 'draft'
    const supabase = createClient()
    await supabase.from('posts').update({ status: next }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: next } : p))
  }

  async function handleCopy(post: Post) {
    const text = `${post.title}\n\n${post.body}\n\n${post.hashtags.join(' ')}`
    await navigator.clipboard.writeText(text)
    setCopied(post.id)
    setTimeout(() => setCopied(null), 2000)
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
        <p className="text-3xl mb-3">📝</p>
        <p className="text-sm">未有草稿，去生成第一篇貼文吧</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <div
          key={post.id}
          className="rounded-xl overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 cursor-pointer"
            onClick={() => setExpanded(expanded === post.id ? null : post.id)}
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-medium truncate">{post.title}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {post.brief} · {new Date(post.created_at).toLocaleDateString('zh-HK')}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-xs px-2 py-1 rounded cursor-pointer"
                style={{
                  background: post.status === 'ready' ? '#1a3a1a' : 'var(--surface-2)',
                  color: post.status === 'ready' ? '#4ade80' : 'var(--text-muted)',
                }}
                onClick={e => { e.stopPropagation(); toggleStatus(post) }}
              >
                {post.status === 'ready' ? '✓ Ready' : 'Draft'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {expanded === post.id ? '▲' : '▼'}
              </span>
            </div>
          </div>

          {expanded === post.id && (
            <div
              className="px-5 pb-5 space-y-3"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <p className="text-sm leading-7 whitespace-pre-wrap pt-4" style={{ color: '#ddd' }}>
                {post.body}
              </p>
              <div className="flex flex-wrap gap-2">
                {post.hashtags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded"
                    style={{ background: 'var(--surface-2)', color: 'var(--gold-light)' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => handleCopy(post)}
                className="text-xs px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: copied === post.id ? '#1a3a1a' : 'var(--surface-2)',
                  color: copied === post.id ? '#4ade80' : 'var(--text-muted)',
                  border: `1px solid ${copied === post.id ? '#4ade80' : 'var(--border)'}`,
                }}
              >
                {copied === post.id ? '✓ Copied' : 'Copy all'}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
