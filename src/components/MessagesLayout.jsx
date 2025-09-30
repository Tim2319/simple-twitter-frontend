// src/pages/MessagesLayout.jsx
import { Outlet, Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { apiHelper } from '../utils/helpers'
import SideBar from './SideBar'

export default function MessagesLayout() {
  const { roomId } = useParams()
  const [rooms, setRooms] = useState([])

// Chat room list provided by the backend
  useEffect(() => {
    (async () => {
      try {
        const { data } = await apiHelper.get('/rooms') 
        setRooms(Array.isArray(data) ? data : data.rooms || [])
      } catch (err) {
        console.error('❌ 無法取得聊天室清單:', err)
        setRooms([])
      }
    })()
  }, [])

  return (
    <div style={{ 
      display: 'flex',
      maxWidth: '1200px', 
      margin: '0 auto',
      minHeight: '100vh'
      }}>
        <aside style={{ 
          width: '20%', 
          top: 0,
          position: 'sticky', 
          alignSelf: 'flex-start', 
          height: '100dvh'
          }}>
          <SideBar />
        </aside>
        
      {/* Left sidebar list */}
      <aside style={{ width: '300px', borderRight: '1px solid #ddd' }}>
        <h3 style={{ padding: '8px 12px' }}>訊息</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {rooms.map(r => {
            const active = String(r.id) === String(roomId)
            return (
              <li key={r.id}>
                <Link
                  to={`/chat/${r.id}`}
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    textDecoration: 'none',
                    background: active ? '#eef6ff' : 'transparent',
                    color: active ? '#222' : '#555',
                    fontWeight: active ? 600 : 400
                  }}
                >
                  {r.name || `房間 #${r.id}`}
                </Link>
              </li>
            )
          })}
        </ul>
      </aside>

      {/*Right-side chat room view*/}
      <main style={{ flex: 1, padding: '0 1rem' }}>
        <Outlet />
      </main>
    </div>
    
  )
}
