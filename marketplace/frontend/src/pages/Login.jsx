import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        // ✅ حفظ بيانات المستخدم
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user?.role || 'USER');
        localStorage.setItem('userName', data.user?.name || '');
        localStorage.setItem('userId', data.user?.id || '');
        window.dispatchEvent(new Event('auth-change'));

        // ✅ التوجيه حسب الدور
        if (data.user?.role === 'ADMIN') {
          navigate('/admin');
        } else if (data.user?.role === 'BRAND') {
          navigate('/brand-panel');
        } else {
          navigate('/');
        }
      } else {
        setErrorMsg(data.message || 'بيانات غير صحيحة');
      }
    } catch (err) {
      console.error('[Login Error]:', err);
      setErrorMsg('خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h2 className="title-serif text-gradient-warm">تسجيل الدخول</h2>
        <p className="auth-subtitle">مرحباً بك مجدداً في MarketPlace ماركت بليس</p>

        {errorMsg && (
          <div className="error-banner">
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
          <p>ليس لديك حساب؟ <Link to="/signup" className="text-primary font-bold">إنشاء حساب جديد</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
