// Simple form to create a new progress item and insert into Supabase
// Props: teamId: string
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/components/ui/button'
import { Input } from '@/components/components/ui/input'
import { Textarea } from '@/components/components/ui/textarea'

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
      const { data, error } = await supabase
        .from('user_progress')
        .insert([{ team_id: teamId, author_name: author, content, status: '未着手' }])
        .select('id, author_name, content, status')
        .single()
      if (error) throw error
      setAuthor('')
      setContent('')
      // Realtimeに加えて自分の画面でも確実に即時反映
      const event = new CustomEvent('progress:new', { detail: { id: data.id, author_name: data.author_name, content: data.content, status: data.status } })
      window.dispatchEvent(event)
    } catch (e: any) {
      setError(e?.message ?? '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border border-zinc-200 rounded-xl p-4 shadow-sm bg-white space-y-3">
      <label className="block">
        <span className="text-xs text-zinc-500">名前</span>
        <Input className="mt-1" placeholder="名前" value={author} onChange={(e) => setAuthor(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs text-zinc-500">進捗目標</span>
        <Textarea className="mt-1" rows={3} placeholder="進捗目標" value={content} onChange={(e) => setContent(e.target.value)} />
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <Button disabled={saving || !author || !content} onClick={submit} size="sm">{saving ? '追加中…' : '追加'}</Button>
    </div>
  )
}
