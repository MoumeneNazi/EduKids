import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Award, BookOpen, Calculator, Layout, MessageSquare, GraduationCap, Library, ArrowRight, Star, Trophy, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import AnnouncementsWidget from '../../components/shared/AnnouncementsWidget'

export default function StudentDashboard() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [recentScores, setRecentScores] = useState([])
  const { t } = useTranslation()

  useEffect(() => {
    if (!user) return
    async function load() {
      try {
        const [gradesRes, assignmentsRes] = await Promise.all([
          apiFetch('/grades?limit=5'),
          apiFetch('/assignments'),
        ])
        setRecentScores(Array.isArray(gradesRes) ? gradesRes.slice(0, 3) : [])
        setTasks(Array.isArray(assignmentsRes) ? assignmentsRes.slice(0, 3) : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  if (loading) return <LoadingSpinner label={t('dashboard.ready', 'Entering Math Zone...')} />

  const level = Math.floor(recentScores.length / 2) + 1

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-blue-100 to-indigo-100 p-8 rounded-2xl shadow-sm border border-blue-200">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-blue-900 flex items-center gap-3">
             {t('dashboard.hello')}, {profile?.name}! {profile?.avatar || '🌟'}
          </h2>
          <p className="text-base font-medium text-blue-700 mt-2">{t('dashboard.ready')}</p>
        </div>
        <div className="flex bg-yellow-400 p-2 rounded-xl border-b-4 border-yellow-500 shadow-sm animate-bounce">
          <div className="px-6 py-2 text-sm font-black text-yellow-900 uppercase tracking-widest flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {t('dashboard.level', { level })}
          </div>
        </div>
      </header>

      <AnnouncementsWidget />

      <div className="grid gap-6 sm:grid-cols-4">
        <div className="p-6 rounded-2xl bg-amber-100 border-b-4 border-amber-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Star className="h-4 w-4" /> {t('dashboard.xp')}
          </div>
          <div className="text-4xl font-black text-amber-900">{recentScores.length * 150}</div>
        </div>
        
        <Link to="/student/quiz" className="p-6 rounded-2xl bg-emerald-100 border-b-4 border-emerald-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
          <div className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Target className="h-4 w-4" /> {t('dashboard.activeQuest')}
          </div>
          <div className="text-lg font-bold text-emerald-900 mt-2 flex items-center gap-2 group-hover:gap-3 transition-all">
            {t('dashboard.mathQuiz')} <ArrowRight className="h-5 w-5" />
          </div>
        </Link>
        
        <Link to="/student/study-room" className="p-6 rounded-2xl bg-purple-100 border-b-4 border-purple-200 col-span-2 group hover:-translate-y-1 hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between h-full">
             <div>
                <div className="text-xs font-black text-purple-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Library className="h-4 w-4" /> {t('dashboard.studyRoom')}
                </div>
                <div className="text-lg font-bold text-purple-900 mt-1">{t('dashboard.reviewMaterials')}</div>
             </div>
             <div className="p-4 bg-purple-200 rounded-full group-hover:scale-110 transition-transform">
               <BookOpen className="h-10 w-10 text-purple-700" />
             </div>
          </div>
        </Link>
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <section className="space-y-6">
           <h3 className="text-lg font-black uppercase tracking-wider text-rose-600 flex items-center gap-3">
              <Calculator className="h-6 w-6" /> {t('dashboard.pendingTasks')}
           </h3>
           <div className="grid gap-4">
              {tasks.length === 0 ? (
                <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                   <div className="text-4xl mb-4">🎈</div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('dashboard.noTasks')}</p>
                </div>
              ) : (
                tasks.map(tItem => (
                  <div key={tItem.id} className="p-5 bg-white rounded-2xl border-b-4 border-slate-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex items-center justify-between group">
                    <div>
                      <p className="text-base font-bold text-slate-900">{tItem.title}</p>
                      <p className="text-xs font-bold text-blue-500 uppercase mt-1 tracking-widest">{tItem.type}</p>
                    </div>
                    <button className="text-xs font-black text-white bg-blue-500 px-5 py-2.5 rounded-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 hover:bg-blue-600 transition-all">
                      {t('dashboard.start')}
                    </button>
                  </div>
                ))
              )}
           </div>
        </section>

        <section className="space-y-6">
           <h3 className="text-lg font-black uppercase tracking-wider text-teal-600 flex items-center gap-3">
              <Award className="h-6 w-6" /> {t('dashboard.recentPerformance')}
           </h3>
           <div className="grid gap-4">
              {recentScores.length === 0 ? (
                <div className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center">
                   <div className="text-4xl mb-4">🌱</div>
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Play games to earn scores!</p>
                </div>
              ) : (
                recentScores.map(s => (
                  <div key={s.id} className="p-5 bg-white rounded-2xl border-b-4 border-slate-200 hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex items-center justify-between">
                     <div className="flex gap-4 items-center">
                        <div className="h-12 w-12 rounded-xl bg-teal-100 flex items-center justify-center text-xl font-black text-teal-600 border-b-4 border-teal-200">
                          %
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Score: {s.score}/{s.max_score}</p>
                          <p className="text-xs font-medium text-slate-500 italic mt-1">{s.feedback}</p>
                        </div>
                     </div>
                     <div className="text-2xl font-black text-teal-500 bg-teal-50 px-4 py-2 rounded-xl">
                       {Math.round((s.score/s.max_score)*100)}%
                     </div>
                  </div>
                ))
              )}
           </div>
        </section>
      </div>
    </div>
  )
}
