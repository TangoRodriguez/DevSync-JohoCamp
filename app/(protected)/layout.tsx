export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-5xl p-6">{children}</section>
}
