import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, CheckCircle, ShieldAlert } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Signup.css';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [sentOtp, setSentOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // ✅ التحقق من كلمة المرور قبل الإرسال
    if (formData.password.length < 6) {
      setErrorMsg('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      let otp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(otp);

      const serviceId = 'service_tk56i38';
      const templateId = 'template_3dg7xwf';
      const publicKey = 'dn3k8BnELCrmPi6cU';

      try {
        await emailjs.send(
          serviceId,
          templateId,
          { name: formData.name, to_email: formData.email, otp },
          publicKey
        );
      } catch (emailErr) {
        console.error('[EmailJS Error]:', emailErr);
        setErrorMsg('تعذر إرسال رمز التحقق. تأكد من صحة البريد الإلكتروني وحاول مرة أخرى.');
        setLoading(false);
        return;
      }
      setStep(2);
    } catch (error) {
      console.error('[Signup Error]:', error);
      setErrorMsg('حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // ✅ التحقق من الـ OTP
    if (userOtp !== sentOtp) {
      setErrorMsg('كود التحقق غير صحيح، يرجى المحاولة مرة أخرى.');
      setLoading(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // ✅ حفظ بيانات المستخدم
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('userRole', data.user?.role || 'USER');
          localStorage.setItem('userName', data.user?.name || '');
          localStorage.setItem('userId', data.user?.id || '');
          window.dispatchEvent(new Event('auth-change'));
        }
        setSuccess(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setErrorMsg(data.message || 'حدث خطأ أثناء التسجيل، يرجى المحاولة ببيانات أخرى.');
      }
    } catch (error) {
      console.error('[Register API Error]:', error);
      setErrorMsg('عذراً، الخادم غير متاح حالياً. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container card success-msg">
          <CheckCircle size={64} className="text-primary" />
          <h2>تم التسجيل بنجاح!</h2>
          <p>أهلاً بك في LuxeBrands، جاري تحويلك للصفحة الرئيسية...</p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="auth-page">
        <div className="auth-container card">
          <h2 className="text-primary">التحقق من البريد</h2>
          <p className="auth-subtitle">تم إرسال كود مكون من 6 أرقام إلى <strong>{formData.email}</strong></p>

          {errorMsg && (
            <div className="error-banner">
              <ShieldAlert size={18} /> {errorMsg}
            </div>
          )}

          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <input
                type="text"
                placeholder="أدخل الكود هنا"
                className="form-input otp-input"
                maxLength="6"
                required
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تحقق الآن'} <CheckCircle size={18} style={{ marginRight: '8px' }} />
            </button>
            <button type="button" className="btn btn-outline auth-btn" onClick={() => { setStep(1); setErrorMsg(''); }} disabled={loading}>
              تعديل الإيميل
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container card">
        <h2 className="text-primary">إنشاء حساب جديد</h2>
        <p className="auth-subtitle">انضم إلينا واكتشف أفضل الماركات العالمية</p>

        {errorMsg && (
          <div className="error-banner">
            <ShieldAlert size={18} /> {errorMsg}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSignup}>
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input
              type="text"
              placeholder="الاسم الكامل"
              className="form-input"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              className="form-input"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              placeholder="كلمة المرور (6 أحرف على الأقل)"
              className="form-input"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'سجل وأرسل الكود'} <ArrowLeft size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>لديك حساب بالفعل؟ <Link to="/login" className="text-primary font-bold">تسجيل الدخول</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
