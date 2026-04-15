import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { CheckCircle, XCircle, Clock, Calendar, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function TeacherAttendance() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/students')
        setStudents(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleMark(studentId, status) {
    setSaving(studentId)
    try {
      await apiFetch('/attendance', {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          date: new Date(date).toISOString(),
          status: status,
          marked_by: 0
        })
      })
      // Could show toast here
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner label={t('teacher.attendance.title')} />

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50 p-8 rounded-3xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
             <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900">{t('teacher.attendance.title')}</h2>
            <p className="text-sm font-bold text-slate-500 mt-1">{t('teacher.attendance.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
           <Calendar className="h-4 w-4 text-indigo-500" />
           <input
             type="date"
             value={date}
             onChange={(e) => setDate(e.target.value)}
             className="text-sm font-black text-slate-800 bg-transparent outline-none cursor-pointer"
           />
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="grid divide-y divide-slate-100">
          {students.map(s => (
            <div key={s.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50/50 transition-colors">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-white shadow-sm">
                     <Users className="h-5 w-5" />
                  </div>
                  <div>
                     <div className="text-lg font-black text-slate-900 mb-0.5">{s.name}</div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('teacher.attendance.studentId')}: #{s.user_id}</div>
                  </div>
               </div>

               <div className="flex items-center gap-3 bg-slate-50/80 p-2 rounded-2xl border border-slate-100">
                  <button
                    onClick={() => handleMark(s.user_id, 'present')}
                    disabled={saving === s.user_id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-emerald-600 hover:bg-emerald-50 active:scale-95 transition-all shadow-sm border border-slate-100 disabled:opacity-50"
                  >
                     <CheckCircle className="h-4 w-4" /> {t('teacher.attendance.present')}
                  </button>
                  <button
                    onClick={() => handleMark(s.user_id, 'late')}
                    disabled={saving === s.user_id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-amber-600 hover:bg-amber-50 active:scale-95 transition-all shadow-sm border border-slate-100 disabled:opacity-50"
                  >
                     <Clock className="h-4 w-4" /> {t('teacher.attendance.late')}
                  </button>
                  <button
                    onClick={() => handleMark(s.user_id, 'absent')}
                    disabled={saving === s.user_id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-rose-600 hover:bg-rose-50 active:scale-95 transition-all shadow-sm border border-slate-100 disabled:opacity-50"
                  >
                     <XCircle className="h-4 w-4" /> {t('teacher.attendance.absent')}
                  </button>
               </div>
            </div>
          ))}

          {students.length === 0 && (
            <div className="py-24 text-center">
               <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t('teacher.attendance.empty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
