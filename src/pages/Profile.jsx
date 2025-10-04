import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getUser,
  getUserPosts,
  getFollowers,
  getFollowings,
  followUser,
  unfollowUser,
} from '../apis/user'

import { useAuth } from '../contexts/AuthContext'

function number(n) {
  if (typeof n !== 'number') return 0
  return n
}

export default function Profile() {
  const { id } = useParams() // /user/:id
  const userId = useMemo(() => Number(id), [id])

  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [followersCount, setFollowersCount] = useState(0)
  const [followingsCount, setFollowingsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [following, setFollowing] = useState(false) // 是否已追蹤（看你後端回傳欄位，可之後用 user.isFollowed 取代）

  const { currentUser } = useAuth()


  const me = currentUser?.user ?? currentUser
  const uidFromLS = Number(localStorage.getItem('uid')) || null
  const isMe = useMemo(() => {
    if (uidFromLS && uidFromLS === userId) return true
    if (me?.id) return String(me.id) === String(userId)
    return false
  }, [uidFromLS, me?.id, userId])
  // 取使用者 + 貼文 + 追蹤數
  useEffect(() => {
    if (!userId) return
    let ignore = false

    ;(async () => {
      try {
        setLoading(true)
        setError('')

        const [uRes, pRes, f1Res, f2Res] = await Promise.all([
          getUser(userId),
          getUserPosts(userId),
          getFollowers(userId),
          getFollowings(userId),
        ])

        if (ignore) return

        const u = uRes?.data?.user ?? uRes?.data ?? uRes // 視你的 apiHelper 封裝而定
        const p = pRes?.data?.posts || pRes?.data || []
        const f1 = f1Res?.data || []
        const f2 = f2Res?.data || []

        setUser(u)
        setPosts(Array.isArray(p) ? p : [])
        setFollowersCount(Array.isArray(f1) ? f1.length : number(f1.count))
        setFollowingsCount(Array.isArray(f2) ? f2.length : number(f2.count))

        console.log('u from getUser:', u)
        if (!u?.id) console.warn('⚠️ API 回傳的 user 沒有 id：', u)
        // 若後端有回傳 isFollowed，可直接使用；否則暫時 false
        setFollowing(Boolean(u?.isFollowed))
      } catch (err) {
        console.error(err)
        setError('無法載入個人資料')
      } finally {
        if (!ignore) setLoading(false)
      }
    })()

    return () => {
      ignore = true
    }
  }, [userId])

  const onFollowToggle = async () => {
    try {
      if (isMe) return
      if (!userId) return
      if (following) {
        await unfollowUser(userId)
        setFollowing(false)
        setFollowersCount((n) => Math.max(0, n - 1))
      } else {
        await followUser(userId)
        setFollowing(true)
        setFollowersCount((n) => n + 1)
      }
    } catch (err) {
      console.error(err)
      // 失敗就回滾
      setFollowing((v) => !v)
    }
  }

  if (loading) return <div style={{ padding: 16 }}>載入中…</div>
  if (error) return <div style={{ padding: 16, color: 'tomato' }}>{error}</div>
  if (!user) return <div style={{ padding: 16 }}>找不到使用者</div>

  const {
    name,
    account,
    introduction,
    profilePic,
    cover,
    // e.g. email, birthday…
  } = user

  console.log(
  'currentUser from context:', currentUser,
  'profile user:', user,
  'isMe:', isMe
)

  const API_ORIGIN = 'http://localhost:3000'
  const toAbsUrl = (p) => {
    if (!p) return ''
    return p.startsWith('http') ? p : `${API_ORIGIN}${p}`
  }

  {console.log('me.id:', me?.id, 'userId:', userId, 'isMe:', isMe, 'hasUser:', !!user)}
  return (
    <div style={{ padding: '0 1rem' }}>
      {/* Cover */}
      <div
        style={{
          height: 200,
          background: '#f2f2f2',
          borderRadius: 8,
          backgroundImage: cover ? `url(${cover})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginBottom: 48,
        }}
      />

      {/* 頭像 + 名稱 */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -56 }}>
        <img
          src={toAbsUrl(profilePic) || 'https://via.placeholder.com/96'}
          alt="avatar"
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            border: '4px solid #fff',
            objectFit: 'cover',
            background: '#fff',
          }}
        />
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0 }}>{name || account || `user #${userId}`}</h2>
          <div style={{ color: '#666' }}>@{account || `user${userId}`}</div>
        </div>

        {/* ✅ 按鈕：自己 => 編輯；別人 => 追蹤/已追蹤 */}
        
        {user && (
        isMe ? (
          <button
            style={{
              minWidth: 96,
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid #ddd',
              background: '#eee',
              color: '#333',
              cursor: 'pointer',
            }}
            onClick={() => {/* 開 modal 或導到 /user/:id/edit */}}
          >
            編輯個人資料
          </button>
        ) : (
          <button
            onClick={onFollowToggle}
            style={{
              minWidth: 96,
              padding: '8px 12px',
              borderRadius: 999,
              border: '1px solid #ddd',
              background: following ? '#eee' : '#1DA1F2',
              color: following ? '#333' : '#fff',
              cursor: 'pointer',
            }}
          >
            {following ? '已追蹤' : '追蹤'}
          </button>
        )
      )}

      </div>

      {/* 簡介 + 追蹤數 */}
      <div style={{ marginTop: 16, color: '#333' }}>
        {introduction ? <p style={{ whiteSpace: 'pre-wrap' }}>{introduction}</p> : <p style={{ color: '#999' }}>尚未填寫簡介</p>}
        <div style={{ display: 'flex', gap: 16, color: '#555' }}>
          <span><b>{followingsCount}</b> 追蹤中</span>
          <span><b>{followersCount}</b> 位追隨者</span>
        </div>
      </div>

      {/* 分隔線 */}
      <hr style={{ margin: '24px 0', borderTop: '1px solid #eee' }} />

      {/* 使用者貼文 */}
      <h3 style={{ marginBottom: 12 }}>貼文</h3>
      {posts.length === 0 ? (
        <p style={{ color: '#999' }}>尚無貼文</p>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {posts.map((post) => (
            <article
              key={post.id}
              style={{
                padding: 12,
                border: '1px solid #eee',
                borderRadius: 8,
                background: '#fff',
              }}
            >
              <div style={{ fontWeight: 600 }}>@{post?.user?.account || account}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
              {/* 若有圖片，可在此顯示 */}
            </article>
          ))}
        </div>
      )}
    </div>
  )
}