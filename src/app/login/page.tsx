import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <h1 className="text-3xl mb-2" style={{ fontFamily: 'var(--font-heading)', color: 'var(--gold)' }}>
            Postone
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            小紅書 AI 創作工具 by Chiwa DCM
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
