// Render a list of progress items with realtime updates using Supabase channel.
// Props: teamId: string; items: ProgressItem[]
'use client'
import { useEffect, useState } from 'react'
import ProgressCard, { ProgressItem } from './ProgressCard'
import { getSupabaseClient } from '@/lib/supabase/client'

export default function ProgressList({ teamId, items: initial }: { teamId: string; items: ProgressItem[] }) {
  const [items, setItems] = useState<ProgressItem[]>(initial)

  useEffect(() => {
    const supabase = getSupabaseClient()
    const channel = supabase
      .channel(`progress-${teamId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_progress', filter: `team_id=eq.${teamId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const r: any = payload.new
            setItems((prev) => [{ id: r.id, author_name: r.author_name, content: r.content, status: r.status }, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            const r: any = payload.new
            setItems((prev) => prev.map((p) => (p.id === r.id ? { id: r.id, author_name: r.author_name, content: r.content, status: r.status } : p)))
          } else if (payload.eventType === 'DELETE') {
            const r: any = payload.old
            setItems((prev) => prev.filter((p) => p.id !== r.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [teamId])

  return (
    <div className="grid gap-3">
      {items.map((it) => (
        <ProgressCard key={it.id} item={it} />
      ))}
    </div>
  )
}
