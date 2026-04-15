import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../api/client'
import LoadingSpinner from '../../components/shared/LoadingSpinner'
import { Target, CheckCircle2, ArrowRight, RotateCcw, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const MATH_CURRICULUM = {
  '1AP': [
    { text: 'Combien font 5 + 3 ?', options: ['6', '8', '9'], correct: 1 },
    { text: 'Quel nombre vient après 9 ?', options: ['8', '10', '11'], correct: 1 },
    { text: 'Si j\'ai 2 pommes et j\'en achète 2, combien j\'en ai ?', options: ['2', '4', '6'], correct: 1 },
    { text: 'Combien font 10 - 4 ?', options: ['4', '5', '6'], correct: 2 },
  ],
  '2AP': [
    { text: 'Combien font 15 + 12 ?', options: ['25', '27', '29'], correct: 1 },
    { text: 'Quel est le double de 10 ?', options: ['15', '20', '30'], correct: 1 },
    { text: 'Combien font 5 × 2 ?', options: ['7', '10', '12'], correct: 1 },
    { text: '35 + ? = 40', options: ['5', '10', '15'], correct: 0 },
  ]
}

export default function TakeQuiz() {
  const { profile } = useAuth()
  const { t } = useTranslation()
  const [currentLevel, setCurrentLevel] = useState('1AP')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const level = profile?.class_level || '1AP'
    setCurrentLevel(level)
    const pool = MATH_CURRICULUM[level] || MATH_CURRICULUM['1AP']
    setQuestions(pool)
    setLoading(false)
  }, [profile])

  const handleNext = () => {
    if (selected === questions[currentIndex].correct) {
      setScore(s => s + 1)
    }
    
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
    } else {
      setFinished(true)
      submitScore()
    }
  }

  const submitScore = async () => {
      try {
          await apiFetch('/grades', {
              method: 'POST',
              body: JSON.stringify({
                  student_id: profile.id,
                  assignment_id: 1,
                  course_id: 1,
                  score: (score / questions.length) * 20,
                  max_score: 20,
                  feedback: `Completed ${currentLevel} auto-quiz.`
              })
          })
      } catch (e) {
          console.error('Score submission failed')
      }
  }

  if (loading) return <LoadingSpinner label="Calibrating Math Quest..." />

  if (finished) {
    const finalPct = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-10 animate-fade-in">
        <div className="relative inline-block animate-bounce">
           <div className="h-40 w-40 rounded-full border-b-8 border-slate-900 flex items-center justify-center bg-white shadow-2xl">
              <span className="text-6xl font-black text-slate-900">{finalPct}%</span>
           </div>
           <Trophy className="absolute -top-6 -right-6 h-16 w-16 text-yellow-400 drop-shadow-xl" />
        </div>
        
        <div>
           <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
             {t('student.quiz.completed')}
           </h2>
           <p className="text-lg font-bold text-slate-500 mt-4 leading-relaxed">
             {t('student.quiz.mastered', { score, total: questions.length }).replace('{{score}}', score).replace('{{total}}', questions.length)}
           </p>
        </div>

        <div className="flex flex-col gap-4 max-w-xs mx-auto">
           <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white text-sm font-black rounded-2xl hover:bg-emerald-600 active:translate-y-1 border-b-4 border-emerald-700 transition shadow-lg"
           >
             <RotateCcw className="h-5 w-5" /> {t('student.quiz.retry')}
           </button>
           <button 
            onClick={() => window.history.back()}
            className="w-full py-4 text-xs font-black text-slate-400 hover:text-slate-600 transition uppercase tracking-widest"
           >
             {t('student.quiz.return')}
           </button>
        </div>
      </div>
    )
  }

  const q = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-fade-in pb-12">
      <header className="bg-white p-8 rounded-3xl shadow-sm border-b-4 border-slate-200 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 h-2 bg-slate-100 w-full">
           <div className="h-full bg-emerald-400 transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        <Target className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
          {t('student.quiz.quest', { level: currentLevel }).replace('{{level}}', currentLevel)}
        </h2>
        <p className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mt-3">
          {t('student.quiz.question', { current: currentIndex + 1, total: questions.length }).replace('{{current}}', currentIndex + 1).replace('{{total}}', questions.length)}
        </p>
      </header>

      <div className="space-y-12">
         <div className="text-center bg-sky-100 p-10 rounded-3xl border-b-4 border-sky-200">
            <h3 className="text-2xl font-black text-sky-900 leading-relaxed max-w-xl mx-auto whitespace-pre-wrap">
               {q?.text}
            </h3>
         </div>

         <div className="grid gap-4 md:grid-cols-1">
            {q?.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelected(idx)}
                className={`group flex items-center justify-between p-6 rounded-2xl border-b-4 transition-all text-left ${
                  selected === idx 
                  ? 'border-indigo-700 bg-indigo-600 text-white shadow-xl scale-[1.02]' 
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:-translate-y-1 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-6">
                   <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-black ${
                     selected === idx ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                   }`}>
                      {String.fromCharCode(65 + idx)}
                   </div>
                   <span className="text-xl font-bold">{opt}</span>
                </div>
                {selected === idx && <CheckCircle2 className="h-8 w-8 text-emerald-400" />}
              </button>
            ))}
         </div>

         <div className="pt-6">
            <button
               onClick={handleNext}
               disabled={selected === null}
               className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 text-white text-lg font-black rounded-2xl hover:bg-slate-800 active:translate-y-1 transition shadow-xl border-b-4 border-black disabled:opacity-30 disabled:border-transparent disabled:active:translate-y-0"
            >
               {currentIndex + 1 === questions.length ? t('student.quiz.finalize') : t('student.quiz.next')}
               <ArrowRight className="h-6 w-6" />
            </button>
         </div>
      </div>
    </div>
  )
}
