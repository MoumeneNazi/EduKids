import { Link, Navigate } from 'react-router-dom'
import {
  School,
  LogIn,
  UserPlus,
  BookOpen,
  Calculator,
  Award,
  Shield,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const roleDashboard = {
  student: '/student/dashboard',
  parent: '/parent/dashboard',
  teacher: '/teacher/dashboard',
  admin: '/admin/dashboard',
}

export default function Home() {
  const { user, role, loading } = useAuth()

  if (loading) return null
  if (user && role && roleDashboard[role]) {
    return <Navigate to={roleDashboard[role]} replace />
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 bg-white sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-slate-900">
            <Calculator className="h-5 w-5" />
            <span className="text-sm font-bold tracking-tight uppercase">Math Portal</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">Sign in</Link>
            <Link to="/signup" className="text-xs font-bold text-white bg-slate-900 px-4 py-2 rounded-md hover:bg-slate-800 transition shadow-sm uppercase tracking-widest">Get Started</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <section className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
            Primary School Mathematics
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
            Study Math without <br /> <span className="text-slate-300 italic font-medium">Distractions.</span>
          </h1>
          <p className="mt-8 max-w-xl mx-auto text-sm text-slate-500 leading-relaxed font-medium">
            A secure, minimalistic ecosystem connecting students, parents, and teachers through pure focus on mathematical excellence.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login" className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-md text-sm font-bold hover:bg-slate-800 transition shadow-md">
              Enter Portal <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/signup" className="flex items-center gap-2 border border-slate-200 text-slate-900 px-6 py-3 rounded-md text-sm font-bold hover:bg-slate-50 transition">
              Create Community
            </Link>
          </div>
        </section>

        <section className="mt-40 grid gap-12 md:grid-cols-3">
          <div className="border border-slate-100 p-8 rounded-lg bg-slate-50/20 hover:border-slate-200 transition">
            <div className="mb-6 text-slate-900"><BookOpen className="h-6 w-6" /></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">For Students</h3>
            <p className="mt-4 text-xs font-medium text-slate-500 leading-relaxed">
              Experience logic-driven adventures with XP rewards and real-time score tracking in a secure environment.
            </p>
          </div>
          <div className="border border-slate-100 p-8 rounded-lg bg-slate-50/20 hover:border-slate-200 transition">
            <div className="mb-6 text-slate-900"><Award className="h-6 w-6" /></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">For Parents</h3>
            <p className="mt-4 text-xs font-medium text-slate-500 leading-relaxed">
              Monitor mathematical milestones and engagement metrics with direct verified links to educators.
            </p>
          </div>
          <div className="border border-slate-100 p-8 rounded-lg bg-slate-50/20 hover:border-slate-200 transition">
            <div className="mb-6 text-slate-900"><Activity className="h-6 w-6" /></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">For Teachers</h3>
            <p className="mt-4 text-xs font-medium text-slate-500 leading-relaxed">
              Deploy lessons and evaluate primary math performance through a consolidated governance controller.
            </p>
          </div>
        </section>

        <section className="mt-40 rounded-xl border border-slate-100 p-12 text-center bg-slate-50/30">
           <h2 className="text-2xl font-bold text-slate-900">Join the Mathematical Era</h2>
           <p className="mt-4 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">Only verified teachers and parents can create accounts. Student access is granted exclusively through parental bridges.</p>
           <div className="mt-10">
              <Link to="/signup" className="inline-flex items-center gap-2 border-b-2 border-slate-900 pb-1 text-sm font-bold text-slate-900 hover:text-slate-600 transition-colors">
                Start Verification Process <ArrowRight className="h-4 w-4" />
              </Link>
           </div>
        </section>
      </main>

      <footer className="mt-40 border-t border-slate-100 py-12">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-slate-400">
            <Calculator className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Math Portal Architecture</span>
          </div>
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
            © {new Date().getFullYear()} Minimalist Secure Study
          </p>
        </div>
      </footer>
    </div>
  )
}

import { Activity } from 'lucide-react'
