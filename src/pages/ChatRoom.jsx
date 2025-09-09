import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiHelper } from '../utils/helpers'

const ChatRoom = () => {
  const { roomId } = useParams()
  const [messages, setMessages] = useState([])

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await apiHelper.get(`/rooms/${roomId}`)
        console.log('roomId 是:', roomId)
        console.log(data)
        console.log('取得的 messages:', data.messages)
        setMessages(data.messages || [])
      } catch (err) {
        console.error('❌ 無法取得訊息:', err)
      }
    }

    if (roomId) {
      fetchMessages()
    }
  }, [roomId])

  return (
    <div>
      <h3>聊天室 #{roomId}</h3>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg.message}</p>
        ))}
      </div>
    </div>
  )
}

export default ChatRoom
