import SideBar from './SideBar'
import RightAside from './RightAside'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'


const Layout = ({ children }) => {
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    navigate('/login')
  }

  return (
    <>
      <header style={{
        display: 'flex', justifyContent: 'flex-end', padding: '1rem', borderBottom: '1px solid #ccc'
      }}>
        {token ? (
          <button onClick={handleLogout}>登出</button>
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