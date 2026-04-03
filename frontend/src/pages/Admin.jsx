import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Plus, Users, ShieldCheck, ShoppingBag,
  Trash2, Edit2, CheckCircle, XCircle, RefreshCw,
  Store, AlertTriangle, Search, ChevronDown
} from 'lucide-react';
import './Admin.css';

const API = import.meta.env.VITE_API_URL || '';
const token = () => localStorage.getItem('token');

// ── Toast helper ─────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div className={`admin-toast admin-toast-${type}`}>
    {type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
    <span>{msg}</span>
    <button onClick={onClose} className="toast-close">×</button>
  </div>
);

const Admin = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast]         = useState(null);
  const [search, setSearch]       = useState('');

  // Users
  const [users, setUsers]         = useState([]);
  const [usersLoading, setUL]     = useState(false);

  // Brands
  const [brands, setBrands]       = useState([]);
  const [brandsLoading, setBL]    = useState(false);

  // Products
  const [products, setProducts]   = useState([]);
  const [prodsLoading, setPL]     = useState(false);

  // Add Brand form
  const [brandForm, setBrandForm] = useState({ name: '', email: '', password: '' });
  const [addLoading, setAddL]     = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetchers ─────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUL(true);
    try {
      const r = await fetch(`${API}/v1/users`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setUsers(d.users);
    } finally { setUL(false); }
  }, []);

  const fetchBrands = useCallback(async () => {
    setBL(true);
    try {
      const r = await fetch(`${API}/v1/brands`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setBrands(d.brands);
    } finally { setBL(false); }
  }, []);

  const fetchProducts = useCallback(async () => {
    setPL(true);
    try {
      const r = await fetch(`${API}/v1/products`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setProducts(d.data);
    } finally { setPL(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { if (activeTab === 'brands') fetchBrands(); }, [activeTab, fetchBrands]);
  useEffect(() => { if (activeTab === 'products') fetchProducts(); }, [activeTab, fetchProducts]);

  // ── User Actions ──────────────────────────────────────
  const deleteUser = async (id, name) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    const r = await fetch(`${API}/v1/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    const d = await r.json();
    if (d.success) { showToast('تم حذف المستخدم'); fetchUsers(); }
    else showToast(d.message, 'error');
  };

  const toggleVerify = async (id) => {
    const r = await fetch(`${API}/v1/users/${id}/verify`, { method: 'PATCH', headers: { Authorization: `Bearer ${token()}` } });
    const d = await r.json();
    if (d.success) { showToast(d.message); fetchUsers(); }
    else showToast(d.message, 'error');
  };

  const changeRole = async (id, role) => {
    const r = await fetch(`${API}/v1/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
      body: JSON.stringify({ role })
    });
    const d = await r.json();
    if (d.success) { showToast('تم تحديث الدور'); fetchUsers(); }
    else showToast(d.message, 'error');
  };

  // ── Brand Actions ─────────────────────────────────────
  const toggleBrandPause = async (id) => {
    const r = await fetch(`${API}/v1/brands/${id}/pause`, { method: 'PATCH', headers: { Authorization: `Bearer ${token()}` } });
    const d = await r.json();
    if (d.success) { showToast(d.message); fetchBrands(); }
    else showToast(d.message, 'error');
  };

  // ── Product Actions ───────────────────────────────────
  const deleteProduct = async (id, name) => {
    if (!confirm(`حذف المنتج "${name}"؟`)) return;
    const r = await fetch(`${API}/v1/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    const d = await r.json();
    if (d.success) { showToast('تم حذف المنتج'); fetchProducts(); }
    else showToast(d.message, 'error');
  };

  // ── Add Brand ─────────────────────────────────────────
  const handleAddBrand = async (e) => {
    e.preventDefault();
    setAddL(true);
    try {
      const r = await fetch(`${API}/v1/users/brand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(brandForm)
      });
      const d = await r.json();
      if (d.success) {
        showToast('تم إنشاء البراند بنجاح ✓');
        setBrandForm({ name: '', email: '', password: '' });
        fetchUsers();
        setActiveTab('brands');
      } else showToast(d.message, 'error');
    } catch { showToast('خطأ في الاتصال', 'error'); }
    finally { setAddL(false); }
  };

  // ── Filter helpers ────────────────────────────────────
  const filteredUsers    = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
  const filteredBrands   = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const roleColor = { ADMIN: '#ef4444', BRAND: '#2563eb', USER: '#64748b' };

  const tabs = [
    { id: 'users',    icon: <Users size={18}/>,       label: 'المستخدمون', count: users.length },
    { id: 'brands',   icon: <Store size={18}/>,       label: 'البراندات',  count: brands.length },
    { id: 'products', icon: <ShoppingBag size={18}/>, label: 'المنتجات',   count: products.length },
    { id: 'addBrand', icon: <Plus size={18}/>,        label: 'إضافة براند' },
  ];

  return (
    <div className="admin-page container">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="admin-header">
        <div className="admin-title-row">
          <ShieldCheck size={32} color="#2563eb" />
          <div>
            <h2>لوحة تحكم الإدارة</h2>
            <p className="admin-subtitle">إدارة شاملة للمستخدمين والبراندات والمنتجات</p>
          </div>
        </div>
        <div className="admin-search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="بحث..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="admin-search-input"
          />
        </div>
      </div>

      <div className="admin-grid">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <ul className="admin-menu">
            {tabs.map(t => (
              <li
                key={t.id}
                className={activeTab === t.id ? 'active' : ''}
                onClick={() => { setActiveTab(t.id); setSearch(''); }}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.count !== undefined && <span className="menu-badge">{t.count}</span>}
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <main className="admin-content">

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <>
              <div className="content-header">
                <h3>المستخدمون ({filteredUsers.length})</h3>
                <button className="btn-refresh" onClick={fetchUsers}><RefreshCw size={15}/></button>
              </div>
              {usersLoading ? <div className="admin-loading">جاري التحميل...</div> : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead><tr>
                      <th>الاسم</th><th>البريد</th><th>الدور</th><th>الحالة</th><th>التاريخ</th><th>إجراءات</th>
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td><strong>{u.name}</strong></td>
                          <td className="text-muted">{u.email}</td>
                          <td>
                            <select
                              className="role-select"
                              value={u.role}
                              style={{ color: roleColor[u.role] }}
                              onChange={e => changeRole(u.id, e.target.value)}
                            >
                              <option value="USER">USER</option>
                              <option value="BRAND">BRAND</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </td>
                          <td>
                            <span className={`status-badge ${u.isVerified ? 'verified' : 'unverified'}`}>
                              {u.isVerified ? '✓ مفعّل' : '✗ غير مفعّل'}
                            </span>
                          </td>
                          <td className="text-muted">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn-icon" title={u.isVerified ? 'إلغاء التفعيل' : 'تفعيل'} onClick={() => toggleVerify(u.id)}>
                                {u.isVerified ? <XCircle size={15}/> : <CheckCircle size={15}/>}
                              </button>
                              <button className="btn-icon delete" title="حذف" onClick={() => deleteUser(u.id, u.name)}>
                                <Trash2 size={15}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && <tr><td colSpan="6" className="empty-row">لا توجد نتائج</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── BRANDS TAB ── */}
          {activeTab === 'brands' && (
            <>
              <div className="content-header">
                <h3>البراندات ({filteredBrands.length})</h3>
                <button className="btn-refresh" onClick={fetchBrands}><RefreshCw size={15}/></button>
              </div>
              {brandsLoading ? <div className="admin-loading">جاري التحميل...</div> : (
                <div className="brands-admin-grid">
                  {filteredBrands.map(b => {
                    const theme = b.brandProfile?.theme ? (() => { try { return JSON.parse(b.brandProfile.theme); } catch { return {}; } })() : {};
                    const color = theme.primary || '#2563eb';
                    const isPaused = b.brandProfile?.isPaused;
                    return (
                      <div key={b.id} className={`brand-admin-card ${isPaused ? 'paused' : ''}`}>
                        <div className="bac-logo" style={{ background: color + '20', color }}>
                          {b.brandProfile?.logo
                            ? <img src={b.brandProfile.logo} alt={b.name}/>
                            : b.name.charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="bac-info">
                          <h4>{b.name}</h4>
                          <span className="bac-count">{b._count?.products || 0} منتج</span>
                          {isPaused && <span className="bac-paused-badge">موقوف</span>}
                        </div>
                        <div className="bac-actions">
                          <button
                            className={`btn-pause ${isPaused ? 'resume' : 'pause'}`}
                            onClick={() => toggleBrandPause(b.id)}
                          >
                            {isPaused ? '▶ تشغيل' : '⏸ إيقاف'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {filteredBrands.length === 0 && <div className="empty-state">لا توجد براندات مسجلة</div>}
                </div>
              )}
            </>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === 'products' && (
            <>
              <div className="content-header">
                <h3>المنتجات ({filteredProducts.length})</h3>
                <button className="btn-refresh" onClick={fetchProducts}><RefreshCw size={15}/></button>
              </div>
              {prodsLoading ? <div className="admin-loading">جاري التحميل...</div> : (
                <div className="table-wrapper">
                  <table className="admin-table">
                    <thead><tr>
                      <th>المنتج</th><th>البراند</th><th>السعر</th><th>المخزون</th><th>التصنيف</th><th>إجراءات</th>
                    </tr></thead>
                    <tbody>
                      {filteredProducts.map(p => (
                        <tr key={p.id}>
                          <td><strong>{p.name}</strong></td>
                          <td className="text-muted">{p.brand?.name || '—'}</td>
                          <td><strong style={{ color: '#2563eb' }}>{p.price} ج.م</strong></td>
                          <td>{p.stock}</td>
                          <td className="text-muted">{p.category?.name || '—'}</td>
                          <td>
                            <div className="actions-cell">
                              <button className="btn-icon delete" title="حذف" onClick={() => deleteProduct(p.id, p.name)}>
                                <Trash2 size={15}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && <tr><td colSpan="6" className="empty-row">لا توجد منتجات</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* ── ADD BRAND TAB ── */}
          {activeTab === 'addBrand' && (
            <div className="add-brand-section">
              <div className="content-header">
                <h3>إنشاء حساب براند جديد</h3>
              </div>
              <p className="add-brand-desc">البراند سيحصل على لوحة تحكم خاصة لإدارة منتجاته وتخصيص متجره.</p>
              <form className="add-brand-form" onSubmit={handleAddBrand}>
                <div className="form-group">
                  <label>اسم البراند</label>
                  <input type="text" placeholder="مثال: Lumière" className="form-input" required
                    value={brandForm.name} onChange={e => setBrandForm({...brandForm, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>البريد الإلكتروني</label>
                  <input type="email" placeholder="brand@example.com" className="form-input" required
                    value={brandForm.email} onChange={e => setBrandForm({...brandForm, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>كلمة المرور</label>
                  <input type="password" placeholder="كلمة مرور قوية" className="form-input" required
                    value={brandForm.password} onChange={e => setBrandForm({...brandForm, password: e.target.value})} />
                </div>
                <button type="submit" className="btn btn-primary" disabled={addLoading}>
                  {addLoading ? 'جاري الإنشاء...' : <><Plus size={18}/> إنشاء البراند</>}
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
