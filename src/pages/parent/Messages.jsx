import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquareText, Plus, Send, User as UserIcon } from 'lucide-react'
import { apiFetch } from '../../api/client'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/shared/LoadingSpinner'

export default function Messages() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [form, setForm] = useState({ receiver_id: '', content: '' })
  const [submitting, setSubmitting] = useState(false)

  // For thread view
  const [selectedUserId, setSelectedUserId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [msgData, usersData] = await Promise.all([
        apiFetch('/messages'),
        apiFetch('/users')
      ])
      setMessages(msgData.reverse()) // Get chronological
      setUsers(usersData)
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!form.receiver_id || !form.content) return
    setSubmitting(true)
    try {
      const sentMsg = await apiFetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: parseInt(form.receiver_id),
          content: form.content
        })
      })
      // Update local state instead of full reload for speed
      setMessages([...messages, sentMsg])
      setForm({ ...form, content: '' }) // keep receiver selected if they want to send more
      setShowNewMessage(false)
      if (!selectedUserId) {
         setSelectedUserId(parseInt(form.receiver_id))
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Extract unique conversation partners
  const conversationPartnerIds = new Set()
  messages.forEach(m => {
    if (m.sender_id !== user.id) conversationPartnerIds.add(m.sender_id)
    if (m.receiver_id !== user.id) conversationPartnerIds.add(m.receiver_id)
  })

  // Ensure current selected user is in the list even if no messages yet
  if (selectedUserId) conversationPartnerIds.add(selectedUserId)

  const conversationPartners = Array.from(conversationPartnerIds).map(id => users.find(u => u.id === id) || { id, name: 'Unknown User' })

  // Teachers/Admins to start new convo:
  const staffUsers = users.filter(u => ['teacher', 'admin'].includes(u.role) && u.id !== user.id)

  const activeThread = messages.filter(m => 
    (m.sender_id === user.id && m.receiver_id === selectedUserId) ||
    (m.sender_id === selectedUserId && m.receiver_id === user.id)
  )

  if (loading) return <LoadingSpinner label="Messages" />

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12 flex flex-col h-[calc(100vh-8rem)]">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-indigo-50 p-6 rounded-3xl border border-indigo-100 flex-shrink-0">
        <div className="flex items-center gap-4">
           <div className="bg-white p-3 rounded-xl shadow-sm">
              <MessageSquareText className="h-8 w-8 text-indigo-400" />
           </div>
           <div>
             <h2 className="text-3xl font-black tracking-tight text-indigo-900">{t('parent.messages.title')}</h2>
             <p className="text-sm font-medium text-indigo-700 mt-1">{t('parent.messages.desc')}</p>
           </div>
        </div>
        <button 
           onClick={() => { setShowNewMessage(!showNewMessage); setSelectedUserId(null); }}
           className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
        >
          {showNewMessage ? 'Cancel' : <><Plus className="h-4 w-4"/> New Message</>}
        </button>
      </header>

      {showNewMessage && (
        <form onSubmit={handleSend} className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm animate-slide-up flex-shrink-0">
           <h3 className="font-black text-indigo-900 mb-4">Start New Conversation</h3>
           <div className="grid sm:grid-cols-3 gap-4">
              <select required value={form.receiver_id} onChange={e => setForm({...form, receiver_id: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400">
                 <option value="">Select Staff Member...</option>
                 {staffUsers.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
              </select>
              <div className="sm:col-span-2 flex gap-2">
                 <input required value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Type your message..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400" />
                 <button disabled={submitting} type="submit" className="bg-indigo-500 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50">
                    <Send className="h-5 w-5" />
                 </button>
              </div>
           </div>
        </form>
      )}

      <div className="flex-1 min-h-0 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
         {/* Sidebar: Conversations List */}
         <div className="w-full md:w-80 bg-slate-50 border-b md:border-r border-slate-200 flex flex-col h-1/3 md:h-full overflow-y-auto">
            <h3 className="p-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-200 sticky top-0 bg-slate-50/90 backdrop-blur">
               Conversations
            </h3>
            {conversationPartners.length === 0 ? (
               <div className="p-6 text-center text-sm font-bold text-slate-400">No active conversations.</div>
            ) : (
               conversationPartners.map(partner => (
                  <button 
                    key={partner.id} 
                    onClick={() => { setSelectedUserId(partner.id); setShowNewMessage(false); setForm({...form, receiver_id: partner.id.toString()}) }}
                    className={`flex items-center gap-3 p-4 border-b border-slate-100 w-full text-left transition-colors ${selectedUserId === partner.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-white border-l-4 border-l-transparent'}`}
                  >
                     <div className="h-10 w-10 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center font-bold">
                        {partner.avatar || <UserIcon className="h-5 w-5" />}
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${selectedUserId === partner.id ? 'font-black text-indigo-900' : 'font-bold text-slate-700'}`}>{partner.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{partner.role}</p>
                     </div>
                  </button>
               ))
            )}
         </div>

         {/* Chat Area */}
         <div className="flex-1 flex flex-col h-2/3 md:h-full min-w-0 bg-white relative">
            {!selectedUserId ? (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                  <MessageSquareText className="h-16 w-16 mb-4 opacity-50" />
                  <p className="font-bold text-lg">Select a conversation</p>
                  <p className="text-sm">Or start a new message to a teacher/admin.</p>
               </div>
            ) : (
               <>
                  <div className="p-4 bg-white border-b border-slate-100 shadow-sm flex items-center gap-3 z-10">
                     <div className="font-black text-slate-800">
                        Chatting with {users.find(u => u.id === selectedUserId)?.name || 'User'}
                     </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                     {activeThread.length === 0 ? (
                        <div className="text-center text-slate-400 font-bold py-10">Start the conversation below!</div>
                     ) : (
                        activeThread.map(msg => {
                           const isMe = msg.sender_id === user.id;
                           return (
                              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-sm ${isMe ? 'bg-indigo-500 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                                    <p className="text-sm font-medium leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-2 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                       {new Date(msg.sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                 </div>
                              </div>
                           )
                        })
                     )}
                  </div>
                  
                  <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                     <input required value={form.content} onChange={e => setForm({...form, content: e.target.value})} placeholder="Type your reply..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white" />
                     <button disabled={submitting} type="submit" className="bg-indigo-500 text-white font-bold px-6 rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 flex items-center justify-center shadow-sm">
                        Send
                     </button>
                  </form>
               </>
            )}
         </div>
      </div>
    </div>
  )
}
