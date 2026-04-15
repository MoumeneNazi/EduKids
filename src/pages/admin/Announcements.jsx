import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Megaphone, Plus, Trash2, Send, Users, User, GraduationCap, ShieldAlert } from 'lucide-react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function Announcements() {
  const { t } = useTranslation()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({ title: '', content: '', target_role: 'all' })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    try {
      const data = await apiFetch('/announcements')
      setAnnouncements(data)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiFetch('/announcements', {
        method: 'POST',
        body: JSON.stringify(form)
      })
      setForm({ title: '', content: '', target_role: 'all' })
      setShowForm(false)
      load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return
    try {
      await apiFetch(`/announcements/${id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  const getRoleIcon = (role) => {
     switch(role) {
       case 'all': return <Users className="h-4 w-4" />
       case 'student': return <GraduationCap className="h-4 w-4" />
       case 'teacher': return <User className="h-4 w-4" />
       case 'parent': return <ShieldAlert className="h-4 w-4" />
       default: return <Users className="h-4 w-4" />
     }
  }

  if (loading) return <LoadingSpinner label="Announcements" />

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900 border-b-4 border-amber-500 p-8 shadow-[8px_8px_0_0_theme(colors.slate.900)]">
        <div className="flex items-center gap-5">
           <div className="h-14 w-14 bg-amber-500 flex items-center justify-center border-2 border-slate-900 text-slate-900 shadow-inner">
              <Megaphone className="h-7 w-7" />
           </div>
           <div>
             <h2 className="text-4xl font-black tracking-tighter text-white">Broadcasts</h2>
             <p className="text-sm font-bold text-slate-400 mt-2">Manage School-Wide Announcements</p>
           </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="flex items-center gap-2 bg-amber-500 text-slate-900 px-6 py-3 font-black uppercase tracking-widest text-sm hover:bg-amber-400 active:bg-amber-600 transition-colors shadow-[4px_4px_0_0_#fff]"
        >
          {showForm ? 'Cancel' : <><Plus className="h-4 w-4"/> New Broadcast</>}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-4 border-amber-200 p-8 shadow-sm space-y-6 animate-slide-up">
           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Subject / Title</label>
                 <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. School Closure Tomorrow" className="w-full bg-slate-50 border-b-4 border-slate-200 focus:border-amber-400 px-4 py-3 font-bold outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Audience</label>
                 <select value={form.target_role} onChange={e => setForm({...form, target_role: e.target.value})} className="w-full bg-slate-50 border-b-4 border-slate-200 focus:border-amber-400 px-4 py-3 font-bold outline-none transition-colors cursor-pointer">
                    <option value="all">Everyone</option>
                    <option value="student">Students Only</option>
                    <option value="parent">Parents Only</option>
                    <option value="teacher">Teachers Only</option>
                 </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Message Content</label>
                 <textarea required rows={4} value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Write the announcement details here..." className="w-full bg-slate-50 border-b-4 border-slate-200 focus:border-amber-400 px-4 py-3 font-bold outline-none transition-colors resize-none" />
              </div>
           </div>
           
           <button disabled={submitting} type="submit" className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-4 uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50">
              <Send className="h-5 w-5" /> {submitting ? 'Broadcasting...' : 'Broadcast Announcement'}
           </button>
        </form>
      )}

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className="bg-white border-2 border-slate-100 p-6 flex flex-col md:flex-row gap-6 relative group overflow-hidden">
             {/* Decorative side bar */}
             <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
             
             <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                   <h3 className="text-xl font-black text-slate-800">{ann.title}</h3>
                   <span className="flex items-center gap-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                     {getRoleIcon(ann.target_role)} {ann.target_role}
                   </span>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {new Date(ann.created_at).toLocaleString()}
                </p>
             </div>
             
             <button onClick={() => handleDelete(ann.id)} className="self-end md:self-center h-10 w-10 flex items-center justify-center bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">
                <Trash2 className="h-5 w-5" />
             </button>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="border-4 border-dashed border-slate-200 p-16 text-center">
             <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-4" />
             <p className="text-sm font-black uppercase tracking-widest text-slate-400">No broadcasts found</p>
          </div>
        )}
      </div>
    </div>
  )
}
