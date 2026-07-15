import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function SimpleLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="font-semibold text-slate-800">
              Sales Dashboard
            </Link>
            <Link to="/upload" className="text-slate-600 hover:text-slate-900">
              Upload portal
            </Link>
            <Link to="/mf" className="text-slate-600 hover:text-slate-900">
              Mutual Funds
            </Link>
            <Link to="/pms" className="text-slate-600 hover:text-slate-900">
              PMS & AIF
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {user && (
              <>
                <span className="text-slate-700">
                  {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : user.username}
                </span>
                <button
                  onClick={() => {
                    logout()
                    navigate('/login', { replace: true })
                  }}
                  className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

