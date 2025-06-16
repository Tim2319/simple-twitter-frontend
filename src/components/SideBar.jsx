import { Link } from 'react-router-dom'

const SideBar = () => {
  return (
    <nav style={{ padding: '1rem', borderRight: '1px solid #ccc' }}>
      <h3>選單</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/">🏠 首頁</Link></li>
        <li><Link to="/profile">👤 個人資料</Link></li>
        <li><Link to="/messages">✉️ 私訊</Link></li>
      </ul>
    </nav>
  )
}

export default SideBar
