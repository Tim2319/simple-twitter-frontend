// ChatRooms.jsx
import { useState } from 'react'
import ChatRoom from '../pages/Chatroom'

const RoomList = () => {
  const [activeRoomId, setActiveRoomId] = useState(null)

  const rooms = [
    { id: 1, name: '公共聊天室' },
    { id: 2, name: '私聊 A' }
  ]

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '200px' }}>
        {rooms.map(room => (
          <button key={room.id} onClick={() => setActiveRoomId(room.id)}>
            {room.name}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        {activeRoomId && <ChatRoom roomId={activeRoomId} />}
      </div>
    </div>
  )
}

export default RoomList
