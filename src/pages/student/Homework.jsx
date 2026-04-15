import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useTranslation } from 'react-i18next'
import { PenTool, CheckCircle, Clock, Link as LinkIcon, UploadCloud, FileText } from 'lucide-react'

export default function Homework() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [assignments, setAssignments] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [submittingId, setSubmittingId] = useState(null)
  
  // Local state for what the user is typing/pasting
  const [drafts, setDrafts] = useState({})

  useEffect(() => {
    if (!profile) return
    async function load() {
      setLoading(true)
      try {
        const [assnRes, subRes] = await Promise.all([
          apiFetch('/assignments?type=homework'),
          apiFetch('/submissions')
        ])
        setAssignments(Array.isArray(assnRes) ? assnRes : [])
        setSubmissions(Array.isArray(subRes) ? subRes : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [profile])

  const handleDraftChange = (id, field, value) => {
    setDrafts(prev => ({
      ...prev,
      [id]: { ...(prev[id] || { text_content: '', file_url: '' }), [field]: value }
    }))
  }

  const handleSubmit = async (assignmentId) => {
    setSubmittingId(assignmentId)
    const draft = drafts[assignmentId] || { text_content: '', file_url: '' }
    try {
      const res = await apiFetch('/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           assignment_id: assignmentId,
           text_content: draft.text_content,
           file_url: draft.file_url || null
        })
      })
      // Update local submissions
      setSubmissions(prev => {
        const filtered = prev.filter(s => s.assignment_id !== assignmentId)
        return [res, ...filtered]
      })
      setDrafts(prev => {
        const newD = { ...prev }
        delete newD[assignmentId]
        return newD
      })
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) return <LoadingSpinner label="Loading homework..." />

  if (assignments.length === 0) {
    return (
      <div className="max-w-3xl mx-auto rounded-3xl bg-amber-50 border-4 border-dashed border-amber-200 p-12 text-center">
        <div className="text-6xl mb-6">🎈</div>
        <p className="text-xl font-bold text-amber-900">{t('student.homework.empty', 'No homework assigned!')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <header className="flex items-center gap-4 bg-rose-100 p-6 rounded-2xl border-b-4 border-rose-200 shadow-sm">
         <PenTool className="h-10 w-10 text-rose-600" />
         <div>
            <h2 className="text-3xl font-black text-rose-900 tracking-tight">{t('student.homework.title', 'My Homework')}</h2>
            <p className="text-sm font-bold text-rose-700">Complete assignments to earn XP</p>
         </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {assignments.map((hw) => {
          const submission = submissions.find(s => s.assignment_id === hw.id)
          const draft = drafts[hw.id] || { text_content: '', file_url: '' }
          const isSubmitted = !!submission

          return (
            <div
              key={hw.id}
              className={`group flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm border-b-4 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ${isSubmitted ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-rose-300'}`}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-500 bg-slate-50 inline-block px-3 py-1 rounded-full border border-slate-100 mb-3">
                  {hw.subject ?? 'Homework'}
                </p>
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  {hw.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-slate-500">{hw.description}</p>
              </div>
              
              <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                 <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                   <Clock className="h-4 w-4" /> Due {new Date(hw.due_date).toLocaleDateString()}
                 </div>
                 {isSubmitted && (
                   <span className="flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-emerald-500 bg-emerald-50 px-2 py-1 rounded">
                     <CheckCircle className="h-3 w-3" /> Submitted
                   </span>
                 )}
              </div>

              {isSubmitted ? (
                 <div className="mt-auto bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-900 text-sm">
                    <p className="font-bold mb-2">My Submission:</p>
                    {submission.text_content && (
                       <p className="italic text-emerald-700 mb-2 truncate">"{submission.text_content}"</p>
                    )}
                    {submission.file_url && (
                       <a href={submission.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-black text-emerald-600 hover:text-emerald-500 hover:underline">
                         <LinkIcon className="h-4 w-4" /> View Linked File
                       </a>
                    )}
                 </div>
              ) : (
                 <div className="mt-auto space-y-3">
                    <textarea
                      rows={2}
                      value={draft.text_content}
                      onChange={e => handleDraftChange(hw.id, 'text_content', e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 p-4 text-sm font-medium text-slate-800 outline-none focus:border-rose-400 focus:bg-white transition-all resize-none"
                    />
                    
                    <div className="flex items-center bg-slate-50 rounded-xl border-2 border-slate-100 focus-within:border-rose-400 focus-within:bg-white transition-all px-4 py-2">
                       <LinkIcon className="h-4 w-4 text-slate-400 mr-2" />
                       <input 
                         type="url" 
                         value={draft.file_url}
                         onChange={e => handleDraftChange(hw.id, 'file_url', e.target.value)}
                         placeholder="Paste a Google Drive or PDF link..."
                         className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:font-medium placeholder:text-slate-400"
                       />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => handleSubmit(hw.id)}
                      disabled={submittingId === hw.id || (!draft.text_content && !draft.file_url)}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-6 py-3.5 text-sm font-black text-white hover:bg-rose-600 active:scale-[0.98] transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 disabled:active:scale-100"
                    >
                       <UploadCloud className="h-5 w-5" /> {submittingId === hw.id ? 'Submitting...' : t('student.homework.submit', 'Turn In Homework')}
                    </button>
                 </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
