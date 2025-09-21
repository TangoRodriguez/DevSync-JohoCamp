// This component renders a password input and posts to /api/login
// Shows success/error message and redirects back if ?from= is present
'use client'
import { useState } from 'react'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const password = String(form.get('password') || '')
    const from = new URL(window.location.href).searchParams.get('from')
    const res = await fetch(`/api/login${from ? `?from=${encodeURIComponent(from)}` : ''}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.status === 303) {
      // should redirect by Location header
      window.location.href = res.headers.get('Location') || '/'
      return
    }
    const data = await res.json().catch(() => ({}))
    if (!res.ok || !data.ok) {
      setError('パスワードが違います')
    } else {
      window.location.href = from || '/'
    }
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="password" name="password" placeholder="パスワード" className="w-full border rounded px-3 py-2" required />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button disabled={loading} type="submit" className="w-full bg-black text-white rounded px-3 py-2">
        {loading ? '送信中...' : '入室'}
      </button>
    </form>
  )
}
