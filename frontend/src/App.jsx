import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';

// Pages
import Login from './pages/Login';
import Kiosk from './pages/Kiosk';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import Calendar from './pages/Calendar';
import StaffManagement from './pages/StaffManagement';
import EmployeeDetail from './pages/EmployeeDetail';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <TopBar onMenuToggle={() => setSidebarOpen(o => !o)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="pt-16 md:pl-64 min-h-screen">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes — no layout, no auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/kiosk" element={<Kiosk />} />

        {/* Protected routes — inside layout */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout><Calendar /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/staff" element={
          <ProtectedRoute adminOnly>
            <Layout><StaffManagement /></Layout>
          </ProtectedRoute>
        } />

        <Route path="/staff/:id" element={
          <ProtectedRoute>
            <Layout><EmployeeDetail /></Layout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
