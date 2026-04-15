import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Calendar, CheckCircle, XCircle, Clock, CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function Attendance() {
  const [children, setChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/students')
        setChildren(data)
        if (data[0]) {
          setSelectedChildId(String(data[0].id))
          loadRecords(String(data[0].id))
        } else {
          setLoading(false)
        }
      } catch {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function loadRecords(childId) {
    setLoading(true)
    try {
      const data = await apiFetch(`/attendance?student_id=${childId}`)
      setRecords(data)
    } finally {
      setLoading(false)
    }
  }

  const handleChildChange = (id) => {
    setSelectedChildId(id)
    loadRecords(id)
  }

  if (loading && children.length === 0) return <LoadingSpinner label={t('parent.attendance.title')} />

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-4">
          <CalendarDays className="h-10 w-10 text-slate-400" />
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">{t('parent.attendance.title')}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{t('parent.attendance.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 relative">
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('parent.attendance.child')}</span>
           <select
             value={selectedChildId}
             onChange={(e) => handleChildChange(e.target.value)}
             className="text-sm font-bold text-slate-800 bg-transparent outline-none cursor-pointer pl-2 pr-6 py-1"
           >
             {children.map(c => (
               <option key={c.id} value={c.id}>{c.name}</option>
             ))}
           </select>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {records.map(r => (
          <div key={r.id} className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm hover:border-slate-200 transition-colors flex flex-col justify-between">
             <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500">
                   <Calendar className="h-6 w-6" />
                </div>
                <div>
                   <div className="font-bold text-slate-900">
                     {new Date(r.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                   </div>
                   <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                     {t('parent.attendance.markedBy')}
                   </div>
                </div>
             </div>

             <div className="mt-auto">
                {r.status === 'present' && (
                  <div className="flex w-fit items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-black text-xs">
                    <CheckCircle className="h-4 w-4" /> {t('parent.attendance.present')}
                  </div>
                )}
                {r.status === 'absent' && (
                  <div className="flex w-fit items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 font-black text-xs">
                    <XCircle className="h-4 w-4" /> {t('parent.attendance.absent')}
                  </div>
                )}
                {r.status === 'late' && (
                  <div className="flex w-fit items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 font-black text-xs">
                    <Clock className="h-4 w-4" /> {t('parent.attendance.late')}
                  </div>
                )}
             </div>
          </div>
        ))}
      </div>

      {records.length === 0 && !loading && (
        <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
           <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              {t('parent.attendance.empty')}
           </p>
        </div>
      )}
    </div>
  )
}
