import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { FileEdit, Plus, Trash2, Save, Book } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function CreateTest() {
  const { t } = useTranslation()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [form, setForm] = useState({
    course_id: '',
    title: '',
    description: '',
    due_date: '',
    max_score: 20
  })

  const [questions, setQuestions] = useState([
    { id: 1, text: '', options: ['', '', '', ''], correctIndex: 0 }
  ])

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/courses')
        setCourses(data)
        if (data.length > 0) {
          setForm(f => ({ ...f, course_id: data[0].id }))
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleAddQuestion = () => {
    setQuestions([
      ...questions, 
      { id: Date.now(), text: '', options: ['', '', '', ''], correctIndex: 0 }
    ])
  }

  const handleRemoveQuestion = (id) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter(q => q.id !== id))
  }

  const updateQuestionText = (id, text) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, text } : q))
  }

  const updateOptionText = (qId, oIdx, text) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const newOptions = [...q.options]
        newOptions[oIdx] = text
        return { ...q, options: newOptions }
      }
      return q
    }))
  }

  const updateCorrectOption = (qId, oIdx) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, correctIndex: oIdx } : q))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.course_id) return alert('Please select a course.')
    
    // Validation
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text) return alert(`Question ${i + 1} is missing text.`);
        if (q.options.some(opt => !opt)) return alert(`Question ${i + 1} has empty options.`);
    }

    setSubmitting(true)
    try {
      const payload = {
        course_id: parseInt(form.course_id),
        title: form.title,
        description: form.description,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : new Date().toISOString(),
        type: 'quiz',
        max_score: parseFloat(form.max_score),
        questions_data: JSON.stringify(questions)
      }
      
      await apiFetch('/assignments', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      alert('Test/Quiz created successfully!')
      
      // Reset
      setForm({ ...form, title: '', description: '', due_date: '', max_score: 20 })
      setQuestions([{ id: Date.now(), text: '', options: ['', '', '', ''], correctIndex: 0 }])
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner label="Create Test" />

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex items-center gap-5 bg-gradient-to-r from-teal-400 to-emerald-500 p-8 rounded-3xl shadow-lg border-4 border-white">
        <div className="h-16 w-16 bg-white flex items-center justify-center rounded-2xl text-teal-500 shadow-inner">
           <FileEdit className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white">Create Test / Quiz</h2>
          <p className="text-sm font-bold text-teal-100 mt-1">Design mathematical assessments dynamically.</p>
        </div>
      </header>

      {courses.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-sm">
             <Book className="h-16 w-16 text-slate-300 mx-auto mb-6" />
             <p className="text-slate-500 font-black uppercase tracking-widest text-sm">No courses found. Please create a course first.</p>
          </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
           {/* Basic Details */}
           <div className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                 <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span> 
                 Basic Details
              </h3>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 <div className="space-y-2 lg:col-span-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Quiz Title</label>
                   <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm" placeholder="e.g. Fractions Midterm" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Course</label>
                   <select required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm">
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Max Score</label>
                   <input type="number" step="0.5" required value={form.max_score} onChange={e => setForm({...form, max_score: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm" />
                 </div>
                 <div className="space-y-2 lg:col-span-4">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</label>
                   <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm" placeholder="Any instructions for the students?" />
                 </div>
                 <div className="space-y-2 lg:col-span-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Due Date</label>
                   <input type="datetime-local" required value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all shadow-sm" />
                 </div>
              </div>
           </div>

           {/* Questions Builder */}
           <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-8 shadow-inner space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                   <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span> 
                   Questions
                </h3>
                <button type="button" onClick={handleAddQuestion} className="flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-teal-200 transition-colors">
                   <Plus className="h-4 w-4" /> Add Question
                </button>
              </div>

              <div className="space-y-6">
                 {questions.map((q, idx) => (
                    <div key={q.id} className="bg-white rounded-2xl p-6 border-2 border-slate-100 shadow-sm relative group">
                       {questions.length > 1 && (
                         <button type="button" onClick={() => handleRemoveQuestion(q.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 h-8 w-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 hover:scale-110 shadow-sm">
                            <Trash2 className="h-4 w-4" />
                         </button>
                       )}
                       
                       <div className="flex gap-4">
                          <span className="text-2xl font-black text-slate-200 mt-1">{idx + 1}.</span>
                          <div className="flex-1 space-y-4">
                             <input required value={q.text} onChange={e => updateQuestionText(q.id, e.target.value)} className="w-full text-lg font-bold border-b-2 border-slate-200 focus:border-teal-400 bg-transparent py-2 outline-none transition-colors" placeholder="Type your question here..." />
                             
                             <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                {q.options.map((opt, oIdx) => (
                                   <div key={oIdx} className="flex items-center gap-3">
                                      <div 
                                        onClick={() => updateCorrectOption(q.id, oIdx)}
                                        className={`h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors ${q.correctIndex === oIdx ? 'border-teal-500 bg-teal-50' : 'border-slate-300 hover:border-teal-300'}`}
                                      >
                                        {q.correctIndex === oIdx && <div className="h-3 w-3 rounded-full bg-teal-500" />}
                                      </div>
                                      <input required placeholder={`Option ${oIdx + 1}`} value={opt} onChange={e => updateOptionText(q.id, oIdx, e.target.value)} className={`flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-teal-500 transition-all ${q.correctIndex === oIdx ? 'ring-1 ring-teal-200' : ''}`} />
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <button disabled={submitting} type="submit" className="w-full flex items-center justify-center gap-3 rounded-2xl bg-teal-500 py-5 text-lg font-black text-white shadow-[0_8px_0_0_theme(colors.teal.600)] hover:bg-teal-400 hover:translate-y-1 hover:shadow-[0_4px_0_0_theme(colors.teal.600)] active:translate-y-2 active:shadow-none transition-all">
              <Save className="h-6 w-6" /> {submitting ? 'Creating Test...' : 'Publish Test'}
           </button>
        </form>
      )}
    </div>
  )
}
