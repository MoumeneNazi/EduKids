import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FileText, Check, X, ExternalLink, ShieldAlert } from 'lucide-react'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { useTranslation } from 'react-i18next'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const UPLOADS_BASE = API_BASE.replace('/api', '/uploads')

export default function ManageUsers() {
  const [pending, setPending] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')
  const [processingId, setProcessingId] = useState(null)
  const { t } = useTranslation()

  const loadData = async () => {
    try {
      const [p, a] = await Promise.all([
        apiFetch('/users?pending=true'),
        apiFetch('/users')
      ])
      setPending(Array.isArray(p) ? p : [])
      setAllUsers(Array.isArray(a) ? a : [])
    } catch (e) {
      toast.error('Failed to sync users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleApprove = async (userId) => {
    setProcessingId(userId)
    try {
      await apiFetch(`/users/${userId}/approve`, { method: 'POST' })
      toast.success('User validated')
      loadData()
    } catch (e) {
      toast.error('Validation failed')
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) return <LoadingSpinner label={t('admin.users.title')} />

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-900 pb-8">
        <div className="flex items-center gap-4">
           <div className="h-14 w-14 bg-rose-50 text-rose-600 flex items-center justify-center border-2 border-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)]">
              <ShieldAlert className="h-6 w-6" />
           </div>
           <div>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900">{t('admin.users.title')}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">{t('admin.users.subtitle')}</p>
           </div>
        </div>
        <div className="flex bg-white p-1.5 border-2 border-slate-900 shadow-[4px_4px_0_0_theme(colors.slate.900)] max-w-fit">
          <button
            onClick={() => setTab('pending')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${tab === 'pending' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {t('admin.users.pending')} ({pending.length})
          </button>
          <button
            onClick={() => setTab('all')}
            className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors ${tab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            {t('admin.users.all')}
          </button>
        </div>
      </header>

      {tab === 'pending' ? (
        <div className="grid gap-6">
          {pending.length === 0 ? (
            <div className="py-24 text-center border-4 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center">
              <ShieldAlert className="h-12 w-12 text-slate-300 mb-4" />
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest">{t('admin.users.empty')}</p>
            </div>
          ) : (
            pending.map(u => (
              <div key={u.id} className="border-2 border-slate-900 bg-white p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-[4px_4px_0_0_theme(colors.slate.900)] transition-all">
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-black uppercase tracking-widest mb-3">{u.role}</span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{u.name}</h3>
                    <p className="text-sm font-bold text-slate-500">{u.email}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 pt-4 border-t-2 border-slate-100">
                    {u.id_card_url && (
                      <a href={`${UPLOADS_BASE}/${u.id_card_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-xs font-black uppercase tracking-widest text-indigo-700 hover:bg-indigo-100 transition-colors">
                        <FileText className="h-4 w-4" /> {t('admin.users.govId')} <ExternalLink className="h-3 w-3 ml-2 opacity-50" />
                      </a>
                    )}
                    {u.family_book_url && (
                      <a href={`${UPLOADS_BASE}/${u.family_book_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-200 text-xs font-black uppercase tracking-widest text-sky-700 hover:bg-sky-100 transition-colors">
                        <FileText className="h-4 w-4" /> {t('admin.users.familyTree')} <ExternalLink className="h-3 w-3 ml-2 opacity-50" />
                      </a>
                    )}
                    {u.contract_url && (
                      <a href={`${UPLOADS_BASE}/${u.contract_url}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-xs font-black uppercase tracking-widest text-amber-700 hover:bg-amber-100 transition-colors">
                        <FileText className="h-4 w-4" /> {t('admin.users.contract')} <ExternalLink className="h-3 w-3 ml-2 opacity-50" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-48 pt-6 md:pt-0 border-t-2 md:border-t-0 md:border-l-2 border-slate-100 md:pl-8">
                  <button
                    onClick={() => handleApprove(u.id)}
                    disabled={processingId === u.id}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest border-2 border-emerald-700 hover:bg-emerald-600 active:translate-y-1 transition-all disabled:opacity-50 shadow-[2px_2px_0_0_theme(colors.emerald.900)]"
                  >
                    <Check className="h-4 w-4" /> {t('admin.users.approve')}
                  </button>
                  <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-900 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 active:translate-y-1 transition-all shadow-[2px_2px_0_0_theme(colors.slate.900)]">
                    <X className="h-4 w-4" /> {t('admin.users.reject')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="border-2 border-slate-900 bg-white shadow-[8px_8px_0_0_theme(colors.slate.900)] overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-8 py-5 font-black text-white uppercase text-[10px] tracking-widest">{t('admin.users.user')}</th>
                <th className="px-8 py-5 font-black text-white uppercase text-[10px] tracking-widest">{t('admin.users.role')}</th>
                <th className="px-8 py-5 font-black text-white uppercase text-[10px] tracking-widest">{t('admin.users.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {allUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-black text-slate-900 text-sm">{u.name}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{u.email}</div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="inline-block px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-300">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {u.approved ? (
                      <span className="inline-flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                        <div className="h-2 w-2 bg-emerald-500 rounded-sm" /> {t('admin.users.verified')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-amber-500 font-black text-[10px] uppercase tracking-widest">
                        <div className="h-2 w-2 bg-amber-400 rounded-sm" /> {t('admin.users.pendingStatus')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
