import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiHelper } from '../utils/helpers'

const ChatRoom = () => {
  const { roomId } = useParams()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)


  useEffect(() => {
    if (!roomId) return
    let ignore = false
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError('')
        const { data } = await apiHelper.get(`/rooms/${roomId}`)
        const msgs = Array.isArray(data.messages) ? data.messages : []
        if (!ignore) setMessages(msgs)
      } catch (err) {
        if (!ignore) {
          console.error('❌ 無法取得訊息:', err)
          setError('無法取得訊息')
          setMessages([])
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchMessages()
    return () => { ignore = true }
  }, [roomId])

  const handleSend = async () => {
    const text = input.trim()
    if(!text || !roomId || sending) return

    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, user: 'me', message: text }
    setMessages(prev => [...prev, optimistic])
    setInput('')
    setSending(true)

  try {
      const { data } = await apiHelper.post(`/rooms/${roomId}/messages`, { message: text })
      // 若後端回新訊息物件（建議如此），用真實資料取代暫存；否則就保留樂觀那筆
      if (data && data.id) {
        setMessages(prev => prev.map(m => (m.id === tempId ? data : m)))
      }
    } catch (e) {
      console.error('❌ 傳送失敗:', e)
      setError('訊息傳送失敗')
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setInput(text) // 把文字放回輸入框
    } finally {
      setSending(false)
    }
  }

  // Enter 快速送出
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 3) 自動滾到底
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3>聊天室 #{roomId}</h3>

      <div style={{ flex: 1, border: '1px solid #ccc', padding: 8, overflowY: 'auto' }}>
        {loading && <p>讀取中…</p>}
        {error && <p style={{ color: 'tomato' }}>{error}</p>}
        {!loading && !messages.length && <p style={{ color: '#888' }}>暫無訊息</p>}

        {messages.map((msg, i) => {
          const key = msg.id ?? `msg-${i}`
          const who = msg.user?.name ?? msg.user ?? 'user'
          const isTemp = String(key).startsWith('temp-')
          return (
            <p key={key} style={{ opacity: isTemp ? 0.6 : 1 }}>
              <b>{who}:</b> {msg.message}
            </p>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', marginTop: 8 }}>
        <input
          style={{ flex: 1, marginRight: 8 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="輸入訊息…（Enter 送出）"
          disabled={sending}
        />
        <button onClick={handleSend} disabled={sending || !input.trim()}>
          {sending ? '傳送中…' : '送出'}
        </button>
      </div>
    </div>
  )
}

export default ChatRoom
