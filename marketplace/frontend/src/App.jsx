import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BrandPage from './pages/BrandPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import BrandDashboard from './pages/BrandDashboard';
import Profile from './pages/Profile';
import MaintenancePage from './pages/MaintenancePage';
import SiteInspector from './components/SiteInspector';
import ActivateBrand from './pages/ActivateBrand';

// Protected Route Component for Admin
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';
  return isAdmin ? children : <Navigate to="/login" />;
};

// Protected Route Component for Brand
const BrandRoute = ({ children }) => {
  const isBrand = localStorage.getItem('userRole') === 'BRAND';
  return isBrand ? children : <Navigate to="/login" />;
};

// Protected Route Component for Logged in Users
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Maintenance Guard
const MaintenanceGuard = ({ children, settings }) => {
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';
  if (settings?.isMaintenance && !isAdmin) {
    return <MaintenancePage message={settings.maintenanceMsg} />;
  }
  return children;
};

function App() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/v1/settings`);
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<MaintenanceGuard settings={settings}><Home /></MaintenanceGuard>} />
            <Route path="/brand/:id" element={<MaintenanceGuard settings={settings}><BrandPage /></MaintenanceGuard>} />
            
            {/* Auth Routes always open to allow admin login */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/activate-brand" element={<ActivateBrand />} />
            
            <Route 
              path="/profile" 
              element={<ProtectedRoute><MaintenanceGuard settings={settings}><Profile /></MaintenanceGuard></ProtectedRoute>} 
            />

            <Route 
              path="/brand-panel" 
              element={<BrandRoute><MaintenanceGuard settings={settings}><BrandDashboard /></MaintenanceGuard></BrandRoute>} 
            />

            {/* Admin Route ignores Maintenance Mode naturally */}
            <Route 
              path="/admin" 
              element={<AdminRoute><Admin /></AdminRoute>} 
            />
          </Routes>
        </main>
        <SiteInspector />
      </div>
    </Router>
  );
}

export default App;
