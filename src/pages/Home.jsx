import Layout from '../components/Layout'
import { useEffect, useState } from 'react'
import axios from 'axios'

const Home = () => {
  const [posts, setPosts] = useState([])
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')
  const isLoggedIn = !!token

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/posts')

        console.log('後端回傳資料', response.data)

        setPosts(response.data.posts || [])
      } catch (err) {
        console.error('❌ 無法載入貼文', err)
      }
    }

    fetchPosts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!description.trim()) return

    try {
      await axios.post('http://localhost:3000/posts', { content: description })
      setDescription('')
      const response = await axios.get('http://localhost:3000/posts')
      setPosts(response.data.posts || [])
    } catch (err) {
      console.error('❌ 發文失敗', err)
      setError('請重新登入後再發文')
    }
  }

  return (
    <Layout>
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
          <textarea
            placeholder="你在想什麼？"
            style={{ width: '100%', height: '80px' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">發文</button>
        </form>
      ) : (
        <p>請登入才能發文。</p>
      )}

      <hr />
      <h3>最新貼文</h3>

    {posts.length === 0 ? (
    <p>目前沒有貼文。</p>
  ) : (
      posts.map((post) => (
        <div key={post.id}>
          <strong>@{post.user?.account}</strong>
          <p>{post.content}</p>
        </div>
      ))
    )}
    </Layout>
  )
}

export default Home