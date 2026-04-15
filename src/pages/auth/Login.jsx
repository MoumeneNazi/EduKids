import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/shared/LanguageSwitcher'

export default function Login() {
  const { login, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  if (loading) return <LoadingSpinner label={t('auth.login.submitting', 'Authenticating...')} />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome back, ${user.name}`)
      
      const roleHome = {
        student: '/student/dashboard',
        parent: '/parent/dashboard',
        teacher: '/teacher/dashboard',
        admin: '/admin/dashboard',
      }
      navigate(roleHome[user.role] || '/', { replace: true })
    } catch (error) {
      toast.error(error.detail || error.message || 'Login failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
        <header className="mb-10 text-center">
          <div className="mx-auto w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/20">
             <span className="text-white font-black text-2xl">E</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('auth.login.title')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('auth.login.subtitle')}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('auth.login.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('auth.login.password')}</label>
                <Link to="#" className="text-[10px] font-bold text-blue-600 hover:text-blue-800">{t('auth.login.forgot')}</Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 shadow-md shadow-blue-500/20"
          >
            {submitting ? t('auth.login.submitting') : t('auth.login.submit')}
          </button>
        </form>

        <footer className="mt-10 text-center border-t border-slate-100 pt-8">
           <p className="text-sm text-slate-500">
             {t('auth.login.noAccount')} <Link to="/signup" className="font-bold text-blue-600 hover:underline">{t('auth.login.register')}</Link>
           </p>
        </footer>
      </div>
    </div>
  )
}
