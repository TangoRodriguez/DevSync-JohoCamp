// View and edit a single team goal. Toggle between read and edit modes.
// Props: teamId: string; goal?: { id: string; title: string; description?: string }
// Use Supabase to insert/update into table `team_goals`.
// Show a button "目標を設定" when no goal.
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export type TeamGoal = { id: string; title: string; description?: string | null }

export default function TeamGoalEditor({ teamId, goal: initialGoal }: { teamId: string; goal?: TeamGoal | null }) {
  const [editing, setEditing] = useState(!initialGoal)
  const [title, setTitle] = useState(initialGoal?.title ?? '')
  const [description, setDescription] = useState(initialGoal?.description ?? '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function save() {
    setSaving(true)
    try {
      const supabase = getSupabaseClient()
      if (initialGoal) {
        const { error } = await supabase
          .from('team_goals')
          .update({ title, description })
          .eq('id', initialGoal.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('team_goals')
          .insert([{ team_id: teamId, title, description }])
        if (error) throw error
      }
      setEditing(false)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (!editing && !initialGoal) {
    return (
      <div className="border rounded p-4">
        <p className="text-gray-600 mb-2">班目標が未設定です。</p>
        <button className="bg-black text-white rounded px-3 py-2" onClick={() => setEditing(true)}>目標を設定</button>
      </div>
    )
  }

  if (!editing) {
    return (
      <div className="border rounded p-4">
        <h2 className="font-semibold text-lg">{initialGoal?.title}</h2>
        {initialGoal?.description && <p className="text-gray-700 mt-1 whitespace-pre-wrap">{initialGoal.description}</p>}
        <button className="mt-3 text-sm underline" onClick={() => setEditing(true)}>編集</button>
      </div>
    )
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <input className="w-full border rounded px-3 py-2" placeholder="目標タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2" rows={4} placeholder="詳細" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex gap-2">
        <button disabled={saving} className="bg-black text-white rounded px-3 py-2" onClick={save}>{saving ? '保存中…' : '保存'}</button>
        <button className="border rounded px-3 py-2" onClick={() => setEditing(false)}>キャンセル</button>
      </div>
    </div>
  )
}
