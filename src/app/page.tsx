import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string }>
}) {
  const params = await searchParams
  if (params.code) redirect(`/auth/callback?code=${params.code}`)
  if (params.token_hash && params.type) {
    redirect(`/auth/callback?token_hash=${params.token_hash}&type=${params.type}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  redirect(user ? '/generate' : '/login')
}
