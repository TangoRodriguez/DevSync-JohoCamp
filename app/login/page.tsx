// Simple password form page using LoginForm component
import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-xl font-semibold mb-4">アクセス用パスワード</h1>
      <LoginForm />
    </main>
  )
}
