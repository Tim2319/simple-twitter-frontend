import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const navigate = useNavigate()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post('http://localhost:3000/users/signin', {
        account,
        password,
      })

      const { token } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

      navigate('/') // 登入成功導向首頁
    } catch (err) {
      console.error('Login failed:', err)
      setError('登入失敗，請確認帳號密碼是否正確')
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h2>登入</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>帳號：</label>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            required
          />
        </div>
        <div>
          <label>密碼：</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">登入</button>
      </form>
    </div>
  )
}

export default Login
