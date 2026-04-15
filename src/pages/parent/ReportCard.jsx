import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FileBarChart, Printer, CheckCircle, Clock } from 'lucide-react'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function ReportCard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [grades, setGrades] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // Just fetch all grades and courses
      const [gradesData, coursesData] = await Promise.all([
        apiFetch('/grades'),
        apiFetch('/courses')
      ])
      setGrades(gradesData)
      setCourses(coursesData)
    } catch (e) {
      alert(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Group grades by course
  const subjectAverages = courses.map(course => {
     const courseGrades = grades.filter(g => g.course_id === course.id)
     if (courseGrades.length === 0) return { ...course, avg: null, count: 0 }
     
     const totalScore = courseGrades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0)
     const avg = totalScore / courseGrades.length
     return { ...course, avg, count: courseGrades.length }
  }).filter(c => c.count > 0)

  const overallAvg = subjectAverages.length > 0 
      ? subjectAverages.reduce((sum, c) => sum + c.avg, 0) / subjectAverages.length 
      : 0

  if (loading) return <LoadingSpinner label={t('parent.reportCard.title')} />

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12 print:max-w-none print:p-0">
      <header className="flex items-center justify-between gap-4 bg-orange-50 p-8 rounded-3xl border border-orange-100 shadow-sm print:shadow-none print:bg-white print:border-b-2 print:border-black print:rounded-none">
        <div className="flex items-center gap-4">
           <FileBarChart className="h-10 w-10 text-orange-400 print:text-black" />
           <div>
             <h2 className="text-3xl font-black tracking-tight text-orange-900 print:text-black">{t('parent.reportCard.title')}</h2>
             <p className="text-sm font-medium text-orange-700 mt-1 print:text-slate-600">Official Student Performance Report</p>
           </div>
        </div>
        <button 
           onClick={() => window.print()}
           className="print:hidden bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-sm flex items-center gap-2"
        >
           <Printer className="h-4 w-4" /> Print PDF
        </button>
      </header>

      {subjectAverages.length === 0 ? (
        <div className="border border-slate-100 rounded-3xl bg-white p-16 text-center shadow-sm">
           <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
           <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No grades recorded yet this term.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 print:p-0 print:border-none print:shadow-none space-y-8">
           
           <div className="flex justify-between items-end border-b-4 border-slate-900 pb-4">
              <div>
                 <p className="text-sm font-black uppercase tracking-widest text-slate-400">Student ID: #EK-{user?.id?.toString().padStart(4, '0')}</p>
                 <h3 className="text-2xl font-black text-slate-900 mt-1">First Term Report</h3>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Overall Average</p>
                 <div className="text-4xl font-extrabold text-orange-500 print:text-black">
                   {overallAvg.toFixed(1)}%
                 </div>
              </div>
           </div>

           <table className="w-full text-left">
              <thead>
                 <tr className="border-b-2 border-slate-200">
                    <th className="py-3 font-black uppercase tracking-widest text-xs text-slate-400">Subject</th>
                    <th className="py-3 font-black uppercase tracking-widest text-xs text-slate-400 text-center">Assessments</th>
                    <th className="py-3 font-black uppercase tracking-widest text-xs text-slate-400 text-right">Average</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {subjectAverages.map(c => (
                    <tr key={c.id} className="group">
                       <td className="py-4">
                          <p className="font-bold text-slate-900">{c.title}</p>
                          <p className="text-xs font-medium text-slate-500">{c.subject}</p>
                       </td>
                       <td className="py-4 text-center">
                          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                             {c.count} items
                          </span>
                       </td>
                       <td className="py-4 text-right">
                          <span className={`text-lg font-black ${c.avg >= 80 ? 'text-emerald-500' : c.avg >= 60 ? 'text-amber-500' : 'text-rose-500'} print:text-black`}>
                             {c.avg.toFixed(1)}%
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>

           <div className="pt-8 border-t-2 border-slate-100 grid grid-cols-2 gap-8 print:border-black">
              <div className="space-y-4">
                 <h4 className="font-black uppercase tracking-widest text-xs text-slate-400">Teacher's Comments</h4>
                 <div className="p-4 bg-slate-50 rounded-xl border-l-4 border-orange-400 text-sm font-medium italic text-slate-700">
                   "Showing great potential and consistent effort across all subjects. Keep up the good work this semester."
                 </div>
              </div>
              <div className="flex flex-col items-end justify-end space-y-2">
                 <CheckCircle className="h-12 w-12 text-emerald-400 opacity-50 print:hidden" />
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 border-t border-slate-300 pt-2 w-48 text-center">
                   Official Signature
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* Global CSS for Print Layout */}
      <style>{`
        @media print {
          body { background: white; }
          .max-w-4xl { max-width: 100% !important; margin: 0 !important; }
          .animate-fade-in { animation: none !important; }
        }
      `}</style>
    </div>
  )
}
