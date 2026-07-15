import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MutualFundsPage } from './pages/MutualFundsPage'
import { PmsAifPage } from './pages/PmsAifPage'
import { UploadPortalPage } from './pages/UploadPortalPage'
import { AlternateWebsitePage } from './pages/AlternateWebsite'

function App() {
  const basename =
    typeof window !== 'undefined' && window.location.pathname.startsWith('/app') ? '/app' : undefined
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/website" element={<AlternateWebsitePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadPortalPage />
              </ProtectedRoute>
            }
          />
          <Route path="/mf" element={<MutualFundsPage />} />
          <Route path="/mutual-funds" element={<MutualFundsPage />} />
          <Route path="/pms" element={<PmsAifPage />} />
          <Route path="/pms-aif" element={<PmsAifPage />} />
          <Route path="/about-us" element={<Navigate to="/website#about" replace />} />
          <Route path="/mf-advisor" element={<Navigate to="/website" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
