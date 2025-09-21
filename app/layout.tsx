import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DevSync',
  description: 'Team goals and progress tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-white text-gray-900 antialiased">{children}</body>
    </html>
  )
}
