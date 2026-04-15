import { useState, useEffect } from 'react'
import { CalendarDays, Clock, MapPin } from 'lucide-react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from './LoadingSpinner'

export default function TimetableWidget() {
  const [events, setEvents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [evData, crsData] = await Promise.all([
          apiFetch('/timetable'),
          apiFetch('/courses')
        ])
        // Filter events for current day for brevity?
        // Let's just show next upcoming classes or today's classes
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const today = days[new Date().getDay()]
        
        const todaysEvents = evData.filter(e => e.day_of_week === today)
                                   .sort((a,b) => a.start_time.localeCompare(b.start_time))
        setEvents(todaysEvents)
        setCourses(crsData)
      } catch(e) {
        // fail silently
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return null

  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-sm animate-fade-in flex flex-col mb-8 h-full">
       <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-inner">
             <CalendarDays className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-indigo-900 tracking-tight">Today's Schedule</h3>
            <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric'})}
            </p>
          </div>
       </div>
       
       <div className="space-y-4 flex-1">
          {events.length === 0 ? (
             <div className="flex-1 flex items-center justify-center bg-white rounded-xl border border-indigo-100 py-10">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-400">No classes scheduled today</p>
             </div>
          ) : (
            events.map(ev => {
               const course = courses.find(c => c.id === ev.course_id)
               return (
                  <div key={ev.id} className="bg-white border border-indigo-100 p-4 rounded-xl hover:border-indigo-300 transition-colors shadow-sm relative overflow-hidden">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400" />
                     <h4 className="font-extrabold text-indigo-900 mb-2 truncate">
                       {course ? course.title : 'Unknown Course'}
                     </h4>
                     <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-amber-500"/> {ev.start_time}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-emerald-500"/> {ev.room}</span>
                     </div>
                  </div>
               )
            })
          )}
       </div>
    </div>
  )
}
