import { NextResponse, NextRequest } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // 簡易保護: ログイン済みCookieが無ければ拒否
  const authed = req.cookies.get('app-auth')?.value === '1'
  if (!authed) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })

  try {
    const supabase = getSupabaseServer()
    // XR班をupsert（slug一意）
    const { data: team, error: teamErr } = await supabase
      .from('teams')
      .upsert({ name: 'XR班', slug: 'xr' }, { onConflict: 'slug' })
      .select('*')
      .single()
    if (teamErr) return NextResponse.json({ ok: false, error: 'team_upsert_failed' }, { status: 500 })

    // 既に目標が無ければ1件だけ初期目標を作成
    const { data: existingGoal } = await supabase
      .from('team_goals')
      .select('id')
      .eq('team_id', team.id)
      .limit(1)
      .maybeSingle()

    if (!existingGoal) {
      await supabase
        .from('team_goals')
        .insert({ team_id: team.id, title: 'XR班の目標', description: 'ここに班の目標を記入' })
    }

    return NextResponse.json({ ok: true, team: { id: team.id, name: team.name, slug: team.slug } })
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'internal_error' }, { status: 500 })
  }
}
