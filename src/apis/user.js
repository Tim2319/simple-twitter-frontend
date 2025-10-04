// src/apis/user.js
import { apiHelper } from '../utils/helpers'

// 取得目前登入使用者
export const getCurrentUser = () => {
  return apiHelper.get('/users/current_user')
}

// 取得指定使用者資料
export const getUser = (userId) => {
  return apiHelper.get(`/users/${userId}`)
}

// 更新使用者資料（例如名稱、介紹、生日等）
export const updateUser = (userId, formData) => {
  return apiHelper.put(`/users/${userId}`, formData)
}

// 取得使用者貼文
export const getUserPosts = (userId) => {
  return apiHelper.get(`/users/${userId}/posts`)
}

// 取得追隨者
export const getFollowers = (userId) => {
  return apiHelper.get(`/users/${userId}/followers`)
}

// 取得正在追隨的人
export const getFollowings = (userId) => {
  return apiHelper.get(`/users/${userId}/followings`)
}

// 追蹤使用者
export const followUser = (userId) => {
  return apiHelper.post(`/users/${userId}/follow`)
}

// 取消追蹤使用者
export const unfollowUser = (userId) => {
  return apiHelper.delete(`/users/${userId}/unfollow`)
}
