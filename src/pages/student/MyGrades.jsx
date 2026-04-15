import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import { Award, Filter } from 'lucide-react'

export default function MyGrades() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [grades, setGrades] = useState([])
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      try {
        const res = await apiFetch('/grades')
        setGrades(Array.isArray(res) ? res : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const subjects = useMemo(() => {
    const set = new Set(grades.map((g) => g.subject).filter(Boolean))
    return Array.from(set).sort()
  }, [grades])

  const filteredGrades =
    subjectFilter === 'all'
      ? grades
      : grades.filter((g) => g.subject === subjectFilter)

  if (loading) return <LoadingSpinner label={t('student.grades.title')} />

  if (grades.length === 0) {
    return (
      <div className="max-w-3xl mx-auto rounded-3xl bg-slate-50 border-4 border-dashed border-slate-200 p-12 text-center">
        <div className="text-6xl mb-6">📜</div>
        <p className="text-xl font-bold text-slate-500">{t('student.grades.empty')}</p>
      </div>
    )
  }

  const averageBySubject = subjects.map((subject) => {
    const subset = grades.filter((g) => g.subject === subject)
    const total = subset.reduce((sum, g) => sum + (g.max_score ? (g.score / g.max_score) * 100 : 0), 0)
    const avg = subset.length ? Math.round(total / subset.length) : 0
    return { subject, avg }
  })

  const badgeClass = (avg) =>
    avg >= 85
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : avg >= 70
        ? 'bg-sky-100 text-sky-700 border-sky-200'
        : 'bg-rose-100 text-rose-700 border-rose-200'

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-teal-100 p-8 rounded-2xl border-b-4 border-teal-200">
        <div className="flex items-center gap-4">
           <Award className="h-10 w-10 text-teal-600" />
           <h2 className="text-3xl font-black text-teal-900">{t('student.grades.title')}</h2>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 flex-wrap rounded-xl border border-teal-200 shadow-sm">
          <Filter className="h-4 w-4 text-slate-400 ml-2" />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{t('student.grades.filter')}</span>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-lg border-2 border-slate-100 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 outline-none focus:border-teal-400 transition-colors cursor-pointer"
          >
            <option value="all">{t('student.grades.all')}</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </header>

      {averageBySubject.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {averageBySubject.map(({ subject, avg }) => (
            <div
              key={subject}
              className={`flex items-center gap-3 rounded-2xl px-5 py-3 border-b-4 shadow-sm hover:-translate-y-1 transition-transform ${badgeClass(avg)} bg-white`}
            >
              <span className="text-sm font-black uppercase tracking-widest opacity-80">{subject}</span>
              <span className="text-2xl font-black">{avg}%</span>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border-4 border-slate-100 bg-white shadow-sm">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50 border-b-4 border-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest text-left">
            <tr>
              <th className="px-6 py-5">{t('student.grades.subject')}</th>
              <th className="px-6 py-5">{t('student.grades.assignment')}</th>
              <th className="px-6 py-5">{t('student.grades.score')}</th>
              <th className="px-6 py-5">{t('student.grades.feedback')}</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-50">
            {filteredGrades.map((g) => {
              const pct = g.max_score ? Math.round((g.score / g.max_score) * 100) : 0
              return (
                <tr key={g.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">{g.subject || '—'}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{g.assignment_title || 'Assignment'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 font-black border-2 ${badgeClass(pct).replace('bg-','bg-opacity-50 ')}`}>
                      {g.score}/{g.max_score} <span className="opacity-50">({pct}%)</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 italic max-w-xs truncate">{g.feedback}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
