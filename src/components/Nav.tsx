'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/generate', label: '生成' },
  { href: '/drafts', label: '草稿庫' },
  { href: '/calendar', label: '內容日曆' },
  { href: '/trending', label: '熱門話題' },
  { href: '/assets', label: '素材庫' },
  { href: '/analytics', label: '數據' },
]

export default function Nav() {
  const pathname = usePathname()
  return (
    <header
      className="flex items-center justify-between px-6 py-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <Link
        href="/generate"
        className="text-xl"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}
      >
        Postone
      </Link>
      <nav className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        {LINKS.map(l => {
          const active = pathname === l.href || pathname?.startsWith(l.href + '/')
          return (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-white"
              style={{ color: active ? '#fff' : undefined }}
            >
              {l.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
