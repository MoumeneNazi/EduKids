import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Trash2, Clock, MapPin, BookOpen } from 'lucide-react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

export default function Timetable() {
  const [events, setEvents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    course_id: '',
    day_of_week: 'Monday',
    start_time: '08:00',
    end_time: '09:30',
    room: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [eventsData, coursesData] = await Promise.all([
        apiFetch('/timetable'),
        apiFetch('/courses')
      ])
      setEvents(eventsData)
      setCourses(coursesData)
      if (coursesData.length > 0) {
        setForm(f => ({ ...f, course_id: coursesData[0].id }))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await apiFetch('/timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
           course_id: parseInt(form.course_id),
           day_of_week: form.day_of_week,
           start_time: form.start_time,
           end_time: form.end_time,
           room: form.room
        })
      })
      setShowForm(false)
      loadData()
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this class from the schedule?')) return
    try {
      await apiFetch(`/timetable/${id}`, { method: 'DELETE' })
      loadData()
    } catch (err) {
      alert(err.message)
    }
  }

  const eventsByDay = DAYS.reduce((acc, day) => {
    acc[day] = events.filter(e => e.day_of_week === day).sort((a,b) => a.start_time.localeCompare(b.start_time))
    return acc
  }, {})

  if (loading) return <LoadingSpinner label="Timetable" />

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900 border-b-4 border-indigo-500 p-8 shadow-[8px_8px_0_0_theme(colors.slate.900)]">
        <div className="flex items-center gap-5">
           <div className="h-14 w-14 bg-indigo-500 flex items-center justify-center border-2 border-slate-900 text-white shadow-inner">
              <CalendarDays className="h-7 w-7" />
           </div>
           <div>
             <h2 className="text-4xl font-black tracking-tighter text-white">Timetable</h2>
             <p className="text-sm font-bold text-slate-400 mt-2">Manage Weekly Class Schedules</p>
           </div>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)} 
          className="flex items-center gap-2 bg-indigo-500 text-white px-6 py-3 font-black uppercase tracking-widest text-sm hover:bg-indigo-400 active:bg-indigo-600 transition-colors shadow-[4px_4px_0_0_#fff]"
        >
          {showForm ? 'Cancel' : <><Plus className="h-4 w-4"/> Assign Class</>}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border-4 border-indigo-200 p-8 shadow-sm space-y-6 animate-slide-up">
           <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="space-y-2 lg:col-span-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Course / Subject</label>
                 <select required value={form.course_id} onChange={e => setForm({...form, course_id: e.target.value})} className="w-full bg-slate-50 border-b-4 border-slate-200 focus:border-indigo-400 px-4 py-3 font-bold outline-none transition-colors cursor-pointer">
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.class_level})</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Day</label>
                 <select value={form.day_of_week} onChange={e => setForm({...form, day_of_week: e.target.value})} className="w-full bg-slate-50 border-b-4 border-slate-200 focus:border-indigo-400 px-4 py-3 font-bold outline-none transition-colors cursor-pointer">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Start Time</label>
                 <input type="time" required value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} className="w-full bg-slate-50 border-b-4 border-slate-200 focus:border-indigo-400 px-4 py-3 font-bold outline-none transition-colors" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">End Time</label>
                 <input type="time" required value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} className="w-full bg-slate-50 border-b-4 border-slate-200 focus:border-indigo-400 px-4 py-3 font-bold outline-none transition-colors" />
              </div>
              <div className="space-y-2 lg:col-span-5">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Room Location</label>
                 <input required value={form.room} onChange={e => setForm({...form, room: e.target.value})} placeholder="e.g. Science Lab B" className="w-full bg-slate-50 border-b-4 border-slate-200 focus:border-indigo-400 px-4 py-3 font-bold outline-none transition-colors" />
              </div>
           </div>
           
           <button disabled={submitting} type="submit" className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-black py-4 uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50 mt-4">
              <CalendarDays className="h-5 w-5" /> {submitting ? 'Adding...' : 'Add to Schedule'}
           </button>
        </form>
      )}

      {/* Grid View */}
      <div className="flex overflow-x-auto pb-4 snap-x border-t-2 border-slate-100 pt-8">
         <div className="flex min-w-max w-full gap-4">
            {DAYS.map(day => (
              <div key={day} className="flex-1 min-w-[280px] snap-center">
                 <h3 className="text-center font-black uppercase tracking-[0.2em] text-slate-400 mb-6 pb-2 border-b-4 border-indigo-100">
                    {day}
                 </h3>
                 <div className="space-y-4">
                    {eventsByDay[day].length === 0 ? (
                       <div className="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl w-full">
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Free Day</p>
                       </div>
                    ) : (
                       eventsByDay[day].map(ev => {
                         const course = courses.find(c => c.id === ev.course_id)
                         return (
                           <div key={ev.id} className="bg-indigo-50 border-2 border-indigo-100 rounded-2xl p-5 relative group hover:-translate-y-1 hover:border-indigo-300 transition-all shadow-sm">
                              <button onClick={() => handleDelete(ev.id)} className="absolute top-3 right-3 h-8 w-8 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white">
                                 <Trash2 className="h-4 w-4" />
                              </button>
                              
                              <div className="flex items-center gap-2 text-indigo-700 font-black mb-1">
                                 <BookOpen className="h-4 w-4" />
                                 {course ? course.title : 'Unknown Course'}
                              </div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 ml-6 pl-1 border-l-2 border-indigo-200">
                                {course ? course.class_level : ''}
                              </p>
                              
                              <div className="flex flex-col gap-2 bg-white p-3 rounded-xl border border-indigo-50 mt-auto">
                                 <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                    <Clock className="h-4 w-4 text-amber-500" />
                                    {ev.start_time} - {ev.end_time}
                                 </div>
                                 <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                    <MapPin className="h-4 w-4 text-emerald-500" />
                                    {ev.room}
                                 </div>
                              </div>
                           </div>
                         )
                       })
                    )}
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  )
}
