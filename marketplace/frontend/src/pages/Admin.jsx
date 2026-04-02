import { useState, useEffect } from 'react';
import { Settings, Plus, Users, ShieldCheck, ShoppingBag, Power, Sparkles, Wand2, Image as ImageIcon, CheckCircle2, ChevronRight, Loader2, Eye, Mail, Fingerprint, Activity } from 'lucide-react';
import { analyzeBrandImage } from '../utils/aiBranding';
import emailjs from '@emailjs/browser';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [siteSettings, setSiteSettings] = useState({ isMaintenance: false });
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null); // For Data Transparency

  // Form States
  const [brandData, setBrandData] = useState({ 
    name: '', email: '', password: '', 
    description: '', logo: '', banner: '', theme: null 
  });
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchOrders();
    fetchSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/v1/users`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (error) { console.error('Fetch users error:', error); }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/v1/orders`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setOrders(data.data);
    } catch (error) { console.error('Fetch orders error:', error); }
  };

  const fetchSettings = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/v1/settings`);
      const data = await res.json();
      if (data.success) setSiteSettings(data.data);
    } catch (error) { console.error('Fetch settings error:', error); }
  };

  const generateRandomCreds = () => {
    const randomPass = Math.random().toString(36).slice(-8) + 'Lux!';
    setBrandData({ ...brandData, password: randomPass });
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAiAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress the image aggressively to avoid Vercel 4.5MB limit
        const imgUrl = canvas.toDataURL('image/webp', 0.6);
        
        setBrandData(prev => ({ ...prev, logo: imgUrl }));
        try {
          const theme = await analyzeBrandImage(imgUrl);
          setBrandData(prev => ({ ...prev, theme }));
        } catch (err) { console.error('AI Analysis failed', err); }
        finally { setAiAnalyzing(false); }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddBrandFinal = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/v1/users/brand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...brandData,
          brandLogo: brandData.logo,
          brandBanner: brandData.banner,
          brandDescription: brandData.description,
          brandTheme: JSON.stringify(brandData.theme)
        })
      });
      const data = await res.json();
      
      if (data.success) {
        // ✅ إرسال الكود للمدير أو المالك عبر EmailJS
        try {
          await emailjs.send(
            'service_jw99yxu',
            'template_3dg7xwf',
            { 
              name: `تفعيل ماركة: ${brandData.name}`, 
              to_email: 'wflow2252@gmail.com', // Sending the email exactly to the main admin/owner email like requested
              otp: data.brand.activationCode 
            },
            'dn3k8BnELCrmPi6cU'
          );
        } catch (emailErr) {
          console.error('[Gatekeeper Email Error]:', emailErr);
        }

        alert('✨ تم إنشاء الماركة بنجاح في سوق مصر! سيتم ارسال الي المالك كود التاكيد.');
        setBrandData({ name: '', email: '', password: '', description: '', logo: '', banner: '', theme: null });
        setStep(1);
        fetchUsers();
        setActiveTab('users');
      } else {
        alert(data.message || 'خطأ في الإنشاء');
      }
    } catch (error) {
      console.error('[Upload Request Error]', error);
      alert('خطأ في الاتصال بالخادم، راجع الـ Console لمعرفة التفاصيل. السبب المحتمل: حجم البيانات أو مشكلة في الشبكة. الخطأ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenance = async () => {
    const confirmToggle = window.confirm(`هل تريد ${siteSettings.isMaintenance ? 'فتح' : 'إغلاق'} الموقع؟`);
    if (!confirmToggle) return;
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/v1/settings/maintenance`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isMaintenance: !siteSettings.isMaintenance })
      });
      const data = await res.json();
      if (data.success) { setSiteSettings(data.data); alert(data.message); }
    } catch (error) { alert('فشل تغيير الإعدادات'); }
  };

  return (
    <div className="admin-page container animate-fade-in">
      <div className="admin-header glass-panel">
        <div className="admin-title">
          <ShieldCheck size={48} className="animate-luxe" color="var(--accent-orange)" />
          <div>
            <h2 className="title-serif text-gradient-warm">بوابة شركاء MarketPlace</h2>
            <p className="text-muted">التحكم بلمسة دافئة وشفافية مطلقة في سوق مصر</p>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        <aside className="admin-sidebar glass-panel">
          <ul className="admin-menu">
            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
              <Users size={18}/> الحسابات والبيانات
            </li>
            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              <ShoppingBag size={18}/> حركة التجارة
            </li>
            <li className={activeTab === 'addBrand' ? 'active' : ''} onClick={() => setActiveTab('addBrand')}>
              <Sparkles size={18} color="var(--accent-orange)"/> منشئ الماركات الودودة
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <Settings size={18}/> لوحة التحكم المركزية
            </li>
          </ul>
        </aside>

        <main className="admin-content glass-panel">
          {activeTab === 'users' && (
            <div className="animate-fade-in">
              <div className="content-header">
                <h3 className="title-serif text-gradient-warm">سجل العائلة والشركاء</h3>
                <span className="badge-elite">{users.length} هويات رقمية</span>
              </div>
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>الهوية</th>
                      <th>الاسم</th>
                      <th>المستوى</th>
                      <th>الحالة</th>
                      <th>كود النشاط</th>
                      <th>تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => (
                      <tr key={u.id} className={`animate-fade-in stagger-${(index % 5) + 1}`}>
                        <td><Fingerprint size={16} color="var(--accent-silver)" /></td>
                        <td>{u.name}</td>
                        <td><span className={`role-tag-elite ${u.role.toLowerCase()}`}>{u.role}</span></td>
                        <td>
                          {u.isVerified ? 
                            <span className="status-active"><Activity size={12}/> مفعل</span> : 
                            <span className="status-pending">معلق</span>
                          }
                        </td>
                        <td className="code-cell">{u.isVerified ? '---' : u.otp || 'N/A'}</td>
                        <td>
                          <button className="btn-icon" onClick={() => setSelectedUser(u)}><Eye size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedUser && (
                <div className="user-detail-overlay glass-panel animate-fade-in">
                  <div className="detail-header">
                    <h4>تفاصيل الحساب الكاملة</h4>
                    <button onClick={() => setSelectedUser(null)}>إغلاق</button>
                  </div>
                  <pre className="detail-json">{JSON.stringify(selectedUser, null, 2)}</pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'addBrand' && (
            <div className="ai-brand-wizard animate-fade-in">
              <div className="wizard-header">
                <div className={`step-ind ${step >= 1 ? 'active' : ''}`}>1. الجوهر</div>
                <div className={`step-l ${step >= 2 ? 'active' : ''}`}></div>
                <div className={`step-ind ${step >= 2 ? 'active' : ''}`}>2. الرؤية</div>
                <div className={`step-l ${step >= 3 ? 'active' : ''}`}></div>
                <div className={`step-ind ${step >= 3 ? 'active' : ''}`}>3. الإطلاق</div>
              </div>

              {step === 1 && (
                <div className="wizard-step card glass-panel">
                  <h3 className="silver-glow">تحديد الجوهر الأساسي</h3>
                  <div className="input-row">
                    <input type="text" placeholder="اسم الماركة الملكية" className="elite-input" value={brandData.name} onChange={e => setBrandData({...brandData, name: e.target.value})} />
                  </div>
                  <input type="email" placeholder="البريد الإلكتروني" className="elite-input" value={brandData.email} onChange={e => setBrandData({...brandData, email: e.target.value})} />
                  <div className="input-row">
                    <input type="text" placeholder="كلمة المرور" className="elite-input" value={brandData.password} onChange={e => setBrandData({...brandData, password: e.target.value})} />
                    <button className="btn-outline-silver mini" onClick={generateRandomCreds}>توليد مفتاح دخول ✨</button>
                  </div>
                  <button className="btn-luxe" onClick={() => setStep(2)}>التالي: تحليل الرؤية البصرية <ChevronRight size={18}/></button>
                </div>
              )}

              {step === 2 && (
                <div className="wizard-step card glass-panel">
                  <h3 className="silver-glow">تحليل الرؤية (Elite AI)</h3>
                  <p>ارفع الشعار، وسنقوم باستخراج جينات الفخامة وتنسيق الموقع تلقائياً</p>
                  
                  <div className="upload-zone-elite">
                    <input type="file" id="logoUpload" hidden onChange={handleLogoUpload} accept="image/*" />
                    <label htmlFor="logoUpload" className="upload-label-elite">
                      {aiAnalyzing ? <Loader2 className="spinner-luxe" size={48} /> : brandData.logo ? <img src={brandData.logo} className="preview-logo-elite" /> : <ImageIcon size={48} />}
                      <span>{aiAnalyzing ? 'جاري التحليل الجيني للماركة...' : 'اضغط لرفع شعار النخبة'}</span>
                    </label>
                  </div>

                  {brandData.theme && (
                    <div className="ai-result-elite animate-fade-in">
                      <div className="check-badge-silver"><CheckCircle2 size={16} /> تم استخراج الهوية البصرية</div>
                      <div className="palette-elite">
                        <div className="box-elite" style={{ background: brandData.theme.primaryColor }}></div>
                        <div className="box-elite" style={{ background: brandData.theme.accentColor }}></div>
                      </div>
                    </div>
                  )}

                  <div className="wizard-actions">
                    <button className="btn-outline-silver" onClick={() => setStep(1)}>عودة</button>
                    <button className="btn-luxe" disabled={!brandData.theme} onClick={() => setStep(3)}>التالي: التفاصيل النهائية</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="wizard-step card glass-panel">
                  <h3 className="silver-glow">الإطلاق والتدشين الرسمي</h3>
                  <textarea placeholder="قصة الماركة ورؤيتها..." className="elite-input" rows="4" value={brandData.description} onChange={e => setBrandData({...brandData, description: e.target.value})}></textarea>
                  
                  <div className="activation-note glass-panel">
                    <Mail size={24} color="var(--accent-silver)" />
                    <p>سيتم ارسال الي المالك كود التاكيد عند الضغط على تأكيد.</p>
                  </div>

                  <div className="wizard-actions">
                    <button className="btn-outline-silver" onClick={() => setStep(2)}>عودة</button>
                    <button className="btn-luxe" onClick={handleAddBrandFinal} disabled={loading}>{loading ? 'جاري البناء السحابي...' : 'تأكيد ودفع الماركة للواقع'}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="animate-fade-in">
              <div className="content-header">
                <h3 className="title-serif text-gradient-warm">تدفقات المحبة والنجاح</h3>
                <span className="badge-elite">{orders.length} معاملات</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>المعاملة</th>
                    <th>العميل</th>
                    <th>القيمة</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, index) => (
                    <tr key={o.id} className={`animate-fade-in stagger-${(index % 5) + 1}`}>
                      <td>#{o.id}</td>
                      <td>{o.user?.name}</td>
                      <td className="silver-glow">{o.totalAmount} ج.م</td>
                      <td><span className={`status-badge-elite ${o.status.toLowerCase()}`}>{o.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-panel animate-fade-in">
              <div className="content-header">
                <h3 className="title-serif text-gradient-warm">التحكم الودود</h3>
              </div>
              <div className="maintenance-card-elite glass-panel">
                <div className="elite-info">
                  <Power size={48} color={siteSettings.isMaintenance ? "#ef4444" : "var(--accent-orange)"} />
                  <div>
                    <h4>السيادة العام للموقع</h4>
                    <p>{siteSettings.isMaintenance ? 'الموقع مغلق حالياً بوضع الصيانة النخبوية.' : 'الموقع متاح للجمهور والعملاء.'}</p>
                  </div>
                </div>
                <button className={`btn-luxe ${siteSettings.isMaintenance ? 'open' : 'close'}`} style={{ background: siteSettings.isMaintenance ? '#10b981' : '#ef4444' }} onClick={toggleMaintenance}>
                  {siteSettings.isMaintenance ? 'تفعيل الوصول العام' : 'إغلاق البوابة الآن'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
