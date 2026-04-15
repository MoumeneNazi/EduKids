import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { UserPlus, UserCircle2, X } from 'lucide-react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useTranslation } from 'react-i18next'

const CLASS_LEVELS = ['CP', 'CE1', 'CE2', 'CM1', 'CM2']

export default function ChildProgress() {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addName, setAddName] = useState('')
  const [addEmail, setAddEmail] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addClassLevel, setAddClassLevel] = useState('CM1')
  const [submitting, setSubmitting] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    apiFetch('/students')
      .then((r) => setChildren(Array.isArray(r) ? r : []))
      .catch(() => toast.error('Failed to load children'))
      .finally(() => setLoading(false))
  }, [])

  const handleAddChild = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiFetch('/students/register-child', {
        method: 'POST',
        body: JSON.stringify({
          name: addName.trim(),
          email: addEmail.trim(),
          password: addPassword,
          class_level: addClassLevel,
        }),
      })
      toast.success('Child account created successfully.')
      setAddName('')
      setAddEmail('')
      setAddPassword('')
      setShowAddForm(false)
      const r = await apiFetch('/students')
      setChildren(Array.isArray(r) ? r : [])
    } catch (e) {
      toast.error(e.detail || e.message || 'Failed to create account')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner label={t('parent.progress.title')} />

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">{t('parent.progress.title')}</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-black transition-all shadow-sm ${
            showAddForm 
            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
            : 'bg-teal-600 text-white hover:bg-teal-700 hover:-translate-y-1 hover:shadow-md'
          }`}
        >
          {showAddForm ? <X className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {showAddForm ? t('parent.progress.cancel') : t('parent.progress.addChild')}
        </button>
      </header>

      {showAddForm && (
        <form
          onSubmit={handleAddChild}
          className="rounded-3xl border-2 border-teal-100 bg-teal-50/30 p-8 shadow-sm animate-fade-in"
        >
          <div className="mb-6">
             <h3 className="text-lg font-black text-teal-900">
               {t('parent.progress.createTitle')}
             </h3>
             <p className="mt-1 text-sm font-medium text-teal-700">
               {t('parent.progress.createDesc')}
             </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-teal-800">{t('parent.progress.name')}</label>
              <input
                type="text"
                required
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                className="w-full rounded-xl border-none outline-none ring-1 ring-teal-200 bg-white px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500"
                placeholder="Child's name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-teal-800">{t('parent.progress.email')}</label>
              <input
                type="email"
                required
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                className="w-full rounded-xl border-none outline-none ring-1 ring-teal-200 bg-white px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500"
                placeholder="child@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-teal-800">{t('parent.progress.password')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={addPassword}
                onChange={(e) => setAddPassword(e.target.value)}
                className="w-full rounded-xl border-none outline-none ring-1 ring-teal-200 bg-white px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500"
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-teal-800">{t('parent.progress.level')}</label>
              <select
                value={addClassLevel}
                onChange={(e) => setAddClassLevel(e.target.value)}
                className="w-full rounded-xl border-none outline-none ring-1 ring-teal-200 bg-white px-4 py-3 text-sm font-bold shadow-sm focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {CLASS_LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-8 rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-black text-white hover:bg-teal-700 active:scale-95 transition-all shadow-md disabled:opacity-70 disabled:active:scale-100"
          >
            {submitting ? t('parent.progress.submitting') : t('parent.progress.submit')}
          </button>
        </form>
      )}

      {children.length === 0 && !showAddForm ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <UserCircle2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <p className="font-bold text-slate-500 text-sm max-w-sm mx-auto">
            {t('parent.progress.noChildren')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {children.map((c) => (
            <div
              key={c.id}
              className="group flex flex-col justify-between rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-sm hover:border-teal-200 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="h-12 w-12 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                   <UserCircle2 className="h-8 w-8" />
                </div>
                <span className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-sky-700">
                  {c.class_level}
                </span>
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">{c.name ?? `Student #${c.id}`}</h4>
                <p className="mt-1 text-xs font-bold text-slate-400 uppercase tracking-widest">{t('parent.progress.linked')}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
