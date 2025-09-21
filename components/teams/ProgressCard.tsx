// Render a single progress card with status control and edit/delete actions
// Props: item: { id, author_name, content, status }
'use client'
import { getSupabaseClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/components/ui/button'
import { Input } from '@/components/components/ui/input'
import { Textarea } from '@/components/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/components/ui/dropdown-menu'

export type ProgressItem = {
  id: string
  author_name: string
  content: string
  status: '未着手' | '進行中' | '完了'
}

export default function ProgressCard({ item, onUpdated, onDeleted }: { item: ProgressItem; onUpdated?: (updated: ProgressItem) => void; onDeleted?: () => void }) {
  const supabase = getSupabaseClient()
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(item.content)
  const [author, setAuthor] = useState(item.author_name)

  async function updateStatus(status: ProgressItem['status']) {
    const { data, error } = await supabase
      .from('user_progress')
      .update({ status })
      .eq('id', item.id)
      .select('id, author_name, content, status')
      .single()
    if (error) return
    const updated = { id: data.id, author_name: data.author_name, content: data.content, status: data.status as ProgressItem['status'] }
    onUpdated?.(updated)
  }

  async function onDelete() {
    const ok = window.confirm('この進捗を削除しますか？')
    if (!ok) return
    await supabase.from('user_progress').delete().eq('id', item.id)
    onDeleted?.()
  }

  const statusBgClass =
    item.status === '完了'
      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
      : item.status === '進行中'
      ? 'bg-amber-400 hover:bg-amber-500 text-black'
      : 'bg-red-500 hover:bg-red-600 text-white'

  return (
  <div className="border border-zinc-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-zinc-900">{item.author_name}</p>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={`${statusBgClass} border border-transparent shadow-sm text-sm`}>{item.status}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[8rem]">
              <DropdownMenuItem onClick={() => updateStatus('未着手')}>
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500 mr-2" />未着手
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('進行中')}>
                <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 mr-2" />進行中
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateStatus('完了')}>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 mr-2" />完了
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {editing ? (
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="text-xs text-zinc-500">名前</span>
            <Input className="mt-1" placeholder="名前" value={author} onChange={(e) => setAuthor(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-xs text-zinc-500">内容</span>
            <Textarea className="mt-1" rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={async () => {
                const { data, error } = await supabase
                  .from('user_progress')
                  .update({ content, author_name: author })
                  .eq('id', item.id)
                  .select('id, author_name, content, status')
                  .single()
                if (error) return
                const updated = { id: data.id, author_name: data.author_name, content: data.content, status: data.status as ProgressItem['status'] }
                onUpdated?.(updated)
                setEditing(false)
              }}
            >保存</Button>
            <Button type="button" variant="outline" onClick={() => { setAuthor(item.author_name); setContent(item.content); setEditing(false) }}>キャンセル</Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-zinc-700">{item.content}</p>
          <div className="mt-3 flex gap-2 text-sm">
            <Button type="button" variant="outline" onClick={() => { setAuthor(item.author_name); setContent(item.content); setEditing(true) }} aria-label="編集">編集</Button>
            <Button type="button" variant="destructive" onClick={onDelete} aria-label="削除">削除</Button>
          </div>
        </>
      )}
    </div>
  )
}
