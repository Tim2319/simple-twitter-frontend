import axios from 'axios'

const apiHelper = axios.create({
  baseURL: 'http://localhost:3000'
})

apiHelper.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, err => Promise.reject(err))

export { apiHelper }
