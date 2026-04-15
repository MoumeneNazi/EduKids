import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../../api/client'
import { Send, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

export default function ParentChat({ teacherId, teacherName }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (!teacherId) return
    async function loadMessages() {
      try {
        const res = await apiFetch(`/messages?other_user_id=${teacherId}`)
        setMessages(res)
      } catch (err) {
        toast.error('Failed to load chat history')
      } finally {
        setLoading(false)
      }
    }
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [teacherId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const res = await apiFetch('/messages', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: teacherId,
          content: newMessage.trim()
        })
      })
      setMessages([...messages, res])
      setNewMessage('')
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  if (loading && messages.length === 0) return <div className="p-12 text-center text-slate-300 font-black uppercase tracking-widest text-[10px] animate-pulse">{t('parent.chat.connecting')}</div>

  return (
    <div className="flex flex-col h-full min-h-[400px] border-2 border-slate-100 rounded-3xl bg-white shadow-sm overflow-hidden">
      <header className="px-6 py-4 border-b-2 border-slate-100 bg-slate-50 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm border border-sky-200">
               <MessageCircle className="h-5 w-5 fill-current" />
            </div>
            <div>
               <p className="text-sm font-black text-slate-800">{teacherName || 'Teacher'}</p>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t('parent.chat.instructor')}</p>
            </div>
         </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((m) => {
          const isMe = m.sender_role === 'parent'
          return (
            <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${
                isMe ? 'bg-sky-600 border border-sky-700 text-white rounded-br-sm' : 'bg-white border-2 border-slate-100 text-slate-700 rounded-bl-sm'
              }`}>
                {m.content}
                <div className={`text-[9px] mt-2 font-black uppercase tracking-widest ${isMe ? 'text-sky-200 text-right' : 'text-slate-400 text-left'}`}>
                   {new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t-2 border-slate-100 bg-white">
        <div className="relative flex items-center">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t('parent.chat.placeholder')}
            className="w-full pl-6 pr-16 py-4 bg-slate-50 border-none rounded-full text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-sky-100 transition-shadow"
          />
          <button 
            type="submit"
            className="absolute right-3 p-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 active:scale-95 transition-all shadow-md disabled:opacity-50"
            disabled={!newMessage.trim()}
          >
            <Send className="h-5 w-5 ml-0.5" />
          </button>
        </div>
      </form>
    </div>
  )
}
