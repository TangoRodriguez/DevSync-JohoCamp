import './globals.css'
import { Toaster } from '@/components/components/ui/sonner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DevSync',
  description: 'Team goals and progress tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-dvh bg-zinc-50 text-zinc-900 antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  )
}
