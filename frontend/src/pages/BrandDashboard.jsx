import { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag, Plus, Settings, Save, Upload, Palette,
  Trash2, Edit2, Eye, EyeOff, CheckCircle, AlertTriangle,
  Package, Store, RefreshCw, X
} from 'lucide-react';
import './BrandDashboard.css';

const API = import.meta.env.VITE_API_URL || '';
const token = () => localStorage.getItem('token');

const Toast = ({ msg, type, onClose }) => (
  <div className={`bd-toast bd-toast-${type}`}>
    {type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
    <span>{msg}</span>
    <button onClick={onClose}>×</button>
  </div>
);

const BrandDashboard = () => {
  const [activeTab, setActiveTab] = useState('customize');
  const [toast, setToast]         = useState(null);
  const brandName = localStorage.getItem('userName') || 'ماركة';

  // Profile state
  const [profile, setProfile] = useState({ logo: '', banner: '', description: '', theme: '' });
  const [themeColor, setThemeColor] = useState('#2563eb');
  const [profileLoading, setPL] = useState(false);
  const [saveLoading, setSL]   = useState(false);

  // Products state
  const [products, setProducts]   = useState([]);
  const [prodsLoading, setProdsL] = useState(false);

  // Add product modal
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [prodForm, setProdForm] = useState({ name: '', description: '', price: '', stock: '', images: '' });
  const [prodSaving, setProdSaving] = useState(false);
  const [previewImg, setPreviewImg] = useState('');

  // Store pause
  const [isPaused, setIsPaused] = useState(false);
  const [pauseLoading, setPauseL] = useState(false);

  const logoRef   = useRef();
  const bannerRef = useRef();

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch profile ─────────────────────────────────────
  const fetchProfile = async () => {
    setPL(true);
    try {
      const r = await fetch(`${API}/v1/brands/me/profile`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) {
        const p = d.profile;
        setProfile({ logo: p.logo||'', banner: p.banner||'', description: p.description||'', theme: p.theme||'' });
        setIsPaused(p.isPaused || false);
        try { const t = JSON.parse(p.theme); if (t.primary) setThemeColor(t.primary); } catch {}
      }
    } catch {} finally { setPL(false); }
  };

  // ── Fetch products ────────────────────────────────────
  const fetchProducts = async () => {
    setProdsL(true);
    try {
      const r = await fetch(`${API}/v1/brands/me/products`, { headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) setProducts(d.products);
    } catch {} finally { setProdsL(false); }
  };

  useEffect(() => { fetchProfile(); fetchProducts(); }, []);

  // ── Save profile ──────────────────────────────────────
  const saveProfile = async () => {
    setSL(true);
    try {
      const themeJson = JSON.stringify({ primary: themeColor });
      const r = await fetch(`${API}/v1/brands/me/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ ...profile, theme: themeJson })
      });
      const d = await r.json();
      if (d.success) showToast('تم حفظ التغييرات بنجاح ✓');
      else showToast(d.message, 'error');
    } catch { showToast('خطأ في الاتصال', 'error'); }
    finally { setSL(false); }
  };

  // ── Toggle pause ──────────────────────────────────────
  const togglePause = async () => {
    setPauseL(true);
    try {
      const r = await fetch(`${API}/v1/brands/me/pause`, { method: 'PATCH', headers: { Authorization: `Bearer ${token()}` } });
      const d = await r.json();
      if (d.success) { setIsPaused(d.isPaused); showToast(d.message); }
      else showToast(d.message, 'error');
    } catch { showToast('خطأ', 'error'); }
    finally { setPauseL(false); }
  };

  // ── Image to Base64 ───────────────────────────────────
  const toBase64 = (file) => new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('حجم اللوجو أكبر من 2MB', 'error'); return; }
    const b64 = await toBase64(file);
    setProfile(p => ({ ...p, logo: b64 }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { showToast('حجم البانر أكبر من 4MB', 'error'); return; }
    const b64 = await toBase64(file);
    setProfile(p => ({ ...p, banner: b64 }));
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast('حجم الصورة أكبر من 3MB', 'error'); return; }
    const b64 = await toBase64(file);
    setPreviewImg(b64);
    setProdForm(f => ({ ...f, images: b64 }));
  };

  // ── Product CRUD ──────────────────────────────────────
  const openAddModal = () => {
    setEditProduct(null);
    setProdForm({ name: '', description: '', price: '', stock: '', images: '' });
    setPreviewImg('');
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditProduct(p);
    setProdForm({ name: p.name, description: p.description||'', price: String(p.price), stock: String(p.stock), images: p.images||'' });
    setPreviewImg(p.images||'');
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!prodForm.name || !prodForm.price) { showToast('الاسم والسعر مطلوبان', 'error'); return; }
    setProdSaving(true);
    try {
      const url = editProduct
        ? `${API}/v1/brands/me/products/${editProduct.id}`
        : `${API}/v1/brands/me/products`;
      const method = editProduct ? 'PUT' : 'POST';
      const r = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify(prodForm)
      });
      const d = await r.json();
      if (d.success) {
        showToast(editProduct ? 'تم تحديث المنتج ✓' : 'تم إضافة المنتج ✓');
        setShowModal(false);
        fetchProducts();
      } else showToast(d.message, 'error');
    } catch { showToast('خطأ في الاتصال', 'error'); }
    finally { setProdSaving(false); }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!confirm(`حذف "${name}"؟`)) return;
    const r = await fetch(`${API}/v1/brands/me/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } });
    const d = await r.json();
    if (d.success) { showToast('تم الحذف'); fetchProducts(); }
    else showToast(d.message, 'error');
  };

  const tabs = [
    { id: 'customize', icon: <Palette size={18}/>,    label: 'التخصيص' },
    { id: 'products',  icon: <Package size={18}/>,    label: 'منتجاتي', count: products.length },
    { id: 'settings',  icon: <Settings size={18}/>,   label: 'الإعدادات' },
  ];

  return (
    <div className="bd-page container">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── Product Modal ── */}
      {showModal && (
        <div className="bd-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="bd-modal" onClick={e => e.stopPropagation()}>
            <div className="bd-modal-header">
              <h3>{editProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
              <button className="bd-modal-close" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <div className="bd-modal-body">
              {/* Product Image */}
              <div className="prod-img-upload" onClick={() => document.getElementById('prod-img-input').click()}>
                {previewImg
                  ? <img src={previewImg} alt="preview"/>
                  : <><Upload size={28}/><span>اضغط لرفع صورة المنتج</span><small>حد أقصى 3MB</small></>
                }
                <input id="prod-img-input" type="file" accept="image/*" hidden onChange={handleProductImageUpload}/>
              </div>
              <div className="bd-modal-fields">
                <div className="form-group">
                  <label>اسم المنتج *</label>
                  <input className="form-input" placeholder="مثال: عقد ذهب 21" value={prodForm.name} onChange={e => setProdForm(f=>({...f,name:e.target.value}))}/>
                </div>
                <div className="form-group">
                  <label>الوصف</label>
                  <textarea className="form-input" rows={3} placeholder="وصف المنتج..." value={prodForm.description} onChange={e => setProdForm(f=>({...f,description:e.target.value}))}/>
                </div>
                <div className="bd-two-cols">
                  <div className="form-group">
                    <label>السعر (ج.م) *</label>
                    <input className="form-input" type="number" min="0" placeholder="0.00" value={prodForm.price} onChange={e => setProdForm(f=>({...f,price:e.target.value}))}/>
                  </div>
                  <div className="form-group">
                    <label>المخزون</label>
                    <input className="form-input" type="number" min="0" placeholder="0" value={prodForm.stock} onChange={e => setProdForm(f=>({...f,stock:e.target.value}))}/>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={handleSaveProduct} disabled={prodSaving}>
                  {prodSaving ? 'جاري الحفظ...' : <><Save size={16}/> {editProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="bd-header">
        <div className="bd-header-left">
          <div className="bd-avatar" style={{ background: themeColor + '20', color: themeColor }}>
            {profile.logo ? <img src={profile.logo} alt="logo"/> : brandName.charAt(0)}
          </div>
          <div>
            <h2>{brandName}</h2>
            <p className="bd-subtitle">لوحة تحكم البراند</p>
          </div>
        </div>
        <span className={`bd-status ${isPaused ? 'paused' : 'active'}`}>
          {isPaused ? '⏸ موقوف' : '● نشط'}
        </span>
      </div>

      <div className="bd-grid">
        {/* Sidebar */}
        <aside className="bd-sidebar">
          <ul className="bd-menu">
            {tabs.map(t => (
              <li key={t.id} className={activeTab === t.id ? 'active' : ''} onClick={() => setActiveTab(t.id)}>
                {t.icon}<span>{t.label}</span>
                {t.count !== undefined && <span className="menu-badge">{t.count}</span>}
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <main className="bd-content">

          {/* ── CUSTOMIZE TAB ── */}
          {activeTab === 'customize' && (
            <div className="bd-customize">
              <div className="content-header">
                <h3>تخصيص هوية البراند</h3>
                <button className="btn btn-primary bd-save-btn" onClick={saveProfile} disabled={saveLoading}>
                  {saveLoading ? 'جاري الحفظ...' : <><Save size={16}/> حفظ</>}
                </button>
              </div>

              <div className="customize-layout">
                {/* Controls */}
                <div className="customize-controls">
                  {/* Logo Upload */}
                  <div className="ctrl-section">
                    <h4><Upload size={15}/> اللوجو</h4>
                    <div className="logo-upload-box" onClick={() => logoRef.current.click()}>
                      {profile.logo
                        ? <img src={profile.logo} alt="logo"/>
                        : <><Upload size={24}/><span>ارفع اللوجو</span><small>حد أقصى 2MB</small></>
                      }
                      <input ref={logoRef} type="file" accept="image/*" hidden onChange={handleLogoUpload}/>
                    </div>
                    {profile.logo && (
                      <button className="btn-remove" onClick={() => setProfile(p=>({...p,logo:''}))}>
                        <X size={12}/> إزالة اللوجو
                      </button>
                    )}
                  </div>

                  {/* Banner Upload */}
                  <div className="ctrl-section">
                    <h4><Upload size={15}/> البانر</h4>
                    <div className="banner-upload-box" onClick={() => bannerRef.current.click()}>
                      {profile.banner
                        ? <img src={profile.banner} alt="banner"/>
                        : <><Upload size={24}/><span>ارفع البانر</span><small>حد أقصى 4MB</small></>
                      }
                      <input ref={bannerRef} type="file" accept="image/*" hidden onChange={handleBannerUpload}/>
                    </div>
                    {profile.banner && (
                      <button className="btn-remove" onClick={() => setProfile(p=>({...p,banner:''}))}>
                        <X size={12}/> إزالة البانر
                      </button>
                    )}
                  </div>

                  {/* Theme Color */}
                  <div className="ctrl-section">
                    <h4><Palette size={15}/> لون الثيم</h4>
                    <div className="color-picker-row">
                      <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="color-input"/>
                      <span className="color-hex">{themeColor}</span>
                    </div>
                    <div className="color-presets">
                      {['#2563eb','#ec4899','#8b5cf6','#10b981','#f59e0b','#ef4444','#0ea5e9','#14b8a6'].map(c => (
                        <div key={c} className={`color-dot ${themeColor===c?'selected':''}`} style={{ background: c }} onClick={() => setThemeColor(c)}/>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="ctrl-section">
                    <h4>وصف البراند</h4>
                    <textarea
                      className="form-input"
                      rows={4}
                      placeholder="اكتب وصفاً مختصراً لبراندك..."
                      value={profile.description}
                      onChange={e => setProfile(p=>({...p,description:e.target.value}))}
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="customize-preview">
                  <div className="preview-label"><Eye size={14}/> معاينة حية</div>

                  {/* Brand Card Preview (Figma style) */}
                  <div className="preview-brand-card" style={{ background: '#e5e5e5' }}>
                    <div className="pbc-top">
                      <span className="pbc-name">{brandName}</span>
                      <span className="pbc-eval" style={{ color: themeColor }}>EVALUATION</span>
                    </div>
                    <p className="pbc-desc">{profile.description || 'وصف البراند سيظهر هنا...'}</p>
                    <div className="pbc-logo-wrap">
                      {profile.logo
                        ? <img src={profile.logo} alt="logo" className="pbc-logo-img"/>
                        : <div className="pbc-logo-ph" style={{ background: themeColor }}>{brandName.charAt(0)}</div>
                      }
                    </div>
                  </div>

                  {/* Brand Page Preview */}
                  <div className="preview-page-header">
                    <div className="pph-banner" style={{ background: profile.banner ? `url(${profile.banner}) center/cover` : themeColor + '30' }}>
                      {!profile.banner && <span style={{ color: themeColor, fontWeight: 700 }}>بانر الصفحة</span>}
                    </div>
                    <div className="pph-info">
                      <div className="pph-avatar" style={{ background: themeColor }}>
                        {profile.logo ? <img src={profile.logo} alt="logo"/> : brandName.charAt(0)}
                      </div>
                      <div>
                        <strong>{brandName}</strong>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>{profile.description || 'وصف البراند'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PRODUCTS TAB ── */}
          {activeTab === 'products' && (
            <div>
              <div className="content-header">
                <h3>منتجاتي ({products.length})</h3>
                <div style={{ display:'flex', gap: 8 }}>
                  <button className="btn-refresh" onClick={fetchProducts}><RefreshCw size={15}/></button>
                  <button className="btn btn-primary" onClick={openAddModal}><Plus size={16}/> إضافة منتج</button>
                </div>
              </div>
              {prodsLoading ? <div className="bd-loading">جاري التحميل...</div> : (
                products.length === 0
                  ? (
                    <div className="bd-empty">
                      <Package size={48} color="#cbd5e1"/>
                      <p>لا توجد منتجات بعد</p>
                      <button className="btn btn-primary" onClick={openAddModal}><Plus size={16}/> أضف أول منتج</button>
                    </div>
                  )
                  : (
                    <div className="bd-products-grid">
                      {products.map(p => (
                        <div key={p.id} className="bd-product-card">
                          <div className="bd-prod-img">
                            {p.images
                              ? <img src={p.images} alt={p.name}/>
                              : <div className="bd-prod-img-ph" style={{ background: themeColor + '20', color: themeColor }}><ShoppingBag size={28}/></div>
                            }
                          </div>
                          <div className="bd-prod-info">
                            <h4>{p.name}</h4>
                            <p className="bd-prod-price" style={{ color: themeColor }}>{p.price} ج.م</p>
                            <p className="bd-prod-stock">مخزون: {p.stock}</p>
                          </div>
                          <div className="bd-prod-actions">
                            <button className="btn-icon" onClick={() => openEditModal(p)}><Edit2 size={14}/></button>
                            <button className="btn-icon delete" onClick={() => handleDeleteProduct(p.id, p.name)}><Trash2 size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
              )}
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div className="bd-settings">
              <div className="content-header"><h3>إعدادات المتجر</h3></div>
              <div className="settings-card">
                <div className="settings-row">
                  <div>
                    <h4>{isPaused ? '⏸ المتجر موقوف حالياً' : '● المتجر نشط ويعمل'}</h4>
                    <p>{isPaused ? 'عملاؤك لا يستطيعون رؤية متجرك حالياً.' : 'متجرك ظاهر للزوار ويمكنهم التسوق.'}</p>
                  </div>
                  <button
                    className={`btn-pause-store ${isPaused ? 'resume' : 'pause'}`}
                    onClick={togglePause}
                    disabled={pauseLoading}
                  >
                    {pauseLoading ? '...' : isPaused ? '▶ تشغيل المتجر' : '⏸ إيقاف المتجر مؤقتاً'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default BrandDashboard;
