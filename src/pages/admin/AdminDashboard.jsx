import { Shield, Users, Zap, TrendingUp, Activity, Terminal, ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const [feed, setFeed] = useState([])
  const [loading, setLoading] = useState(true)
  
  const stats = [
    { label: 'Verified Educators', value: '12', icon: Shield, color: 'text-indigo-500' },
    { label: 'Active Parents', value: '48', icon: Users, color: 'text-sky-500' },
    { label: 'System Uptime', value: '99.9%', icon: Zap, color: 'text-emerald-500' },
    { label: 'Engagement Rate', value: '+24%', icon: TrendingUp, color: 'text-amber-500' },
  ]

  useEffect(() => {
     async function load() {
       try {
         const data = await apiFetch('/audit')
         setFeed(Array.isArray(data) ? data : [])
       } catch (e) {
         // silently fail audit
       } finally {
         setLoading(false)
       }
     }
     load()
  }, [])

  if (loading) return <LoadingSpinner label={t('admin.dashboard.title')} />

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 pb-8">
        <div className="flex items-center gap-4">
           <div className="h-14 w-14 bg-slate-900 text-white flex items-center justify-center shadow-lg">
              <Terminal className="h-6 w-6" />
           </div>
           <div>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900">{t('admin.dashboard.title', 'Command Center')}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">{t('admin.dashboard.subtitle', 'Root Access Overridden')}</p>
           </div>
        </div>
        <div className="flex bg-slate-900 p-2 border border-slate-700 shadow-xl">
          <div className="px-5 py-2 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_theme(colors.emerald.400)]" />
            {t('admin.dashboard.live', 'Global State Sync')}
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="border-2 border-slate-900 p-8 bg-white hover:bg-slate-50 transition-colors group relative overflow-hidden shadow-sm hover:shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500 group-hover:opacity-20 z-0">
                 <Icon className={`h-24 w-24 ${stat.color}`} />
              </div>
              <div className="relative z-10">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{stat.label}</div>
                <div className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-3">
           <Activity className="h-5 w-5 text-rose-500 animate-pulse" /> {t('admin.dashboard.integrity', 'System Activity Feed')}
        </h3>
        <div className="border-2 border-slate-900 p-8 bg-slate-900 flex flex-col relative overflow-hidden shadow-2xl min-h-[400px]">
           {/* Terminal scanning effect background */}
           <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-20 z-0 pointer-events-none" />
           <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-900 to-transparent z-10 pointer-events-none" />
           
           <div className="relative z-20 space-y-0 text-emerald-400 font-mono text-xs md:text-sm">
              <div className="border-b border-slate-800 pb-4 mb-4 flex gap-4 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <span className="w-48 hidden sm:inline-block">Timestamp</span>
                <span className="w-32">Module</span>
                <span className="flex-1">Trace Log</span>
              </div>
              
              {feed.length === 0 ? (
                 <div className="text-slate-500 p-6 text-center italic">Awaiting network events...</div>
              ) : (
                feed.map((log, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="w-48 text-slate-500 whitespace-nowrap hidden sm:inline-block">[{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'LIVE'}]</div>
                    <div className="w-32 font-bold text-sky-400">{log.type}</div>
                    <div className="flex-1 text-emerald-300 break-words">{log.message}</div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  )
}
