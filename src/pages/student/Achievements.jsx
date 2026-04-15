import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Trophy, Star, Lock } from 'lucide-react'

const EARNED_BADGES = ['Early Bird', 'Math Star', 'Reading Hero']
const LOCKED_BADGES = [
  { name: 'Perfect Attendance', hint: 'Come to school every day this month.' },
  { name: 'Science Explorer', hint: 'Score 90%+ on a science test.' },
  { name: 'Team Player', hint: 'Help a classmate with homework.' },
]

export default function Achievements() {
  const { profile } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-amber-100 to-yellow-200 p-8 rounded-2xl shadow-sm border border-amber-200">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight text-amber-900 flex items-center gap-3">
             <Trophy className="h-8 w-8 text-amber-600" /> {t('student.achievements.title')}
          </h2>
          <p className="text-base font-medium text-amber-800 mt-2">
            {t('student.achievements.subtitle')}
          </p>
        </div>
        <div className="flex bg-white p-2 rounded-xl border-b-4 border-slate-200 shadow-sm animate-bounce">
          <div className="px-6 py-2 text-sm font-black text-slate-800 tracking-wide">
            {t('student.achievements.count', { count: EARNED_BADGES.length }).replace('{{count}}', EARNED_BADGES.length)}
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h3 className="text-xl font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
           <Star className="h-6 w-6" /> {t('student.achievements.earned')}
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {EARNED_BADGES.map((badge) => (
            <div
              key={badge}
              className="group flex flex-col items-center justify-center rounded-2xl bg-white border-b-4 border-amber-200 p-8 text-center shadow-sm hover:-translate-y-2 hover:shadow-lg transition-all duration-300"
            >
              <div className="mb-4 text-5xl group-hover:scale-125 transition-transform drop-shadow-md">🏅</div>
              <p className="text-lg font-black text-amber-900">{badge}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
           <Lock className="h-6 w-6" /> {t('student.achievements.locked')}
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {LOCKED_BADGES.map((badge) => (
            <div
              key={badge.name}
              className="flex flex-col justify-between rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-slate-500 hover:border-slate-300 transition-colors"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="text-3xl opacity-40 grayscale" aria-hidden="true">
                  🏅
                </span>
                <p className="font-bold text-slate-600 leading-tight">{badge.name}</p>
              </div>
              <p className="text-xs font-medium text-slate-400">{badge.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-sky-100 border-b-4 border-sky-200 p-6 text-sky-900">
        <p className="font-bold text-sm text-center">
          {t('student.achievements.hint')}
        </p>
      </section>
    </div>
  )
}
