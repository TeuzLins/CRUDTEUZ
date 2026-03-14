import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import LoginPage from './pages/Login.jsx'
import RegisterPage from './pages/Register.jsx'
import HomePage from './pages/Home.jsx'
import DashboardPage from './pages/Dashboard.jsx'
import { getAccessToken, clearTokens } from './store/auth'

function Nav() {
  const navigate = useNavigate()
  const logged = !!getAccessToken()
  function logout() {
    clearTokens()
    navigate('/login')
  }
  return (
    <nav aria-label="Principal" className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/75 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
      <Link to="/" className="inline-flex items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800">Crud</Link>
      <div className="flex items-center gap-2">
        {!logged && (
          <Link to="/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 transition hover:bg-slate-800">
            Login
          </Link>
        )}
        {!logged && (
          <Link to="/register" className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 transition hover:bg-slate-800">
            Registrar
          </Link>
        )}
        <Link to="/dashboard" className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500">
          Dashboard
        </Link>
        {logged && (
          <button onClick={logout} className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 transition hover:bg-slate-800">
            Sair
          </button>
        )}
      </div>
      </div>
    </nav>
  )
}

export default function App() {
  const location = useLocation()
  const showNav = !location.pathname.startsWith('/dashboard')
  return (
    <div className="min-h-screen bg-transparent text-slate-100">
      {showNav && <Nav />}
      <div>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={getAccessToken() ? <DashboardPage /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </div>
  )
}
