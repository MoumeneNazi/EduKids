import { useState, useEffect } from 'react'
import { Megaphone } from 'lucide-react'
import { apiFetch } from '../../api/client'
import { useTranslation } from 'react-i18next'

export default function AnnouncementsWidget() {
  const { t } = useTranslation()
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch('/announcements')
        setAnnouncements(data.slice(0, 3)) // show only latest 3
      } catch(e) {
        // fail silently for widget
      }
    }
    load()
  }, [])

  if (announcements.length === 0) return null

  return (
    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 shadow-sm mb-8 animate-fade-in">
       <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-inner">
             <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-amber-900 tracking-tight">Recent Broadcasts</h3>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Important Updates</p>
          </div>
       </div>
       
       <div className="space-y-4">
          {announcements.map(ann => (
             <div key={ann.id} className="bg-white border text-amber-900 border-amber-100 p-4 rounded-xl hover:border-amber-300 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-2">
                   <h4 className="font-extrabold">{ann.title}</h4>
                   <span className="text-[9px] font-black uppercase text-amber-500 whitespace-nowrap bg-amber-100 px-2 py-1 rounded">
                     {new Date(ann.created_at).toLocaleDateString()}
                   </span>
                </div>
                <p className="text-sm font-medium text-slate-600 line-clamp-2">{ann.content}</p>
             </div>
          ))}
       </div>
    </div>
  )
}
