import { useAuth } from '../../context/AuthContext'

export default function Navbar({ title }) {
  const { profile } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-8">
      <div>
        <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase">{title}</h1>
      </div>
      {profile && (
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-bold text-slate-900 leading-none">
              {profile.name}
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {profile.role}
            </div>
          </div>
          <div className="h-8 w-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center text-sm">
            {profile.avatar || '👤'}
          </div>
        </div>
      )}
    </header>
  )
}

