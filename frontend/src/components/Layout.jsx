import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="d-flex">
        <div style={{ width: '240px', flexShrink: 0 }}>
          <Sidebar />
        </div>
        <div className="flex-grow-1 p-4">{children}</div>
      </div>
    </div>
  )
}
