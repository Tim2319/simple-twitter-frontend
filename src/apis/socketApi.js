import { apiHelper } from '../utils/helpers'

const socket = {
  // 建立私人聊天室
  createPrivateRoom(userId) {
    return apiHelper.post('/rooms', { userId })
  },

  // 取得使用者所有聊天室
  getRoomsByUser() {
    return apiHelper.get('/rooms')
  },

  // 取得某個聊天室詳細資訊
  getRoom(roomId) {
    return apiHelper.get(`/rooms/${roomId}`)
  },

  // 取得通知（比如有新訊息）
  getNotifications() {
    return apiHelper.get('/rooms/notifications')
  },

  // 取得未讀訊息數量（private chat）
  getUnreadPrivateCount() {
    return apiHelper.get('/rooms/private/unread')
  }
}

export default socket
