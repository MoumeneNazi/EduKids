import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Plus, Video, Book, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ManageCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ title: '', subject: '', class_level: 'CM1', video_url: '' })
  const { t } = useTranslation()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await apiFetch('/courses')
      setCourses(data)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    try {
      await apiFetch('/courses', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm({ title: '', subject: '', class_level: 'CM1', video_url: '' })
      setShowAdd(false)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <LoadingSpinner label={t('teacher.courses.title')} />

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b-2 border-slate-100 pb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">{t('teacher.courses.title')}</h2>
          <p className="text-sm font-bold text-slate-500 mt-2">{t('teacher.courses.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className={`flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-black transition-all shadow-md ${
            showAdd ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-indigo-200'
          }`}
        >
          {showAdd ? <><X className="h-4 w-4" /> {t('teacher.courses.close')}</> : (
            <><Plus className="h-4 w-4" /> {t('teacher.courses.newCourse')}</>
          )}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white border-2 border-indigo-100 rounded-3xl p-8 space-y-8 animate-slide-up shadow-sm">
           <h3 className="text-xl font-black text-indigo-900">{t('teacher.courses.create')}</h3>
           <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('teacher.courses.courseTitle')}</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Introduction to Fractions"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('teacher.courses.subject')}</label>
                <input
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Mathematics"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('teacher.courses.classLevel')}</label>
                <select
                  value={form.class_level}
                  onChange={(e) => setForm({ ...form, class_level: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm cursor-pointer"
                >
                  <option>CP</option><option>CE1</option><option>CE2</option><option>CM1</option><option>CM2</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('teacher.courses.video')}</label>
                <input
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  placeholder="YouTube/Vimeo link"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                />
              </div>
           </div>
           <button type="submit" className="w-full rounded-xl bg-slate-900 py-4 text-sm font-black text-white shadow-xl hover:bg-slate-800 active:scale-[0.98] transition-all">
              {t('teacher.courses.init')}
           </button>
        </form>
      )}

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => (
          <div key={c.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 hover:border-indigo-100 group">
            <div className="bg-indigo-50 p-8 flex items-center justify-between border-b border-indigo-100">
               <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Book className="h-5 w-5 text-indigo-500" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 px-4 py-1.5 rounded-full shadow-sm">
                 {c.class_level}
               </span>
            </div>
            <div className="p-8">
               <h4 className="text-xl font-black text-slate-900 truncate mb-1">{c.title}</h4>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.subject}</p>
               
               <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                     {c.video_url ? <Video className="h-4 w-4 text-sky-500" /> : <Book className="h-4 w-4 text-emerald-500" />}
                     <span className="text-[9px] font-black uppercase tracking-widest">
                       {c.video_url ? 'Video Lesson' : 'Standard'}
                     </span>
                  </div>
                  <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all shadow-sm hover:shadow-md">
                     <Trash2 className="h-4 w-4" />
                  </button>
               </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full py-24 text-center border-4 border-dashed border-slate-100 rounded-3xl bg-slate-50">
             <Book className="h-12 w-12 text-slate-300 mx-auto mb-4" />
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t('teacher.courses.empty')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
