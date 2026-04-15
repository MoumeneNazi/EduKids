import { useEffect, useState } from 'react'
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { MessageSquare, TrendingUp, GraduationCap, MessageCircle } from 'lucide-react'
import ParentChat from './ParentChat'
import { useTranslation } from 'react-i18next'

export default function ParentDashboard() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [children, setChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState('')
  const [stats, setStats] = useState({ avgGrade: 0, attendancePct: 0, unreadMessages: 0 })
  const [gradeTrend, setGradeTrend] = useState([])
  const [courseProgress, setCourseProgress] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function load() {
      setLoading(true)
      try {
        const studentsRes = await apiFetch('/students')
        const kids = Array.isArray(studentsRes) ? studentsRes : []
        setChildren(kids)
        
        if (kids.length > 0) {
           setSelectedChildId(String(kids[0].user_id))
           setSelectedChild(kids[0])
           await loadChildData(kids[0].user_id)
        } else {
           setLoading(false)
        }
      } catch (err) {
        setLoading(false)
      }
    }
    load()
  }, [user])

  async function loadChildData(userId) {
    try {
      const [grades, attendance, courses] = await Promise.all([
        apiFetch(`/grades?student_id=${userId}`),
        apiFetch(`/attendance?student_id=${userId}`),
        apiFetch(`/courses`),
      ])

      const avg = grades.length > 0 
        ? Math.round(grades.reduce((acc, g) => acc + (g.score / g.max_score), 0) / grades.length * 100)
        : 0
      
      const attPct = attendance.length > 0
        ? Math.round(attendance.filter(a => a.status === 'present').length / attendance.length * 100)
        : 100

      setStats({
        avgGrade: avg,
        attendancePct: attPct,
        unreadMessages: 0
      })

      const progress = courses.map(c => {
         const courseGrades = grades.filter(g => g.course_id === c.id)
         const courseAvg = courseGrades.length > 0 
            ? Math.round(courseGrades.reduce((acc, g) => acc + (g.score / g.max_score), 0) / courseGrades.length * 100)
            : 0
         return { id: c.id, title: c.title, avg: courseAvg, count: courseGrades.length }
      })
      setCourseProgress(progress)

      const trend = grades.slice(-5).map((g, i) => ({
        week: `Week ${i+1}`,
        grade: Math.round((g.score / g.max_score) * 100)
      }))
      setGradeTrend(trend)
    } finally {
      setLoading(false)
    }
  }

  const handleChildChange = (userId) => {
    setSelectedChildId(userId)
    const child = children.find(c => String(c.user_id) === String(userId))
    setSelectedChild(child)
    loadChildData(userId)
  }

  if (loading) return <LoadingSpinner label={t('parent.dashboard.title')} />

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-teal-50 to-emerald-100 p-8 rounded-3xl shadow-sm border border-emerald-100">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-emerald-900">{t('parent.dashboard.title')}</h2>
          <p className="text-sm font-medium text-emerald-700 mt-2">{t('parent.dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-sm border border-emerald-100 relative">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('parent.dashboard.child')}</span>
          <select
            value={selectedChildId}
            onChange={(e) => handleChildChange(e.target.value)}
            className="border-none bg-transparent outline-none text-sm font-bold text-slate-800 focus:ring-0 cursor-pointer pl-0 pr-8"
          >
            {children.map((child) => (
              <option key={child.user_id} value={child.user_id}>
                {child.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="border border-sky-100 p-8 rounded-3xl bg-sky-50 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 h-24 w-24 bg-sky-100 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-2">{t('parent.dashboard.avgGrade')}</div>
            <div className="text-5xl font-black text-sky-900">{stats.avgGrade}%</div>
          </div>
        </div>
        <div className="border border-emerald-100 p-8 rounded-3xl bg-emerald-50 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 h-24 w-24 bg-emerald-100 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">{t('parent.dashboard.engagement')}</div>
            <div className="text-5xl font-black text-emerald-900">{stats.attendancePct}%</div>
          </div>
        </div>
        <div className="border border-rose-100 p-8 rounded-3xl bg-rose-50 shadow-sm relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 h-24 w-24 bg-rose-100 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="relative z-10">
            <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-2">{t('parent.dashboard.unread')}</div>
            <div className="text-5xl font-black text-rose-900">{stats.unreadMessages}</div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-8">
           <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                 <GraduationCap className="h-5 w-5 text-indigo-500" /> {t('parent.dashboard.academic')}
              </h3>
              <div className="space-y-4">
                 {courseProgress.map(p => (
                   <div key={p.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-xs font-bold text-slate-700 truncate">{p.title}</span>
                         <span className="text-xs font-black text-indigo-600">{p.avg}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                         <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${p.avg}%` }} />
                      </div>
                      <div className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">{p.count} {t('parent.dashboard.assessments')}</div>
                   </div>
                 ))}
                 {courseProgress.length === 0 && (
                   <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('parent.dashboard.noProgress')}</div>
                 )}
              </div>
           </section>

           <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                 <TrendingUp className="h-5 w-5 text-emerald-500" /> {t('parent.dashboard.velocity')}
              </h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeTrend}>
                    <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="stepAfter" dataKey="grade" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
           </section>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
               <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                  <MessageSquare className="h-5 w-5 text-sky-500" /> {t('parent.dashboard.connect')}
               </h3>
               {selectedChild?.teacher_id ? (
                 <ParentChat 
                   teacherId={selectedChild.teacher_id} 
                   teacherName={selectedChild.teacher_name} 
                 />
               ) : (
                 <div className="flex-1 min-h-[400px] border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-slate-50/50">
                    <div className="text-center">
                       <MessageCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('parent.dashboard.noInstructor')}</p>
                    </div>
                 </div>
               )}
           </div>
        </div>
      </div>
    </div>
  )
}
