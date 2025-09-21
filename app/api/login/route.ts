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

    const expected = (process.env.APP_SHARED_PASSWORD || '').trim()
    if (!expected) {
      return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 500 })
    }

    const provided = String(password || '').trim()
    if (provided !== expected) {
      return NextResponse.json({ ok: false, error: 'invalid_password' }, { status: 401 })
    }

    const cookieOptions = {
      httpOnly: true as const,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    }

    const from = new URL(req.url).searchParams.get('from')
    if (from) {
      const redirectUrl = new URL(from, req.url)
      const redirectRes = NextResponse.redirect(redirectUrl, 303)
      redirectRes.cookies.set('app-auth', '1', cookieOptions)
      return redirectRes
    }

    const res = NextResponse.json({ ok: true })
    res.cookies.set('app-auth', '1', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === 'production',
    })
    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
  }
}
