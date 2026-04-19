import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DraftList from '@/components/DraftList'
import Nav from '@/components/Nav'

export default async function DraftsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />

      <main className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl" style={{ fontFamily: 'var(--font-heading)' }}>
              草稿庫
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {posts?.length ?? 0} 篇貼文
            </p>
          </div>
          <Link
            href="/generate"
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: 'var(--gold)', color: '#000' }}
          >
            + 新貼文
          </Link>
        </div>

        <DraftList initialPosts={posts ?? []} />
      </main>
    </div>
  )
}
