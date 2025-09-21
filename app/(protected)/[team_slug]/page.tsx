// Team dashboard page: fetch team by slug, goals, and progress from Supabase
import { getSupabaseServer } from '@/lib/supabase/server'
import TeamGoalEditor from '@/components/teams/TeamGoalEditor'
import ProgressList from '@/components/teams/ProgressList'
import ProgressForm from '@/components/teams/ProgressForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TeamPage({ params }: { params: { team_slug: string } }) {
  const { team_slug } = params
  try {
    const supabase = getSupabaseServer()

    const { data: team } = await supabase.from('teams').select('*').eq('slug', team_slug).maybeSingle()
    if (!team) {
      return (
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{team_slug.toUpperCase()} ダッシュボード</h1>
          <p className="text-gray-600">対象の班がまだDBに作成されていません。トップに戻って班を選択するか、管理者が作成してください。</p>
        </div>
      )
    }

    const [{ data: goal }, { data: progresses }] = await Promise.all([
      supabase.from('team_goals').select('*').eq('team_id', team.id).order('created_at', { ascending: false }).limit(1).maybeSingle(),
      supabase.from('user_progress').select('*').eq('team_id', team.id).order('created_at', { ascending: false }),
    ])

    return (
      <div className="space-y-6 max-w-5xl mx-auto px-4">
        <header className="border-b pb-3">
          <h1 className="text-2xl font-bold tracking-tight">{team.name} ダッシュボード</h1>
        </header>
        <section>
          <h2 className="font-semibold mb-2 text-zinc-900">班の目標</h2>
          <TeamGoalEditor teamId={team.id} goal={goal ?? undefined} />
        </section>
        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-3">
            <h2 className="font-semibold text-zinc-900">メンバーの進捗</h2>
            <ProgressList teamId={team.id} items={(progresses as any[])?.map(p => ({
              id: p.id,
              author_name: p.author_name,
              content: p.content,
              status: p.status,
            })) ?? []} />
          </div>
          <div>
            <h2 className="font-semibold mb-2 text-zinc-900">新規進捗</h2>
            <ProgressForm teamId={team.id} />
          </div>
        </section>
      </div>
    )
  } catch (e) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">{team_slug} ダッシュボード</h1>
        <p className="text-red-600">Supabaseの環境変数が未設定です。`.env.local` に NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。</p>
      </div>
    )
  }
}
