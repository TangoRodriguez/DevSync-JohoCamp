// Simple form to create a new progress item and insert into Supabase
// Props: teamId: string
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function ProgressForm({ teamId }: { teamId: string }) {
  const [author, setAuthor] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase
        .from('user_progress')
        .insert([{ team_id: teamId, author_name: author, content, status: '未着手' }])
      if (error) throw error
  setAuthor('')
  setContent('')
  router.refresh()
    } catch (e: any) {
      setError(e?.message ?? '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border rounded p-4 space-y-3">
      <input className="w-full border rounded px-3 py-2" placeholder="名前" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="進捗目標" value={content} onChange={(e) => setContent(e.target.value)} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button disabled={saving || !author || !content} className="bg-black text-white rounded px-3 py-2 disabled:opacity-50" onClick={submit}>{saving ? '追加中…' : '追加'}</button>
    </div>
  )
}
