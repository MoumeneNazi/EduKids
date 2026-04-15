import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Save, AlertCircle, BookOpen, Link as LinkIcon, FileText, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function GradeBook() {
  const { courseId } = useParams()
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedGrades, setEditedGrades] = useState({}) // studentId-assignmentId -> score
  const [viewingSub, setViewingSub] = useState(null) // submission object

  useEffect(() => {
    async function load() {
      try {
        const [pivotRes, subRes] = await Promise.all([
          apiFetch(`/grades/pivot/${courseId}`),
          apiFetch(`/submissions?course_id=${courseId}`)
        ])
        setData(pivotRes)
        setSubmissions(Array.isArray(subRes) ? subRes : [])
      } catch (err) {
        toast.error('Failed to load gradebook')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  const handleScoreChange = (studentId, assignmentId, score) => {
    setEditedGrades(prev => ({
      ...prev,
      [`${studentId}-${assignmentId}`]: score === '' ? '' : parseFloat(score)
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const promises = Object.entries(editedGrades).map(([key, score]) => {
        const [studentId, assignmentId] = key.split('-')
        if (score === '') return Promise.resolve()
        return apiFetch('/grades', {
          method: 'POST',
          body: JSON.stringify({
            student_id: parseInt(studentId),
            assignment_id: parseInt(assignmentId),
            course_id: parseInt(courseId),
            score: parseFloat(score),
            max_score: data.assignments.find(a => a.id === parseInt(assignmentId))?.max_score || 20
          })
        })
      })
      await Promise.all(promises)
      toast.success('Grades updated successfully')
      setEditedGrades({})
      // Reload pivot ONLY (keep submissions memory)
      const res = await apiFetch(`/grades/pivot/${courseId}`)
      setData(res)
    } catch (err) {
      toast.error('Failed to save some grades. Scores must be >= 0.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner label={t('teacher.grades.title')} />
  if (!data) return <div className="p-12 text-center text-slate-400 font-black uppercase tracking-widest text-xs border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">{t('teacher.grades.empty')}</div>

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-slate-100 pb-8">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100">
              <BookOpen className="h-6 w-6" />
           </div>
           <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">{t('teacher.grades.title')}</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 bg-slate-100 px-3 py-1 rounded inline-block">
                {t('teacher.grades.courseId')}: {courseId}
              </p>
           </div>
        </div>
        <div className="h-12">
           {Object.keys(editedGrades).length > 0 && (
             <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center h-full gap-2 px-6 bg-emerald-500 text-white text-sm font-black rounded-xl hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:active:scale-100 animate-slide-up"
             >
               <Save className="h-4 w-4" /> {saving ? 'Saving...' : t('teacher.grades.save')}
             </button>
           )}
        </div>
      </header>

      <div className="overflow-x-auto border-2 border-slate-100 rounded-3xl bg-white shadow-sm ring-1 ring-slate-900/5">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50/80 backdrop-blur-sm shadow-[0_1px_0_0_theme(colors.slate.200)]">
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest sticky left-0 bg-slate-50 shadow-[inset_-1px_0_0_0_theme(colors.slate.200)] z-10 w-64">{t('teacher.grades.studentName')}</th>
              {data.assignments.map(assignment => (
                <th key={assignment.id} className="px-6 py-5 border-l border-slate-100 min-w-[160px] max-w-[200px]">
                  <div className="text-[10px] font-black text-indigo-900 uppercase tracking-widest truncate" title={assignment.title}>{assignment.title}</div>
                  <div className="text-[9px] mt-1 font-bold text-slate-400">MAX: {assignment.max_score}</div>
                </th>
              ))}
              <th className="px-6 py-5 text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] border-l border-slate-200 bg-slate-100/50 w-32 text-center">{t('teacher.grades.average')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.map(row => {
              const scores = data.assignments.map(a => editedGrades[`${row.student_id}-${a.id}`] ?? row.grades[a.id] ?? '')
              const numericScores = scores.filter(s => s !== '' && !isNaN(s))
              const avg = numericScores.length > 0 ? (numericScores.reduce((a, b) => a + b, 0) / numericScores.length).toFixed(1) : '-'

              return (
                <tr key={row.student_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-black text-slate-800 sticky left-0 bg-white shadow-[inset_-1px_0_0_0_theme(colors.slate.100)] z-10">{row.student_name}</td>
                  {data.assignments.map(assignment => {
                    const value = editedGrades[`${row.student_id}-${assignment.id}`] ?? row.grades[assignment.id] ?? ''
                    const isEdited = `${row.student_id}-${assignment.id}` in editedGrades
                    const submission = submissions.find(s => s.assignment_id === assignment.id && s.student_id === row.student_id)
                    
                    return (
                      <td key={assignment.id} className="p-0 border-l border-slate-100 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 relative">
                        {submission && (
                          <button 
                             onClick={() => setViewingSub({ ...submission, student_name: row.student_name, assignment_title: assignment.title })}
                             className="absolute top-1 right-1 bg-amber-100 text-amber-600 p-1 rounded hover:bg-amber-200 transition-colors z-0"
                             title="View Submission"
                          >
                             <FileText className="h-3 w-3" />
                          </button>
                        )}
                        <input 
                          type="number"
                          min="0"
                          max={assignment.max_score}
                          step="0.5"
                          value={value}
                          onChange={(e) => handleScoreChange(row.student_id, assignment.id, e.target.value)}
                          className={`w-full h-full p-4 pt-6 bg-transparent border-none text-center text-sm font-black focus:ring-0 ${isEdited ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-600'}`}
                          placeholder="-"
                        />
                      </td>
                    )
                  })}
                  <td className="px-6 py-4 text-xs font-black text-slate-500 text-center border-l border-slate-100 bg-slate-50/30">{avg}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 border-2 border-slate-100 rounded-2xl bg-slate-50">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest px-3 py-1 bg-white rounded-md border border-slate-200">
           <AlertCircle className="h-3 w-3 text-indigo-500" /> {t('teacher.grades.guidelines')}
        </div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-8">
           <span className="flex items-center gap-2">
             <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500 shadow-sm" /> Edited internally
           </span>
           <span className="flex items-center gap-2">
             <div className="h-2.5 w-2.5 rounded-sm bg-amber-400 shadow-sm" /> 
             <FileText className="h-3 w-3" /> Has Student Submission
           </span>
        </div>
      </div>

      {/* Submission Modal Window */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-slide-up">
              <button 
                onClick={() => setViewingSub(null)}
                className="absolute top-4 right-4 bg-slate-100 p-2 rounded-full text-slate-400 hover:text-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
              
              <h3 className="text-xl font-black text-slate-900">{viewingSub.assignment_title}</h3>
              <p className="text-sm font-bold text-slate-500 mb-6">Submitted by: {viewingSub.student_name}</p>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium text-slate-700 whitespace-pre-wrap max-h-60 overflow-y-auto">
                 {viewingSub.text_content ? `"${viewingSub.text_content}"` : <span className="italic text-slate-400">No text provided.</span>}
              </div>

              {viewingSub.file_url && (
                 <div className="mt-4">
                   <a 
                     href={viewingSub.file_url} 
                     target="_blank" 
                     rel="noreferrer" 
                     className="flex items-center gap-2 bg-indigo-50 text-indigo-600 font-bold px-4 py-3 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors w-max"
                   >
                     <LinkIcon className="h-4 w-4" /> Open Attached File Link
                   </a>
                 </div>
              )}
           </div>
        </div>
      )}

    </div>
  )
}
