import { useState, useEffect } from 'react';
import { Settings, Plus, Users, ShieldCheck, ShieldAlert } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [brandData, setBrandData] = useState({ name: '', email: '', password: '' });

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://market-place-fhln.vercel.app';
      const res = await fetch(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddBrand = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API_URL = import.meta.env.VITE_API_URL || 'https://market-place-fhln.vercel.app';
      const res = await fetch(`${API_URL}/api/users/brand`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(brandData)
      });
      const data = await res.json();
      if (data.success) {
        alert('تم إضافة حساب الماركة بنجاح! يمكنهم الآن تسجيل الدخول.');
        setBrandData({ name: '', email: '', password: '' });
        fetchUsers();
        setActiveTab('users');
      } else {
        alert(data.message || 'خطأ أثناء الإضافة');
      }
    } catch (error) {
      alert('خطأ في الاتصال بالخادم.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header glass-panel">
        <div className="admin-title">
          <ShieldCheck size={32} color="var(--accent-color)" />
          <h2 className="title-serif text-gradient">لوحة تحكم الإدارة العليا</h2>
        </div>
        <p>إدارة الحسابات، الماركات، ونظام التسجيل</p>
      </div>

      <div className="admin-grid">
        <aside className="admin-sidebar glass-panel">
          <ul className="admin-menu">
            <li className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
              <Users size={18}/> المستخدمين و الدخول 
            </li>
            <li className={activeTab === 'addBrand' ? 'active' : ''} onClick={() => setActiveTab('addBrand')}>
              <Plus size={18}/> إنشاء حساب ماركة 
            </li>
            <li><Settings size={18}/> الإعدادات </li>
          </ul>
        </aside>

        <main className="admin-content glass-panel">
          {activeTab === 'users' ? (
            <>
              <div className="content-header">
                <h3>أحدث المستخدمين</h3>
                <span className="badge-promoted">{users.length} مستخدم</span>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>البريد الإلكتروني</th>
                    <th>الدور (Role)</th>
                    <th>الحالة</th>
                    <th>تاريخ التسجيل</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={user.role === 'ADMIN' ? 'text-primary font-bold' : user.role === 'BRAND' ? 'text-accent font-bold' : ''}>
                          {user.role}
                        </span>
                      </td>
                      <td>{user.isVerified ? '✅ مفعل' : '❌ بانتظار التفعيل'}</td>
                      <td>{new Date(user.createdAt).toLocaleDateString('ar-EG')}</td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>جاري التحميل...</td></tr>}
                </tbody>
              </table>
            </>
          ) : (
            <div className="add-brand-form">
              <div className="content-header">
                <h3>إضافة حساب ماركة (Brand)</h3>
                <p>قم بإنشاء حساب بصلاحية ماركة لكي يتمكنوا من إضافة منتجاتهم بأنفسهم</p>
              </div>
              <form className="auth-form" onSubmit={handleAddBrand} style={{ marginTop: '20px', maxWidth: '400px' }}>
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="اسم الماركة" 
                    className="form-input" 
                    required 
                    value={brandData.name}
                    onChange={(e) => setBrandData({...brandData, name: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <input 
                    type="email" 
                    placeholder="البريد الإلكتروني للدخول" 
                    className="form-input" 
                    required 
                    value={brandData.email}
                    onChange={(e) => setBrandData({...brandData, email: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <input 
                    type="password" 
                    placeholder="كلمة المرور المؤقتة" 
                    className="form-input" 
                    required 
                    value={brandData.password}
                    onChange={(e) => setBrandData({...brandData, password: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'جاري الإنشاء...' : 'حفظ وإنشاء'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Admin;
