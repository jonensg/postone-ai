'use client'

import { Suspense, useState } from 'react'
import GenerateForm, { type GeneratedPost } from '@/components/GenerateForm'
import OutputCard from '@/components/OutputCard'
import Nav from '@/components/Nav'

export default function GeneratePage() {
  const [post, setPost] = useState<GeneratedPost | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h2 className="text-2xl mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
            小紅書貼文生成
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            輸入題目，由 Jones 的 AI 分身生成地道小紅書文案
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <Suspense fallback={<div className="text-sm" style={{ color: 'var(--text-muted)' }}>載入中...</div>}>
            <GenerateForm
              onResult={setPost}
              onLoading={setLoading}
              loading={loading}
            />
          </Suspense>
        </div>

        {loading && (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <div className="text-2xl mb-2">✨</div>
            <p className="text-sm">Jones AI 緊係度幫你諗緊...</p>
          </div>
        )}

        {post && !loading && <OutputCard post={post} />}
      </main>
    </div>
  )
}
