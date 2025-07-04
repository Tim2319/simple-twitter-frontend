import SideBar from './SideBar'
import RightAside from './RightAside'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'


const Layout = ({ children }) => {
  const navigate = useNavigate()
  const { currentUser, logout } = useAuth()

  const handleLogout = () => {
  logout()
  navigate('/login')
}

  console.log('目前登入使用者：', currentUser?.name)

  return (
    <>
      <header style={{
        display: 'flex', justifyContent: 'flex-end', padding: '1rem', borderBottom: '1px solid #ccc'
      }}>
        {currentUser  ? (
          <button onClick={handleLogout}>登出 ({currentUser.name})</button>
        ) : (
          <button onClick={() => navigate('/login')}>登入</button>
        )}
      </header>


      <div style={{ display: 'flex', maxWidth: '1200px', margin: '0 auto' }}>
        <aside style={{ width: '20%' }}>
          <SideBar />
        </aside>
        <main style={{ width: '60%', padding: '0 1rem' }}>
          {children}
        </main>
        <aside style={{ width: '20%' }}>
          <RightAside />
        </aside>
      </div>
    </>
  )
}

export default Layout