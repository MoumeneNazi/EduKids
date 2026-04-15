import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Upload } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../../components/shared/LanguageSwitcher'

export default function SignUp() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('parent')
  const [files, setFiles] = useState({ id_card: null, family_book: null, contract: null })
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('password', password)
    formData.append('role', role)
    if (files.id_card) formData.append('id_card', files.id_card)
    if (files.family_book) formData.append('family_book', files.family_book)
    if (files.contract) formData.append('contract', files.contract)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/auth/signup`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || 'Signup failed')

      toast.success('Registration submitted. Admin review required.')
      navigate('/login', { replace: true })
    } catch (error) {
      toast.error(error.message)
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('auth.signup.title')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('auth.signup.subtitle')}</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${role === 'parent' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {t('auth.signup.parentBtn')}
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 rounded-xl border py-3 text-sm font-bold transition-all ${role === 'teacher' ? 'border-teal-600 bg-teal-50 text-teal-700 shadow-sm' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {t('auth.signup.teacherBtn')}
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('auth.signup.name')}</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('auth.signup.email')}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('auth.signup.password')}</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
              />
            </div>

            <hr className="border-slate-100 my-4" />

            {role === 'parent' ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('auth.signup.govId')}</label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-4 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-colors">
                    <Upload className="h-4 w-4 text-slate-400" />
                    {files.id_card ? files.id_card.name : t('auth.signup.uploadId')}
                    <input type="file" className="hidden" onChange={(e) => setFiles({ ...files, id_card: e.target.files[0] })} />
                  </label>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('auth.signup.familyBook')}</label>
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-4 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-colors">
                    <Upload className="h-4 w-4 text-slate-400" />
                    {files.family_book ? files.family_book.name : t('auth.signup.uploadFamily')}
                    <input type="file" className="hidden" onChange={(e) => setFiles({ ...files, family_book: e.target.files[0] })} />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{t('auth.signup.contract')}</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-4 text-xs font-semibold text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-colors">
                  <Upload className="h-4 w-4 text-slate-400" />
                  {files.contract ? files.contract.name : t('auth.signup.uploadContract')}
                  <input type="file" className="hidden" onChange={(e) => setFiles({ ...files, contract: e.target.files[0] })} />
                </label>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? t('auth.signup.submitting') : t('auth.signup.submit')}
          </button>
        </form>

        <footer className="mt-8 text-center text-xs text-slate-400">
          {t('auth.signup.terms')}
          <div className="mt-4">
            <Link to="/login" className="text-sm font-bold text-blue-600 hover:underline">
               {t('auth.signup.hasAccount')} {t('auth.signup.signin')}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
