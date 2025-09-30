import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { apiHelper } from '../utils/helpers'
import { getSocket } from '../utils/socket'

// ID for the global/public room (server convention)
const PUBLIC_ROOM_ID = 1

const ChatRoom = () => {
  // ----- Routing params -----
  const { roomId } = useParams()
  const numericRoomId = Number(roomId)
  // ----- UI state -----
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)

  // ===== 1) Fetch message history when room changes ===== 
  useEffect(() => {
    if (!numericRoomId) return
    let ignore = false
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError('')

        // GET /rooms/:roomId -> { messages: [...] }
        const { data } = await apiHelper.get(`/rooms/${numericRoomId}`)
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

    // guard against state updates after unmount
    return () => { ignore = true }
  }, [numericRoomId])

  // ===== 2) Wire up Socket.IO listeners for the current room =====
  useEffect(() => {
    if (!numericRoomId) return
    const socket = getSocket()
    if (!socket.connected) socket.connect()

    //Initialize session (optional)
    socket.emit('session', [`${numericRoomId}`])

    // Join the room officially (server adds this socket to the room)
    socket.emit('join', { username: 'me', roomId: numericRoomId })

    // --- Handlers for different channels of messages ---

    // Public room broadcast: only append when we are in the public room
    const onPublicMsg = (payload) => {
      if (numericRoomId === PUBLIC_ROOM_ID) {
        setMessages(prev => [...prev, payload])
      }
    }

    // Private room message: payload may or may not include roomId
    // Fallback to maybeRoomId provided by the server
    const onPrivateMsg = (payload, maybeRoomId) => {
      const rId = payload?.roomId ?? maybeRoomId
      if (String(rId) === String(numericRoomId)) {
        setMessages(prev => [...prev, payload])
      }
    }

    // System message (e.g., joins/leaves) for the public room
    const onSystemMsg = (payload) => {
      if (numericRoomId === PUBLIC_ROOM_ID) {
        setMessages(prev => [...prev, payload])
      }
    }

    // Realtime user counter (debug/info)
    const onUsersCount = (payload) => {
      console.log('users count', payload.userCount, payload.users)
    }

    // Subscribe
    socket.on('chat message', onPublicMsg)
    socket.on('private chat message', onPrivateMsg)
    socket.on('message', onSystemMsg)
    socket.on('users count', onUsersCount)

    // Cleanup when leaving the room / unmount
    return () => {
      try { socket.emit('leave', null, numericRoomId) } catch {}
      socket.off('chat message', onPublicMsg)
      socket.off('private chat message', onPrivateMsg)
      socket.off('message', onSystemMsg)
      socket.off('users count', onUsersCount)
    }
  }, [numericRoomId])

  // ===== 3) Send message (public vs private) =====
  const handleSend = async () => {
    const text = input.trim()
    if(!text || !numericRoomId || sending) return

    // Optimistic UI: temp message so the UI feels instant
    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, user: 'me', message: text, roomId: numericRoomId }
    setMessages(prev => [...prev, optimistic])
    setInput('')
    setSending(true)

    const socket = getSocket()
    try {
      if (numericRoomId === PUBLIC_ROOM_ID) {
        // Public broadcast; server will ack then broadcast the real message
        socket.emit('chat message', { message: text }, () => {
        // ack received -> success (the server will broadcast the final message)
        })
      } else {
        // Private room send; server broadcasts to room & unicast to peer
        socket.emit('private chat', { roomId: numericRoomId, message: text, newMessage: true }, () => {
        // ack received
        })
      }
      setSending(false)
    } catch (e) {
      // Rollback optimistic message on failure
      console.error('❌ 傳送失敗:', e)
      setError('訊息傳送失敗')
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  // ===== 4) Keyboard shortcut: Enter to send (Shift+Enter for newline) =====
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ===== 5) Auto scroll to the latest message =====
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ===== 6) Render =====
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
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

      <div style={{ display: 'flex', marginTop: 8, }}>
        <input
          style={{ flex: 1, marginRight: 8 ,resize: 'none', minHeight:'50px'}}
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
