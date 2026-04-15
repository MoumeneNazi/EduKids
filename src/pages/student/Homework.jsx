import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import { PenTool, CheckCircle, Clock } from 'lucide-react'

export default function Homework() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [homework, setHomework] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      setLoading(true)
      try {
        const res = await apiFetch('/assignments?type=homework')
        const list = Array.isArray(res) ? res : []
        setHomework(list.map((a) => ({ ...a, status: 'pending' })))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile])

  if (loading) return <LoadingSpinner label="Loading homework..." />

  if (homework.length === 0) {
    return (
      <div className="max-w-3xl mx-auto rounded-3xl bg-amber-50 border-4 border-dashed border-amber-200 p-12 text-center">
        <div className="text-6xl mb-6">🎈</div>
        <p className="text-xl font-bold text-amber-900">{t('student.homework.empty')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <header className="flex items-center gap-4 bg-rose-100 p-6 rounded-2xl border-b-4 border-rose-200">
         <PenTool className="h-10 w-10 text-rose-600" />
         <h2 className="text-3xl font-black text-rose-900">{t('student.homework.title')}</h2>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {homework.map((hw) => (
          <div
            key={hw.id}
            className="group flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border-b-4 border-slate-200 hover:-translate-y-2 hover:border-rose-300 hover:shadow-xl transition-all duration-300"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-rose-500 bg-rose-50 inline-block px-3 py-1 rounded-full border border-rose-100 mb-3">
                {hw.subject ?? 'Homework'}
              </p>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {hw.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">{hw.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700">
                 <Clock className="h-3.5 w-3.5" /> {t('student.homework.dueSoon')}
               </div>
               <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                 {hw.status}
               </div>
            </div>

            <textarea
              rows={3}
              placeholder={t('student.homework.placeholder')}
              className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-800 outline-none focus:border-rose-400 focus:bg-white transition-all resize-none mt-auto"
            />
            
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3.5 text-sm font-black text-white hover:bg-rose-600 active:scale-[0.98] transition-all shadow-md shadow-rose-500/20"
            >
               <CheckCircle className="h-5 w-5" /> {t('student.homework.submit')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
