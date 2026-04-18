'use client'

import { useState } from 'react'
import type { GeneratedPost } from './GenerateForm'

interface Props {
  post: GeneratedPost
}

export default function OutputCard({ post }: Props) {
  const [copied, setCopied] = useState(false)

  const fullText = `${post.title}\n\n${post.body}\n\n${post.hashtags.join(' ')}`

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="rounded-xl p-6 space-y-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg leading-snug" style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}>
          {post.title}
        </h3>
        <button
          onClick={handleCopy}
          className="shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all"
          style={{
            background: copied ? '#1a3a1a' : 'var(--surface-2)',
            color: copied ? '#4ade80' : 'var(--text-muted)',
            border: `1px solid ${copied ? '#4ade80' : 'var(--border)'}`,
          }}
        >
          {copied ? '✓ Copied' : 'Copy all'}
        </button>
      </div>

      <p className="text-sm leading-7 whitespace-pre-wrap" style={{ color: '#ddd' }}>
        {post.body}
      </p>

      <div className="flex flex-wrap gap-2 pt-2">
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

      <p className="text-xs pt-2" style={{ color: 'var(--text-muted)' }}>
        Brief: {post.brief} · 語氣: {post.tone}
      </p>
    </div>
  )
}
