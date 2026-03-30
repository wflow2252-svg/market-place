import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User, CheckCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import './Signup.css';

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [sentOtp, setSentOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // EmailJS Keys
      const serviceId = 'service_xg9aawl';
      const templateId = 'template_v8x18p8';
      const publicKey = 'QcMwXfQ59HwEw045L';

      setSentOtp(otp);

      emailjs.send(
        serviceId,
        templateId,
        {
          to_name: formData.name,
          to_email: formData.email,
          message: otp
        },
        publicKey
      )
      .then((response) => {
        console.log('Email sent SUCCESS!', response.status, response.text);
        setStep(2);
        setLoading(false);
      })
      .catch((err) => {
        console.log('Email sending FAILED... Bypassing for testing.', err);
        alert('تنبيه: لم يتمكن النظام من إرسال إيميل لعدم وجود إعدادات EmailJS، ولكن دعنا نختبر النظام! \n\n الكود السري الخاص بك الآن هو: ' + otp);
        setStep(2); 
        setLoading(false);
      });

    } catch (error) {
       console.error('General Error:', error);
       alert('حدث خطأ غير متوقع');
       setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (userOtp !== sentOtp) {
        alert('كود التحقق خاطئ!');
        setLoading(false);
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'https://market-place-fhln.vercel.app';
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        alert(data.message || 'حدث خطأ أثناء التسجيل. الخادم: ' + data.message);
      }
    } catch (error) {
       console.error('Error:', error);
       alert('تفاصيل الخطأ: لا يمكن الاتصال بقاعدة البيانات. تأكد من أن السيرفر يعمل!');
    } finally {
       setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container card success-msg">
          <CheckCircle size={64} className="text-primary" />
          <h2>تم التحقق والتسجيل بنجاح!</h2>
          <p>أهلاً بك معنا، سيتم تحويلك لصفحة تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="auth-page">
        <div className="auth-container card">
          <h2 className="text-primary">التحقق من البريد</h2>
          <p className="auth-subtitle">تم إرسال كود مكون من 6 أرقام (يُرجى إدخاله)</p>
          
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="input-group">
              <input 
                type="text" 
                placeholder="أدخل الكود هنا" 
                className="form-input" 
                maxLength="6"
                required
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '12px', fontWeight: 'bold' }}
              />
            </div>
            
            <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
              {loading ? 'جاري التحقق...' : 'تحقق الآن'} <CheckCircle size={18} style={{marginRight: '8px'}} />
            </button>
            <button type="button" className="btn btn-outline auth-btn" onClick={() => setStep(1)} disabled={loading}>
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
        
        <form className="auth-form" onSubmit={handleSignup}>
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input 
              type="text" 
              placeholder="الاسم الكامل" 
              className="form-input" 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input 
              type="password" 
              placeholder="كلمة المرور" 
              className="form-input" 
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'جاري الإرسال...' : 'سجل وأرسل الكود'} <ArrowLeft size={18} />
          </button>
        </form>
        
        <div className="auth-footer">
          <p>لديك حساب بالفعل؟ <a href="/login" className="text-primary font-bold">تسجيل الدخول</a></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
