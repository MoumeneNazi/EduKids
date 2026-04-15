export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-100 border-t-slate-900" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</span>
      </div>
    </div>
  )
}

