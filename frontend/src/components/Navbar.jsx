import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
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
          <Link to="/login" className="btn btn-outline">
            <User size={18} /> دخول
          </Link>
          <Link to="/signup" className="btn btn-primary">
            تسجيل
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
