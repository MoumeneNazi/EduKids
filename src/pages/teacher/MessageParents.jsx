import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Send, User as UserIcon, MessageSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function MessageParents() {
  const [messages, setMessages] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ receiver_id: '', content: '' })
  const { t } = useTranslation()

  useEffect(() => {
    async function load() {
      try {
        const [m, s] = await Promise.all([
          apiFetch('/messages'),
          apiFetch('/students'),
        ])
        setMessages(m)
        setStudents(s)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleSend(e) {
    e.preventDefault()
    if (!form.receiver_id || !form.content) return
    try {
      await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm({ ...form, content: '' })
      const m = await apiFetch('/messages')
      setMessages(m)
    } catch (err) {
      alert(err.message)
    }
  }

  if (loading) return <LoadingSpinner label={t('teacher.messages.title')} />

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
       <header className="flex items-center gap-4 bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
        <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
           <MessageSquare className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight">{t('teacher.messages.title')}</h2>
          <p className="text-sm font-bold text-slate-400 mt-1">{t('teacher.messages.subtitle')}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
         <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 h-fit">
            <h3 className="text-xl font-black text-slate-900 mb-8">{t('teacher.messages.compose')}</h3>
            <form onSubmit={handleSend} className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('teacher.messages.target')}</label>
                  <select
                    value={form.receiver_id}
                    onChange={(e) => setForm({ ...form, receiver_id: e.target.value })}
                    className="w-full rounded-2xl border-none ring-1 ring-slate-200 bg-slate-50 px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow cursor-pointer"
                  >
                     <option value="">{t('teacher.messages.select')}</option>
                     {students.map(s => (
                       <option key={s.id} value={s.parent_id}>{s.name} ({s.class_level})</option>
                     ))}
                  </select>
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('teacher.messages.content')}</label>
                  <textarea
                    rows={6}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder={t('teacher.messages.placeholder')}
                    className="w-full rounded-2xl border-none ring-1 ring-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow resize-none"
                  />
               </div>
               <button 
                 type="submit" 
                 disabled={!form.receiver_id || !form.content}
                 className="flex w-full items-center justify-center gap-3 rounded-2xl bg-indigo-600 py-4 text-sm font-black text-white shadow-xl hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
               >
                  <Send className="h-5 w-5" /> {t('teacher.messages.dispatch')}
               </button>
            </form>
         </section>

         <section className="flex flex-col h-[600px] bg-slate-50/50 rounded-3xl border border-slate-100 overflow-hidden">
            <div className="p-6 bg-white border-b border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <MessageSquare className="h-4 w-4 text-indigo-500" /> {t('teacher.messages.recent')}
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {messages.map(m => (
                 <div key={m.id} className="bg-white p-5 rounded-3xl border border-slate-100 relative group shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-3">
                       <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500">
                          <UserIcon className="h-4 w-4" />
                       </div>
                       <div>
                          <span className="text-xs font-black uppercase tracking-widest text-slate-900 block leading-none mb-1">
                            {m.sender_role}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(m.sent_at).toLocaleDateString()} at {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                       </div>
                    </div>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed pl-12">{m.content}</p>
                    <div className="absolute top-0 left-0 w-1 h-0 bg-indigo-500 rounded-tl-3xl rounded-bl-3xl transition-all group-hover:h-full" />
                 </div>
               ))}
               {messages.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center pt-12">
                    <MessageSquare className="h-12 w-12 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">{t('teacher.messages.empty')}</p>
                 </div>
               )}
            </div>
         </section>
      </div>
    </div>
  )
}
