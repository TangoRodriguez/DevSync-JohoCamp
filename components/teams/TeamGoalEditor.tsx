// View and edit a single team goal. Toggle between read and edit modes.
// Props: teamId: string; goal?: { id: string; title: string; description?: string }
// Use Supabase to insert/update into table `team_goals`.
// Show a button "目標を設定" when no goal.
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/lib/supabase/client'
import { Button } from '@/components/components/ui/button'
import { Input } from '@/components/components/ui/input'
import { Textarea } from '@/components/components/ui/textarea'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/components/ui/alert-dialog'

export type TeamGoal = { id: string; title: string; description?: string | null }

export default function TeamGoalEditor({ teamId, goal: initialGoal }: { teamId: string; goal?: TeamGoal | null }) {
  const [goal, setGoal] = useState<TeamGoal | null>(initialGoal ?? null)
  const [editing, setEditing] = useState(!initialGoal)
  const [title, setTitle] = useState(initialGoal?.title ?? '')
  const [description, setDescription] = useState(initialGoal?.description ?? '')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  async function save() {
    setSaving(true)
    try {
      const supabase = getSupabaseClient()
      if (goal) {
        const { data, error } = await supabase
          .from('team_goals')
          .update({ title, description })
          .eq('id', goal.id)
          .select('id, title, description')
          .single()
        if (error) throw error
        setGoal({ id: data.id, title: data.title, description: data.description })
      } else {
        const { data, error } = await supabase
          .from('team_goals')
          .insert([{ team_id: teamId, title, description }])
          .select('id, title, description')
          .single()
        if (error) throw error
        setGoal({ id: data.id, title: data.title, description: data.description })
      }
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function onDelete() {
    if (!goal) return
    const supabase = getSupabaseClient()
    try {
      const { error } = await supabase.from('team_goals').delete().eq('id', goal.id)
      if (error) {
        toast.error('削除に失敗しました', { description: error.message })
        return
      }
      setGoal(null)
      setTitle('')
      setDescription('')
      setEditing(false)
      toast.success('削除しました')
    } catch (e: any) {
      toast.error('削除に失敗しました')
    }
  }

  if (!editing && !goal) {
    return (
      <div className="border border-zinc-200 rounded-xl p-4 shadow-sm bg-white">
        <p className="text-zinc-600 mb-3">班目標が未設定です。</p>
        <Button onClick={() => setEditing(true)} size="sm">目標を設定</Button>
      </div>
    )
  }

  if (!editing) {
    return (
      <div className="border border-zinc-200 rounded-xl p-4 shadow-sm bg-white">
        <h2 className="font-semibold text-lg text-zinc-900">{goal?.title}</h2>
        {goal?.description && <p className="text-zinc-700 mt-2 whitespace-pre-wrap leading-relaxed">{goal.description}</p>}
        <div className="mt-4 flex gap-2 text-sm">
          <Button variant="outline" size="sm" onClick={() => { setTitle(goal?.title ?? ''); setDescription(goal?.description ?? ''); setEditing(true) }}>編集</Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">削除</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>班の目標を削除しますか？</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作は取り消せません。班の目標が完全に削除されます。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete}>削除する</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    )
  }

  return (
    <div className="border border-zinc-200 rounded-xl p-4 shadow-sm bg-white space-y-3">
      <label className="block">
        <span className="text-xs text-zinc-500">目標タイトル</span>
        <Input className="mt-1" placeholder="目標タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block">
        <span className="text-xs text-zinc-500">詳細</span>
        <Textarea className="mt-1" rows={4} placeholder="詳細" value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <div className="flex gap-2">
        <Button disabled={saving} onClick={save} size="sm">{saving ? '保存中…' : '保存'}</Button>
        <Button variant="outline" size="sm" onClick={() => setEditing(false)}>キャンセル</Button>
      </div>
    </div>
  )
}
