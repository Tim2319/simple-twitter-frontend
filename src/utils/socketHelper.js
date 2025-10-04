import { io } from 'socket.io-client'

const SOCKET_URL = import.meta?.env?.VITE_SOCKET_URL || 'http://localhost:3000'

function getToken() {
  try { return localStorage.getItem('token') || '' } catch { return '' }
}

let socket
export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: true,
      auth: { token: getToken() }, // 若後端改讀 headers，就改成 extraHeaders
      // extraHeaders: { Authorization: `Bearer ${getToken()}` },
    })
  }
  return socket
}
