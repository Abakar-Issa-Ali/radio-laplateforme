import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicPlayer from './pages/public/PublicPlayer'
import AdminDashboard from './pages/admin/AdminDashboard'
import Archive from './pages/Archive/Archive'
import AdminLayout from './pages/admin/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicPlayer />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="archive" element={<Archive />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}