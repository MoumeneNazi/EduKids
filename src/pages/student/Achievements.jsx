import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTranslation } from 'react-i18next'
import { Trophy, Star, Crown, Medal, TrendingUp, Sparkles } from 'lucide-react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function Achievements() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/students/leaderboard')
        setLeaderboard(data)
      } catch (err) {
        console.error("Failed to load leaderboard", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner label={t('student.achievements.title', 'Trophies')} />

  const myRankIndex = leaderboard.findIndex(s => s.student_id === profile.id)
  const myData = myRankIndex !== -1 ? leaderboard[myRankIndex] : null
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : 'Unranked'

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 p-8 rounded-3xl shadow-lg border border-amber-300 overflow-hidden">
        {/* Animated decorative shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-white/20 rounded-full blur-2xl animate-pulse delay-1000" />
        
        <div className="relative z-10 text-white">
          <h2 className="text-4xl font-extrabold tracking-tight flex items-center gap-3 drop-shadow-md">
             <Trophy className="h-10 w-10 text-yellow-100" /> 
             {t('student.achievements.title', 'Trophies & Ranks')}
          </h2>
          <p className="text-lg font-bold text-yellow-50 mt-2 drop-shadow-sm flex items-center gap-2">
            Finish quizzes to earn XP! <Sparkles className="h-5 w-5" />
          </p>
        </div>

        {myData && (
          <div className="relative z-10 flex items-center gap-6 bg-white/20 backdrop-blur border border-white/40 p-4 rounded-2xl shadow-sm">
            <div className="text-center">
               <p className="text-xs font-black uppercase tracking-widest text-amber-100 mb-1">My Global Rank</p>
               <div className="text-4xl font-black text-white drop-shadow-md">#{myRank}</div>
            </div>
            <div className="w-1 h-12 bg-white/30 rounded-full" />
            <div className="text-center">
               <p className="text-xs font-black uppercase tracking-widest text-amber-100 mb-1">Total XP</p>
               <div className="text-4xl font-black text-white flex items-center gap-2 drop-shadow-md">
                 <Star className="h-6 w-6 text-yellow-200 fill-yellow-200" />
                 {myData.xp_points}
               </div>
            </div>
          </div>
        )}
      </header>

      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <h3 className="p-6 bg-slate-50 border-b border-slate-100 text-xl font-black uppercase tracking-wider text-slate-800 flex items-center gap-3">
           <Crown className="h-6 w-6 text-amber-500" /> 
           Top Scholars Leaderboard
        </h3>
        
        <div className="divide-y divide-slate-100">
           {leaderboard.length === 0 ? (
             <div className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest">
               No students ranked yet. Complete assignments to get on the board!
             </div>
           ) : (
             leaderboard.map((student, index) => {
               const isTop3 = index < 3
               const isMe = student.student_id === profile.id

               return (
                 <div 
                   key={student.id} 
                   className={`flex items-center gap-6 p-4 md:px-8 transition-colors ${isMe ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}
                 >
                    {/* Rank Indicator */}
                    <div className="flex-shrink-0 w-12 text-center">
                       {index === 0 ? <Crown className="h-8 w-8 text-amber-400 mx-auto drop-shadow-sm" /> :
                        index === 1 ? <Medal className="h-8 w-8 text-slate-300 mx-auto drop-shadow-sm" /> :
                        index === 2 ? <Medal className="h-8 w-8 text-amber-700 mx-auto drop-shadow-sm" /> :
                        <span className="text-lg font-black text-slate-400">#{index + 1}</span>}
                    </div>

                    {/* Avatar */}
                    <div className={`flex-shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border-b-4 ${isTop3 ? 'bg-amber-100 border-amber-200' : 'bg-slate-100 border-slate-200'}`}>
                      {student.avatar || '👤'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                       <p className={`text-lg truncate ${isMe ? 'font-black text-amber-900' : 'font-bold text-slate-800'}`}>
                         {student.name} {isMe && <span className="ml-2 text-xs font-black uppercase tracking-widest bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full inline-flex align-middle">You</span>}
                       </p>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Level: {student.class_level}</p>
                    </div>

                    {/* XP */}
                    <div className="text-right">
                       <div className={`text-2xl font-black flex items-center justify-end gap-1 ${isTop3 ? 'text-amber-500' : 'text-slate-600'}`}>
                         {student.xp_points} <span className="text-xs">XP</span>
                       </div>
                       {student.xp_points > 0 && (
                          <div className="flex items-center justify-end gap-1 text-[10px] font-black uppercase text-emerald-500 mt-1">
                             <TrendingUp className="h-3 w-3" /> Gaining
                          </div>
                       )}
                    </div>
                 </div>
               )
             })
           )}
        </div>
      </section>
    </div>
  )
}
