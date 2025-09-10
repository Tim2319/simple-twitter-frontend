import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { apiHelper } from '../utils/helpers'
import { getSocket } from '../utils/socket'

const PUBLIC_ROOM_ID = 1

const ChatRoom = () => {
  const { roomId } = useParams()
  const numericRoomId = Number(roomId)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef(null)


  useEffect(() => {
    if (!numericRoomId) return
    let ignore = false
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError('')
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
    return () => { ignore = true }
  }, [numericRoomId])

  useEffect(() => {
    if (!numericRoomId) return
    const socket = getSocket()
    if (!socket.connected) socket.connect()

    // 先建立 session（可選）
    socket.emit('session', [`${numericRoomId}`])

    // 正式加入房間
    socket.emit('join', { username: 'me', roomId: numericRoomId })

    const onPublicMsg = (payload) => {
      // payload 通常是 generateMessage() 結果，可能沒有 roomId，公開房直接收
      if (numericRoomId === PUBLIC_ROOM_ID) {
        setMessages(prev => [...prev, payload])
      }
    }
    const onPrivateMsg = (payload, maybeRoomId) => {
      // 你的後端 private 事件有時會帶第二個 roomId 參數
      const rId = payload?.roomId ?? maybeRoomId
      if (String(rId) === String(numericRoomId)) {
        setMessages(prev => [...prev, payload])
      }
    }
    const onSystemMsg = (payload) => {
      if (numericRoomId === PUBLIC_ROOM_ID) {
        setMessages(prev => [...prev, payload]) // 系統訊息也顯示
      }
    }
    const onUsersCount = (payload) => {
      // 可選：把在線人數顯示在標題（這裡只示範印 log）
      console.log('users count', payload.userCount, payload.users)
    }

    socket.on('chat message', onPublicMsg)
    socket.on('private chat message', onPrivateMsg)
    socket.on('message', onSystemMsg)
    socket.on('users count', onUsersCount)

    return () => {
      // 離開房間
      try { socket.emit('leave', /* userId 可不傳 */ null, numericRoomId) } catch {}
      socket.off('chat message', onPublicMsg)
      socket.off('private chat message', onPrivateMsg)
      socket.off('message', onSystemMsg)
      socket.off('users count', onUsersCount)
    }
  }, [numericRoomId])

  const handleSend = async () => {
    const text = input.trim()
    if(!text || !numericRoomId || sending) return

    const tempId = `temp-${Date.now()}`
    const optimistic = { id: tempId, user: 'me', message: text, roomId: numericRoomId }
    setMessages(prev => [...prev, optimistic])
    setInput('')
    setSending(true)

    const socket = getSocket()
    try {
      if (numericRoomId === PUBLIC_ROOM_ID) {
        socket.emit('chat message', { message: text }, () => {
          // ack 回來就代表成功；伺服器會再廣播真正訊息
        })
      } else {
        socket.emit('private chat', { roomId: numericRoomId, message: text, newMessage: true }, () => {
          // ack 回來；伺服器會廣播到房間 & 單播給對方
        })
      }
      setSending(false)
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
