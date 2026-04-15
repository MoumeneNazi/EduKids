import { LogOut, BookOpen, User, ShieldCheck, BarChart3, MessageSquare, Library, FileText } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LanguageSwitcher from './LanguageSwitcher'

function linkBase(role) {
  if (role === 'student') return '/student'
  if (role === 'parent') return '/parent'
  if (role === 'teacher') return '/teacher'
  if (role === 'admin') return '/admin'
  return '/'
}

export default function Sidebar() {
  const { role, logout, profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  const base = linkBase(role)

  const linksByRole = {
    student: [
      { to: `${base}/dashboard`, label: 'Lessons', icon: BookOpen },
      { to: `${base}/study-room`, label: 'Study Room', icon: Library },
      { to: `${base}/grades`, label: 'Scorecard', icon: BarChart3 },
    ],
    parent: [
      { to: `${base}/dashboard`, label: 'Child Progress', icon: BarChart3 },
      { to: `${base}/messages`, label: 'Teacher Chat', icon: MessageSquare },
    ],
    teacher: [
      { to: `${base}/dashboard`, label: 'Overview', icon: BarChart3 },
      { to: `${base}/courses`, label: 'Math Lessons', icon: BookOpen },
      { to: `${base}/gradebook`, label: 'Gradebook', icon: FileText },
      { to: `${base}/message-parents`, label: 'Parent Chat', icon: MessageSquare },
    ],
    admin: [
      { to: `${base}/dashboard`, label: 'Control House', icon: ShieldCheck },
      { to: `${base}/users`, label: 'Governance', icon: User },
    ],
  }

  const links = linksByRole[role] ?? []

  return (
    <aside className="flex h-full flex-col border-r border-slate-100 bg-white min-w-[240px]">
      <div className="px-8 py-10 flex flex-col items-start gap-4 border-b border-slate-100">
        <div>
          <div className="text-xl font-bold tracking-tight text-slate-900">EduKids</div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mathematics Platform</p>
        </div>
        <LanguageSwitcher />
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-6">
        {links.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                isActive
                  ? 'bg-slate-50 text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {profile && (
        <div className="p-4 border-t border-slate-50">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-md bg-slate-50/50">
            <div className="text-xl opacity-80">{profile.avatar || '👤'}</div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{profile.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{profile.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </div>
      )}
    </aside>
  )
}
