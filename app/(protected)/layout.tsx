export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-5xl p-6 sm:p-8">{children}</section>
}
