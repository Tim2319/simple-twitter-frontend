import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import axios from 'axios'

const EMPTY_USER = {
  id: null,
  name: '',
  account: '',
  profilePic: '',
  cover: '',
  introduction: '',
}

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('http://localhost:3000/users/current_user')
        .then(res => {
          console.log('current_user API 回傳:', res.data)
            const u = res.data?.user ?? res.data
            if (u?.id) localStorage.setItem('uid', String(u.id)) 
          setCurrentUser(u)})
        .catch(() => {
          console.log('⚠️ 無法取得使用者資料')
          setCurrentUser(null)
        })
    }
  }, [])

  const login = (userData) => {
    const u = userData?.user ?? userData
    setCurrentUser(u)
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  const user = useMemo(() => currentUser ?? EMPTY_USER, [currentUser])
  const isLoggedIn = !!currentUser

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
