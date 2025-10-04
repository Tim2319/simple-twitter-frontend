import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import MessagesLayout from '../components/MessagesLayout'
import ChatRoom from '../pages/Chatroom'
import Layout from '../components/Layout'
import Profile from '../pages/Profile'
function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/user/:id" element={<Profile />} />
      </Route>
      
      {/* Chatroom main route */}
      <Route path="/chat" element={<MessagesLayout />}>
          <Route index element={<div style={{ padding:16 }}>請選擇聊天室</div>} />
          <Route path=":roomId" element={<ChatRoom />} />
    </Route>
    </Routes>
  )
}

export default AppRoutes