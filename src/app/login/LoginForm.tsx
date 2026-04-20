'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email 或密碼錯誤，請再試')
    } else {
      router.push('/generate')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl p-6 space-y-4"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jones@chiwa.hk"
          required
          autoComplete="email"
          className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff' }}
        />
      </div>

      <div>
        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>
          密碼
        </label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
          className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-colors"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: '#fff' }}
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
        style={{ background: 'var(--gold)', color: '#000' }}
      >
        {loading ? '登入中...' : '登入'}
      </button>
    </form>
  )
}
