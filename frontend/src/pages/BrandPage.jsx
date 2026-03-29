import { useParams } from 'react-router-dom';
import { BadgeCheck, ShoppingCart } from 'lucide-react';
import './BrandPage.css';

// Mock DB
const MOCK_BRANDS = {
  '1': { id: 1, name: 'Lumière', category: 'مجوهرات وساعات', promoted: true, color: '#f59e0b', cover: '#fef3c7' },
  '2': { id: 2, name: 'Aura', category: 'مستحضرات تجميل', promoted: true, color: '#ec4899', cover: '#fce7f3' },
};

const MOCK_PRODUCTS = [
  { id: 101, name: 'عقد ذهب عيار 21', price: '4500 ريال', promoted: true, image: '#fde68a' },
  { id: 102, name: 'ساعة ألماس - محدودة', price: '12000 ريال', promoted: false, image: '#e2e8f0' },
  { id: 103, name: 'سوار فرنسي', price: '800 ريال', promoted: false, image: '#e2e8f0' },
];

const BrandPage = () => {
  const { id } = useParams();
  const brand = MOCK_BRANDS[id] || { name: 'ماركة غير معروفة', category: '', color: '#3b82f6', cover: '#dbeafe' };

  return (
    <div className="brand-page">
      <div className="brand-cover" style={{ backgroundColor: brand.cover }}>
        <div className="container cover-content">
          <div className="brand-avatar" style={{ backgroundColor: '#ffffff', color: brand.color, border: `4px solid ${brand.color}20` }}>
            {brand.name.charAt(0)}
          </div>
          <div className="brand-header-info">
            <h1>{brand.name}</h1>
            <p className="brand-cat">{brand.category}</p>
          </div>
        </div>
      </div>

      <div className="container brand-content">
        <div className="section-header-left">
          <h2>أحدث المنتجات</h2>
        </div>

        <div className="products-grid">
          {MOCK_PRODUCTS.map(prod => (
            <div key={prod.id} className="product-card card">
              {prod.promoted && <span className="badge-promoted"><BadgeCheck size={14}/> مميز</span>}
              <div className="product-img-ph" style={{ backgroundColor: prod.image }}></div>
              <div className="product-details">
                <h4>{prod.name}</h4>
                <p className="price text-primary">{prod.price}</p>
                <button className="btn btn-primary full-width">
                  <ShoppingCart size={18} /> أضف للسلة
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandPage;
