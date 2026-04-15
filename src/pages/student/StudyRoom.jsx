import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { FileText, Video, ExternalLink, Search, BookOpen, Library } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function StudyRoom() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const { t } = useTranslation()

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch('/courses')
        const mats = res.filter(c => c.material_url || c.video_url).map(c => ({
          id: c.id,
          title: c.title,
          subject: c.subject,
          type: c.material_type || (c.video_url ? 'video' : 'pdf'),
          url: c.material_url || c.video_url,
          date: c.created_at
        }))
        setMaterials(mats)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = materials.filter(m => 
    m.title.toLowerCase().includes(filter.toLowerCase()) || 
    m.subject.toLowerCase().includes(filter.toLowerCase())
  )

  if (loading) return <LoadingSpinner label={t('student.studyRoom.title')} />

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-cyan-100 to-blue-200 p-8 rounded-3xl shadow-sm border border-cyan-200">
        <div className="flex items-center gap-4">
          <Library className="h-12 w-12 text-cyan-600" />
          <div>
            <h2 className="text-4xl font-black tracking-tight text-cyan-900">{t('student.studyRoom.title')}</h2>
            <p className="text-sm font-bold text-cyan-700 mt-2">{t('student.studyRoom.subtitle')}</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
           <input 
            type="text"
            placeholder={t('student.studyRoom.search')}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border-b-4 border-cyan-200 text-sm font-bold rounded-2xl focus:border-cyan-400 focus:outline-none transition-colors shadow-sm"
           />
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(material => (
          <div key={material.id} className="group flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm border-b-4 border-slate-200 hover:-translate-y-2 hover:border-cyan-300 hover:shadow-xl transition-all duration-300 h-56">
            <div>
               <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl border-b-2 ${material.type === 'video' ? 'bg-amber-100 text-amber-600 border-amber-200' : 'bg-indigo-100 text-indigo-600 border-indigo-200'}`}>
                     {material.type === 'video' ? <Video className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                    {material.subject}
                  </span>
               </div>
               <h3 className="text-lg font-black text-slate-900 line-clamp-2 leading-snug group-hover:text-cyan-600 transition-colors">
                 {material.title}
               </h3>
            </div>

            <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-slate-50">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(material.date).toLocaleDateString()}
               </span>
               <a 
                href={material.url.startsWith('http') ? material.url : `http://localhost:8000${material.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-black text-white bg-slate-900 px-4 py-2 rounded-xl hover:bg-cyan-600 hover:scale-105 active:scale-95 transition-all shadow-md"
               >
                 {material.type === 'video' ? t('student.studyRoom.watch') : t('student.studyRoom.download')}
                 <ExternalLink className="h-3.5 w-3.5" />
               </a>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center border-4 border-dashed border-cyan-100 rounded-3xl bg-cyan-50/50">
             <BookOpen className="h-12 w-12 text-cyan-300 mx-auto mb-6" />
             <p className="text-sm font-black text-cyan-600 uppercase tracking-[0.2em]">{t('student.studyRoom.empty')}</p>
          </div>
        )}
      </div>

      <div className="p-10 bg-slate-900 rounded-3xl text-center shadow-xl border-b-8 border-slate-950 relative overflow-hidden">
         <div className="absolute -top-10 -right-10 text-9xl opacity-10">💡</div>
         <h3 className="text-xl font-black text-white mb-4 uppercase tracking-widest">{t('student.studyRoom.protip')}</h3>
         <p className="text-cyan-300 text-lg font-medium italic max-w-2xl mx-auto leading-relaxed">
           "{t('student.studyRoom.quote')}"
         </p>
      </div>
    </div>
  )
}
