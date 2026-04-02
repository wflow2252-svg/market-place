import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import './Signup.css'; // Reusing auth styles for consistency

const ActivateBrand = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleActivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setErrorMsg(data.message || 'كود التفعيل غير صحيح أو منتهي الصلاحية.');
      }
    } catch (error) {
      console.error('[Activation Error]:', error);
      setErrorMsg('حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page elite-theme animate-fade-in">
        <div className="auth-container glass-panel text-center">
          <ShieldCheck size={64} color="var(--accent-silver)" className="animate-luxe" />
          <h2 className="text-gradient-silver title-serif">تم التفعيل بنجاح!</h2>
          <p>أهلاً بك في نخبة LuxeBrands. يمكنك الآن تسجيل الدخول وإدارة ماركتك.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page elite-theme animate-fade-in">
      <div className="auth-container glass-panel">
        <div className="auth-header text-center">
          <ShieldCheck size={48} color="var(--accent-silver)" />
          <h2 className="title-serif text-gradient-silver">بوابة تفعيل الماركات</h2>
          <p className="text-muted">أدخل الكود الذي استلمته من إدارة LuxeBrands لتفعيل حسابك</p>
        </div>

        {errorMsg && <div className="error-banner">{errorMsg}</div>}

        <form className="auth-form" onSubmit={handleActivate}>
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="البريد الإلكتروني للبراند"
              className="elite-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <ShieldCheck size={18} className="input-icon" />
            <input
              type="text"
              placeholder="كود التفعيل (6 أرقام)"
              className="elite-input"
              maxLength="6"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <button type="submit" className="btn-luxe full-width" disabled={loading}>
            {loading ? <Loader2 className="spinner-luxe" /> : 'تفعيل الحساب الملكي الآن'}
          </button>
        </form>

        <div className="auth-footer">
          <button className="btn-outline-silver mini" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> العودة للموقع
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivateBrand;
