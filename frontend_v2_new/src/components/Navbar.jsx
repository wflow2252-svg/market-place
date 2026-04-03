import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState('USER');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    setIsAuth(!!token);
    setRole(localStorage.getItem('userRole') || 'USER');
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('storage', checkAuth);
    // Custom event for immediate login update
    window.addEventListener('auth-change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsAuth(false);
    setRole('USER');
    setIsAdmin(false);
    window.dispatchEvent(new Event('auth-change'));
    navigate('/login');
  };

  // ✅ تحديد مسار لوحة التحكم حسب الدور
  const getDashboardPath = () => {
    if (isAdmin) return '/my-secret-panel-2024';
    if (role === 'BRAND') return '/brand-panel';
    return '/profile';
  };

  return (
    <header className="navbar-warm glass-panel">
      <div className="container nav-container">
        <Link to="/" className="logo">
          <ShoppingBag size={28} color="var(--accent-orange)" />
          <span className="logo-text">Market<span className="text-accent-orange">Place</span></span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={`nav-links ${isMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
          <div className="nav-actions">
            {!isAuth ? (
              <>
                <Link to="/login" className="btn-outline-warm-nav" onClick={() => setIsMenuOpen(false)}>
                  <User size={18} /> دخول
                </Link>
                <Link to="/signup" className="btn-luxe-nav" onClick={() => setIsMenuOpen(false)}>
                  تسجيل
                </Link>
              </>
            ) : (
              <div className="auth-actions">
                <Link to={getDashboardPath()} className="btn-luxe-nav" onClick={() => setIsMenuOpen(false)}>
                  {isAdmin || role === 'BRAND' ? <LayoutDashboard size={18} /> : <User size={18} />}
                  <span>{isAdmin ? 'مدير' : role === 'BRAND' ? 'براند' : 'حسابي'}</span>
                </Link>
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
