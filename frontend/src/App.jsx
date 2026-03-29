import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BrandPage from './pages/BrandPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';

// Protected Route Component for Admin
const AdminRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  return isAdmin ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/brand/:id" element={<BrandPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* Hidden admin route logic */}
            <Route 
              path="/my-secret-panel-2024" 
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
