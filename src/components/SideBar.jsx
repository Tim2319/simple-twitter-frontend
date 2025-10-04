import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const SideBar = () => {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={{ borderRight: '1px solid #ccc' ,display: 'flex', 
      flexDirection: 'column', height: '100%'}}>
      <div style={{ flex: 1 }}>
        <h3>選單</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li><Link to="/">首頁</Link></li>
          <li><Link to="/chat">訊息</Link></li>
          <li><Link to="/notification" >通知</Link></li>
          <li><Link to={`/user/${user.id}`}>個人資料</Link></li>
        </ul>
      </div>

      <div style={{ marginTop: 'auto',borderTop: '1px solid #ccc', padding: '1rem' }}>
        {isLoggedIn  ? (
          <button onClick={handleLogout}>登出 ({user.name || '使用者'})</button>
        ) : (
          <button onClick={() => navigate('/login')}>登入</button>
        )}
      </div>
    </nav>
  )
}

export default SideBar
