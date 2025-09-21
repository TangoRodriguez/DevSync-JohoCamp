import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || ''
    let password = ''
    if (contentType.includes('application/json')) {
      const body = await req.json()
      password = body?.password || ''
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const form = await req.formData()
      password = String(form.get('password') || '')
    }

    if (!process.env.APP_SHARED_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
    }

    if (password !== process.env.APP_SHARED_PASSWORD) {
      return NextResponse.json({ ok: false, error: 'invalid_password' }, { status: 401 })
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set('app-auth', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })

    const from = new URL(req.url).searchParams.get('from')
    if (from) {
      res.headers.set('Location', from)
      return new Response(null, { status: 303, headers: res.headers })
    }

    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }
}
