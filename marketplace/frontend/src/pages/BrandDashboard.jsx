import { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Settings, Trash2, Edit, Package, AlertTriangle, Pause, Image as ImageIcon } from 'lucide-react';
import './Admin.css';

const BrandDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({});
  const brandName = localStorage.getItem('userName') || 'ماركة مسجلة';
  const API_URL = import.meta.env.VITE_API_URL || '';
  const token = localStorage.getItem('token');

  // Form states
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', stock: '', images: '' });
  const [profileForm, setProfileForm] = useState({ logo: '', banner: '', description: '', isPaused: false });

  const fetchData = async () => {
    try {
      const [prodRes, ordRes, profRes] = await Promise.all([
        fetch(`${API_URL}/v1/brand/products`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/v1/brand/orders`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/v1/brand/profile`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const [prodData, ordData, profData] = await Promise.all([prodRes.json(), ordRes.json(), profRes.json()]);

      if (prodData.success) setProducts(prodData.products);
      if (ordData.success) setOrders(ordData.orderItems);
      if (profData.success) {
         setProfile(profData.profile);
         setProfileForm({
           logo: profData.profile.logo || '',
           banner: profData.profile.banner || '',
           description: profData.profile.description || '',
           isPaused: profData.profile.isPaused || false
         });
      }
    } catch (err) {
      console.error('Failed fetching data', err);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [activeTab]);

  const handleImageCompression = (e, callback) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const imgUrl = canvas.toDataURL('image/webp', 0.7);
        callback(imgUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/brand/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(productForm)
      });
      const data = await res.json();
      if (data.success) {
        alert('تم إضافة المنتج بنجاح');
        setProductForm({ name: '', description: '', price: '', stock: '', images: '' });
        setActiveTab('products');
      } else alert(data.message);
    } catch (err) { alert('خطأ في الاتصال'); }
    finally { setLoading(false); }
  };

  const handleDeleteProduct = async (id) => {
    if(!window.confirm('هل أنت متأكد من مسح المنتج؟')) return;
    try {
      const res = await fetch(`${API_URL}/v1/brand/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) { alert('خطأ أثناء المسح'); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/v1/brand/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (data.success) alert('تم حفظ الإعدادات بنجاح');
    } catch (err) { alert('خطأ في الحفظ'); }
    finally { setLoading(false); }
  };

  return (
    <div className="admin-page container">
      <div className="admin-header glass-panel">
        <div className="admin-title">
          <ShoppingBag size={32} color="var(--primary-color)" />
          <h2 className="title-serif text-gradient">لوحة تحكم {brandName}</h2>
        </div>
        {profileForm.isPaused && (
          <div className="error-banner" style={{marginTop:'10px', display:'inline-flex'}}>
            <AlertTriangle size={18}/> متجرك مغلق حالياً، عملائك لن يتمكنوا من الشراء.
          </div>
        )}
      </div>

      <div className="admin-grid">
        <aside className="admin-sidebar glass-panel">
          <ul className="admin-menu">
            <li className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
              <ShoppingBag size={18}/> منتجاتي
            </li>
            <li className={activeTab === 'addProduct' ? 'active' : ''} onClick={() => setActiveTab('addProduct')}>
              <Plus size={18}/> إضافة منتج جديد
            </li>
            <li className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
              <Package size={18}/> الطلبات
            </li>
            <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <Settings size={18}/> إعدادات وشكل المتجر
            </li>
          </ul>
        </aside>

        <main className="admin-content glass-panel">
          {activeTab === 'products' && (
            <div className="fade-in">
              <h3>المنتجات المعروضة ({products.length})</h3>
              <table className="admin-table mt-3">
                <thead><tr><th>الصورة</th><th>اسم المنتج</th><th>السعر</th><th>المخزون</th><th>إجراء</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>{p.images ? <img src={p.images} width="40" alt={p.name} style={{borderRadius:'5px'}}/> : '-'}</td>
                      <td>{p.name}</td>
                      <td>£{p.price}</td>
                      <td>{p.stock}</td>
                      <td>
                        <button className="btn-icon" onClick={() => handleDeleteProduct(p.id)}><Trash2 size={16} color="red"/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'addProduct' && (
            <form className="add-brand-form fade-in" onSubmit={handleAddProduct}>
              <h3>تفاصيل المنتج الجديد</h3>
              <div className="form-grid">
                <div className="input-group">
                  <input type="text" placeholder="اسم المنتج" className="form-input" required 
                         value={productForm.name} onChange={e=>setProductForm({...productForm, name:e.target.value})}/>
                </div>
                <div className="input-group">
                  <input type="number" placeholder="السعر (£)" className="form-input" required 
                         value={productForm.price} onChange={e=>setProductForm({...productForm, price:e.target.value})}/>
                </div>
                <div className="input-group full-width">
                  <textarea placeholder="وصف المنتج (مميزاته وتفاصيله)" className="form-input" rows="3"
                         value={productForm.description} onChange={e=>setProductForm({...productForm, description:e.target.value})}/>
                </div>
                <div className="input-group">
                  <input type="number" placeholder="الكمية المتاحة في المخزن" className="form-input" required 
                         value={productForm.stock} onChange={e=>setProductForm({...productForm, stock:e.target.value})}/>
                </div>
                <div className="input-group file-upload w-full">
                  <label className="file-label">
                    <ImageIcon size={20} /> رفع صورة المنتج
                    <input type="file" accept="image/*" onChange={(e) => handleImageCompression(e, (url)=> setProductForm({...productForm, images:url}))} />
                  </label>
                  {productForm.images && <img src={productForm.images} width="60" alt="Preview" className="mt-2" style={{borderRadius:'5px'}} />}
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-3 w-full" disabled={loading}>
                {loading ? 'جاري الرفع...' : 'نشر المنتج'}
              </button>
            </form>
          )}

          {activeTab === 'orders' && (
            <div className="fade-in">
              <h3>طلبات العملاء ({orders.length})</h3>
              <table className="admin-table mt-3">
                <thead><tr><th>رقم الطلب</th><th>المنتج</th><th>الكمية</th><th>المشتري</th><th>السعر وقت الشراء</th><th>حالة الطلب</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>#{o.orderId}</td>
                      <td>{o.product.name}</td>
                      <td>{o.quantity}</td>
                      <td>{o.order.user.name} <br/><small>{o.order.user.email}</small></td>
                      <td>£{o.price}</td>
                      <td><span className={`status-badge ${o.order.status.toLowerCase()}`}>{o.order.status}</span></td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="6" style={{textAlign:'center', padding:'20px'}}>لا توجد طلبات حالياً</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'settings' && (
            <form className="add-brand-form fade-in" onSubmit={handleUpdateProfile}>
              <h3>تخصيص شكل البراند</h3>
              <div className="form-grid">
                 <div className="input-group full-width">
                  <label className="checkbox-container" style={{color:'red', fontWeight:'bold'}}>
                    <input type="checkbox" checked={profileForm.isPaused} 
                           onChange={e=>setProfileForm({...profileForm, isPaused: e.target.checked})} />
                    <span className="checkmark" style={{borderColor:'red'}}></span>
                    إغلاق البراند مؤقتاً (عدم استقبال طلبات جديدة)
                  </label>
                </div>
                <div className="input-group full-width">
                  <textarea placeholder="وصف وتاريخ البراند للجمهور" className="form-input" rows="3"
                            value={profileForm.description} onChange={e=>setProfileForm({...profileForm, description:e.target.value})}/>
                </div>
                <div className="input-group file-upload w-full">
                  <label className="file-label">
                    <ImageIcon size={20} /> اللوجو الجديد
                    <input type="file" accept="image/*" onChange={(e) => handleImageCompression(e, (url)=> setProfileForm({...profileForm, logo:url}))} />
                  </label>
                  {profileForm.logo && <img src={profileForm.logo} width="60" className="mt-2" style={{borderRadius:'5px'}}/>}
                </div>
                <div className="input-group file-upload w-full">
                  <label className="file-label">
                    <ImageIcon size={20} /> بانر الصفحة (Cover)
                    <input type="file" accept="image/*" onChange={(e) => handleImageCompression(e, (url)=> setProfileForm({...profileForm, banner:url}))} />
                  </label>
                  {profileForm.banner && <img src={profileForm.banner} width="100" className="mt-2" style={{borderRadius:'5px'}}/>}
                </div>
              </div>
              <button type="submit" className="btn btn-primary mt-3 w-full" disabled={loading}>
                {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrandDashboard;
