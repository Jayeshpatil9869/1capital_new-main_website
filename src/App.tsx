import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MutualFundsPage } from './pages/MutualFundsPage'
import { PmsAifPage } from './pages/PmsAifPage'
import { AlternateWebsitePage } from './pages/AlternateWebsite'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AlternateWebsitePage />} />
        <Route path="/website" element={<Navigate to="/" replace />} />
        
        {/* Mutual Funds */}
        <Route path="/mf" element={<MutualFundsPage />} />
        <Route path="/mutual-funds" element={<MutualFundsPage />} />
        
        {/* PMS & AIF */}
        <Route path="/pms" element={<PmsAifPage />} />
        <Route path="/pms-aif" element={<PmsAifPage />} />
        
        {/* Redirects */}
        <Route path="/about-us" element={<Navigate to="/#about" replace />} />
        <Route path="/mf-advisor" element={<Navigate to="/#sip-calculator" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
