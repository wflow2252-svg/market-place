import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
    setRole(localStorage.getItem('userRole') || 'USER');
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('auth-change', checkAuth);
    return () => window.removeEventListener('auth-change', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuth(false);
    navigate('/login');
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <header className="navbar-modern">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <ShoppingBag size={28} className="text-primary" />
          <span className="logo-text">متجر <span className="text-primary">البراندات</span></span>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">الرئيسية</Link>
          <Link to="/brands" className="nav-link">كل الماركات</Link>
        </nav>
        <div className="nav-actions">
          {!isAuth ? (
            <>
              <Link to="/login" className="btn btn-outline">
                <User size={18} /> دخول
              </Link>
              <Link to="/signup" className="btn btn-primary">
                تسجيل
              </Link>
            </>
          ) : (
            <>
              <Link to={role === 'ADMIN' ? '/my-secret-panel-2024' : role === 'BRAND' ? '/brand-panel' : '/profile'} className="btn btn-primary">
                {role === 'USER' ? <><User size={18} /> ملف شخصي</> : <><LayoutDashboard size={18} /> لوحة التحكم</>}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                <LogOut size={18} /> 
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
