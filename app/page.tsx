// Fetch all teams from Supabase and render TeamSelector
import TeamSelector from '@/components/home/TeamSelector'
import { getSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  try {
    const supabase = getSupabaseServer()
    const { data: teams, error } = await supabase
      .from('teams')
      .select('name, slug')
      .order('name', { ascending: true })

    if (error) {
      return (
        <main className="mx-auto max-w-4xl p-6">
          <h1 className="text-2xl font-bold mb-4">班を選択</h1>
          <p className="text-red-600">チーム一覧の取得に失敗しました。</p>
        </main>
      )
    }

    // デフォルト班（DBが未作成でも表示）
    const defaultTeams = [
      { name: 'Web班', slug: 'web' },
      { name: 'アプリ班', slug: 'app' },
      { name: 'ゲーム班', slug: 'game' },
      { name: '映像班', slug: 'video' },
      { name: 'XR班', slug: 'xr' },
    ]

    // DBの結果とデフォルトをマージし、slugで重複排除
    const dbTeams = teams ?? []
    const mergedMap = new Map<string, { name: string; slug: string }>()
    for (const t of [...defaultTeams, ...dbTeams]) mergedMap.set(t.slug, { name: t.name, slug: t.slug })
    const mergedTeams = Array.from(mergedMap.values()).sort((a, b) => a.name.localeCompare(b.name))

    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold mb-4">班を選択</h1>
        <TeamSelector teams={mergedTeams} />
      </main>
    )
  } catch (e) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold mb-4">班を選択</h1>
        <p className="text-red-600">Supabaseの環境変数が未設定です。`.env.local` に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。</p>
      </main>
    )
  }
}
