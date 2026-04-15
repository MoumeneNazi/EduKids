import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import { Rocket, Play } from 'lucide-react'

export default function MyCourses() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    async function load() {
      setLoading(true)
      try {
        const res = await apiFetch('/courses')
        setCourses(Array.isArray(res) ? res : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile])

  if (!profile || loading) return <LoadingSpinner label="Loading your courses..." />

  if (courses.length === 0) {
    return (
      <div className="max-w-3xl mx-auto rounded-3xl bg-indigo-50 border-4 border-dashed border-indigo-200 p-12 text-center">
        <div className="text-6xl mb-6">🚀</div>
        <p className="text-xl font-bold text-indigo-900">{t('student.courses.empty')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <header className="flex items-center gap-4 bg-indigo-100 p-6 rounded-2xl border-b-4 border-indigo-200">
         <Rocket className="h-10 w-10 text-indigo-600" />
         <h2 className="text-3xl font-black text-indigo-900">{t('student.courses.title')}</h2>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course.id}
            className="group flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border-b-4 border-slate-200 hover:-translate-y-2 hover:border-indigo-300 hover:shadow-xl transition-all duration-300"
          >
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100 mb-3">
                {course.subject}
              </p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {course.title}
              </h3>
              <p className="mt-2 text-sm font-medium text-slate-500">{course.description}</p>
            </div>
            
            <div className="mt-8 flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <span>{t('student.courses.progress')}</span>
                  <span className="text-indigo-600">60%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full w-3/5 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full group-hover:w-full transition-all duration-1000" />
                </div>
              </div>
              <button
                type="button"
                className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 hover:scale-110 active:scale-95 transition-all shadow-md shadow-indigo-500/20"
                title={t('student.courses.continue')}
              >
                <Play className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
