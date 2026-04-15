import { Shield, Users, Zap, TrendingUp, Activity, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function AdminDashboard() {
  const { t } = useTranslation()
  const stats = [
    { label: 'Verified Educators', value: '12', icon: Shield, color: 'text-indigo-500' },
    { label: 'Active Parents', value: '48', icon: Users, color: 'text-sky-500' },
    { label: 'System Uptime', value: '99.9%', icon: Zap, color: 'text-emerald-500' },
    { label: 'Engagement Rate', value: '+24%', icon: TrendingUp, color: 'text-amber-500' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 pb-8">
        <div className="flex items-center gap-4">
           <div className="h-14 w-14 bg-slate-900 text-white flex items-center justify-center">
              <Terminal className="h-6 w-6" />
           </div>
           <div>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900">{t('admin.dashboard.title')}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">{t('admin.dashboard.subtitle')}</p>
           </div>
        </div>
        <div className="flex bg-slate-900 p-2 border border-slate-700">
          <div className="px-5 py-2 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
            <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_theme(colors.emerald.400)]" />
            {t('admin.dashboard.live')}
          </div>
        </div>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="border-2 border-slate-900 p-8 bg-white hover:bg-slate-50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500 group-hover:opacity-20">
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
           <Activity className="h-5 w-5 text-rose-500" /> {t('admin.dashboard.integrity')}
        </h3>
        <div className="border-2 border-slate-900 p-16 bg-slate-900 flex flex-col items-center justify-center text-center relative overflow-hidden">
           {/* Terminal scanning effect background */}
           <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-20 z-0 pointer-events-none" />
           <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 z-0" />
           
           <Activity className="h-16 w-16 text-emerald-500 mb-6 z-10 animate-pulse" />
           <p className="text-sm font-black text-emerald-400 uppercase tracking-widest z-10">{t('admin.dashboard.auditInit')}</p>
           <p className="text-[10px] text-slate-400 mt-4 max-w-md leading-relaxed font-bold z-10 uppercase tracking-widest">
             &gt; {t('admin.dashboard.auditDesc')}
           </p>
        </div>
      </div>
    </div>
  )
}
