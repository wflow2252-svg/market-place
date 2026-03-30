import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, ShieldAlert } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      // Connect to secure backend
      const API_URL = import.meta.env.VITE_API_URL || 'https://market-place-fhln.vercel.app';
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user?.role || 'USER');
        localStorage.setItem('userName', data.user?.name || 'User');
        window.dispatchEvent(new Event('auth-change'));
        
        if (data.user?.role === 'ADMIN' || data.redirect) {
          localStorage.setItem('isAdmin', 'true');
          navigate(data.redirect || '/my-secret-panel-2024');
        } else if (data.user?.role === 'BRAND') {
          navigate('/brand-panel');
        } else {
          localStorage.removeItem('isAdmin');
          navigate('/'); // Normal user goes to home
        }
      } else {
        // Includes backend Rate Limit lockouts
        setErrorMsg(data.message || 'بيانات غير صحيحة');
      }
    } catch (err) {
      setErrorMsg('خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h2 className="text-primary">تسجيل الدخول</h2>
        <p className="auth-subtitle">مرحباً بك مجدداً في متجر البراندات الآمن</p>
        
        {errorMsg && (
          <div className="error-banner" style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <ShieldAlert size={18} /> {errorMsg}
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input 
              type="email" 
              placeholder="البريد الإلكتروني" 
              className="form-input" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              className="form-input" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <div className="form-actions">
            <label className="checkbox-container">
              <input type="checkbox" />
              <span className="checkmark"></span>
              تذكرني
            </label>
            <a href="#" className="font-bold text-gray">نسيت كلمة المرور؟</a>
          </div>
          
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'جاري الدخول...' : 'دخول'} <ArrowLeft size={18} />
          </button>
        </form>
        
        <div className="auth-footer">
          <p>ليس لديك حساب؟ <a href="/signup" className="text-primary font-bold">إنشاء حساب جديد</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
