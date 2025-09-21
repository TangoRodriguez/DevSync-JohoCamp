// Render a single progress card with status control and edit/delete actions
// Props: item: { id, author_name, content, status }
'use client'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export type ProgressItem = {
  id: string
  author_name: string
  content: string
  status: '未着手' | '進行中' | '完了'
}

export default function ProgressCard({ item }: { item: ProgressItem }) {
  const supabase = getSupabaseClient()
  const router = useRouter()

  async function onChangeStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const status = e.target.value as ProgressItem['status']
    await supabase.from('user_progress').update({ status }).eq('id', item.id)
    router.refresh()
  }

  async function onDelete() {
    await supabase.from('user_progress').delete().eq('id', item.id)
    router.refresh()
  }

  return (
    <div className="border rounded p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium">{item.author_name}</p>
        <select className="border rounded px-2 py-1" defaultValue={item.status} onChange={onChangeStatus}>
          <option>未着手</option>
          <option>進行中</option>
          <option>完了</option>
        </select>
      </div>
      <p className="mt-2 whitespace-pre-wrap">{item.content}</p>
      <div className="mt-3 flex gap-3 text-sm">
        {/* 省略: 編集UI。必要であればDialogで本文編集を実装 */}
        <button type="button" className="underline text-red-600" onClick={onDelete} aria-label="削除">削除</button>
      </div>
    </div>
  )
}
