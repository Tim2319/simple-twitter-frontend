import { Routes, Route } from 'react-router-dom'
import Login from '../pages/Login'
import Home from '../pages/Home'
import ChatRoom from '../pages/Chatroom'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat/:roomId" element={<ChatRoom />} /> 
    </Routes>
  )
}

export default AppRoutes