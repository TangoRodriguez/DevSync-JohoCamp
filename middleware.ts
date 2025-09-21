import { NextResponse, NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const authed = req.cookies.get('app-auth')?.value === '1'
  if (!authed) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/(protected)/:path*',
    '/web/:path*',
    '/app/:path*',
    '/game/:path*',
    '/video/:path*',
  ],
}
