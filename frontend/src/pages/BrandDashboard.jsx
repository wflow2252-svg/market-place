import { useState } from 'react';
import { ShoppingBag, Plus, Settings } from 'lucide-react';
import './Admin.css'; // Reuse some layout styles

const BrandDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);
  const brandName = localStorage.getItem('userName') || 'ماركة مسجلة';

  return (
    <div className="admin-page container">
      <div className="admin-header glass-panel">
        <div className="admin-title">
          <ShoppingBag size={32} color="var(--primary-color)" />
          <h2 className="title-serif text-gradient">لوحة تحكم {brandName}</h2>
        </div>
        <p>مرحباً بك في لوحة تحكم متجرك الخاصة. أضف منتجاتك وعروضك هنا بكل سهولة.</p>
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
            <li><Settings size={18}/> إعدادات المتجر</li>
          </ul>
        </aside>

        <main className="admin-content glass-panel">
          {activeTab === 'products' ? (
            <div className="content-header">
              <h3>قائمة المنتجات الخاصة بك</h3>
              <p>ميزة إضافة المنتجات الفعلية وتعديلها سيتم إتاحتها قريباً بعد رفع السيرفر الجديد.</p>
            </div>
          ) : (
            <div className="add-brand-form">
              <div className="content-header">
                <h3>إضافة منتج جديد</h3>
                <p>قريباً جداً ستتمكن من رفع صور وتفاصيل منتجاتك وعرضها في المنصة.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrandDashboard;
