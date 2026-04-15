import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Plus, BookOpen, Upload, ArrowRight, Grid, Users, LayoutList } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ lessons: 0, students: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [uploading, setUploading] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    async function load() {
      try {
        const [coursesData, studentsData] = await Promise.all([
          apiFetch('/courses'),
          apiFetch('/students'),
        ])
        setCourses(coursesData)
        setStats({
          lessons: coursesData.length,
          students: studentsData.length,
          pending: 3,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleFileUpload = async (courseId, file) => {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await apiFetch('/courses/upload-material', {
        method: 'POST',
        body: formData,
      })
      toast.success('Material uploaded successfully')
    } catch (err) {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <LoadingSpinner label={t('teacher.dashboard.title')} />

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 pb-8">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-200 shadow-sm">
              <Grid className="h-6 w-6" />
           </div>
           <div>
              <h2 className="text-3xl font-black tracking-tight text-slate-900">{t('teacher.dashboard.title')}</h2>
              <p className="text-sm font-bold text-slate-500 mt-1">{t('teacher.dashboard.subtitle')}</p>
           </div>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-slate-800 active:scale-95 transition-all shadow-md">
           <Plus className="h-4 w-4" /> {t('teacher.dashboard.newLesson')}
        </button>
      </header>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="border border-indigo-100 p-8 rounded-3xl bg-indigo-50/50 shadow-sm hover:border-indigo-200 transition-all flex justify-between items-center group">
          <div>
            <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">{t('teacher.dashboard.active')}</div>
            <div className="text-4xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{stats.lessons}</div>
          </div>
          <BookOpen className="h-12 w-12 text-indigo-200 group-hover:text-indigo-300 transition-colors" />
        </div>
        <div className="border border-sky-100 p-8 rounded-3xl bg-sky-50/50 shadow-sm hover:border-sky-200 transition-all flex justify-between items-center group">
          <div>
            <div className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2">{t('teacher.dashboard.enrolled')}</div>
            <div className="text-4xl font-black text-slate-900 group-hover:text-sky-600 transition-colors">{stats.students}</div>
          </div>
          <Users className="h-12 w-12 text-sky-200 group-hover:text-sky-300 transition-colors" />
        </div>
        <div className="border border-amber-100 p-8 rounded-3xl bg-amber-50/50 shadow-sm hover:border-amber-200 transition-all flex justify-between items-center group">
          <div>
            <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">{t('teacher.dashboard.pending')}</div>
            <div className="text-4xl font-black text-slate-900 group-hover:text-amber-600 transition-colors">{stats.pending}</div>
          </div>
          <LayoutList className="h-12 w-12 text-amber-200 group-hover:text-amber-300 transition-colors" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <section className="md:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" /> {t('teacher.dashboard.ledger')}
           </h3>
           <div className="grid gap-4 sm:grid-cols-2">
              {courses.map(course => (
                <Link 
                  key={course.id} 
                  to={`/teacher/gradebook/${course.id}`}
                  className="flex items-center justify-between border-2 border-slate-50 p-6 rounded-2xl bg-white hover:border-indigo-100 hover:shadow-md transition-all group"
                >
                   <div>
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded mb-2">
                        {course.class_level}
                      </span>
                      <p className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[150px]">{course.title}</p>
                   </div>
                   <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                     <ArrowRight className="h-5 w-5" />
                   </div>
                </Link>
              ))}
           </div>
        </section>

        <section className="bg-slate-900 rounded-3xl p-8 shadow-xl text-white flex flex-col justify-center text-center relative overflow-hidden">
           <div className="absolute -top-10 -right-10 h-32 w-32 bg-indigo-500 rounded-full opacity-20 blur-3xl" />
           <div className="absolute -bottom-10 -left-10 h-32 w-32 bg-sky-500 rounded-full opacity-20 blur-3xl" />
           
           <h3 className="text-sm font-black uppercase tracking-widest text-indigo-300 mb-6 z-10">{t('teacher.dashboard.resources')}</h3>
           
           <div className="z-10">
              <Upload className="h-12 w-12 text-slate-300 mx-auto mb-6" />
              <p className="text-lg font-black">{t('teacher.dashboard.upload')}</p>
              <p className="text-xs text-slate-400 mt-2 mb-8 leading-relaxed font-bold">
                 {t('teacher.dashboard.uploadDesc')}
              </p>
              
              <div className="flex flex-col gap-3">
                 <label className="cursor-pointer flex items-center justify-center gap-2 w-full py-4 bg-indigo-600 text-white text-sm font-black rounded-xl hover:bg-indigo-500 active:scale-95 transition-all shadow-md">
                    {t('teacher.dashboard.selectFile')}
                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(courses[0]?.id, e.target.files[0])} />
                 </label>
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 bg-slate-800/50 py-2 rounded-lg">
                    {t('teacher.dashboard.activeUploads')} <span className="text-white">{uploading ? '1 in progress...' : 'None'}</span>
                 </div>
              </div>
           </div>
        </section>
      </div>
    </div>
  )
}
