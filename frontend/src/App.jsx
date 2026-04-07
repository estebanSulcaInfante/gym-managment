import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import StaffManagement from './pages/StaffManagement';
import Kiosk from './pages/Kiosk';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <Sidebar />
      <div className="md:pl-64 pt-16 h-full min-h-screen">
        {children}
      </div>
    </div>
  );
}

function DashboardPlaceholder() { return <div className="p-8"><h1 className="text-4xl font-headline font-bold">Dashboard</h1></div>; }
function KioskPlaceholder() { return <div className="p-8"><h1 className="text-4xl font-headline font-bold">Kiosko de Asistencia</h1></div>; }
function ReportsPlaceholder() { return <div className="p-8"><h1 className="text-4xl font-headline font-bold">Reportes</h1></div>; }

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/reports" element={<ReportsPlaceholder />} />
        <Route path="/staff" element={<StaffManagement />} />
      </Routes>
    </Layout>
  );
}

export default App;
