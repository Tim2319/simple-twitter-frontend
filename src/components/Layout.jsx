import SideBar from './SideBar'
import RightAside from './RightAside'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (

      <div style={{ 
        display: 'flex',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh'
        }}>
        
        <aside style={{ 
          width: '20%', 
          top: 0, 
          position: 'sticky', 
          alignSelf: 'flex-start', 
          height: '100dvh' 
          }}>
          <SideBar />
        </aside>

        <main style={{ width: '60%', padding: '0 1rem' }}>
          <Outlet />
        </main>

        <aside style={{ 
          width: '20%',
           top: 0, 
           alignSelf: 'flex-start', 
           height: '100dvh'
           }}>
          <RightAside />
        </aside>
      </div>
  )
}

export default Layout