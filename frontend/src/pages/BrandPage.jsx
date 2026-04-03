import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BadgeCheck, ShoppingCart, Loader, PauseCircle } from 'lucide-react';
import './BrandPage.css';

const BrandPage = () => {
  const { id } = useParams();
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/v1/brands/${id}`);
        const data = await res.json();
        if (data.success) {
          setBrand(data.brand);
        } else {
          setError(data.message || 'الماركة غير موجودة');
        }
      } catch (err) {
        setError('حدث خطأ أثناء تحميل بيانات الماركة.');
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [id]);

  if (loading) return <div className="brand-page-loading"><Loader className="spinner" size={40} /></div>;
  if (error) return <div className="brand-page-error"><h2>{error}</h2></div>;
  if (!brand) return null;

  const profile = brand.brandProfile || {};
  const products = brand.products || [];

  // Parse theme colors
  let primaryColor = '#c9a84c';
  let secondaryColor = 'rgba(201,168,76,0.12)';
  if (profile.theme) {
    try {
      const t = JSON.parse(profile.theme);
      primaryColor = t.primaryColor || t.primary || primaryColor;
      secondaryColor = t.secondaryColor || t.secondary || secondaryColor;
    } catch (e) {}
  }

  const bannerStyle = profile.banner
    ? { backgroundImage: `url(${profile.banner})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: `linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, ${primaryColor}22 100%)` };

  return (
    <div className="brand-page animate-fade-in">

      {/* ===== HERO BANNER ===== */}
      <div className="brand-hero" style={bannerStyle}>
        <div className="brand-hero-overlay" />
        <div className="container brand-hero-content">

          {/* Logo */}
          <div className="brand-avatar-premium glass-panel">
            {profile.logo ? (
              <img src={profile.logo} alt={brand.name} />
            ) : (
              <span className="brand-initial title-serif" style={{ color: primaryColor }}>
                {brand.name.charAt(0).toUpperCase()}
              </span>
            )}
            <BadgeCheck className="verified-badge-large" size={28} style={{ color: primaryColor }} />
          </div>

          {/* Info */}
          <div className="brand-info">
            <h1 className="brand-title title-serif" style={{ color: '#fff' }}>{brand.name}</h1>
            <p className="brand-bio">
              {profile.description || 'الهوية الرقمية الموثقة للماركة على منصة LuxeBrands الفريدة.'}
            </p>
            <div className="brand-stats">
              <span className="glass-panel" style={{ borderColor: primaryColor, color: primaryColor }}>
                <strong>{products.length}</strong> منتج
              </span>
              {profile.isPaused && (
                <span className="glass-panel paused-badge">
                  <PauseCircle size={14} /> مغلق مؤقتاً
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== PRODUCTS SECTION ===== */}
      <div className="container brand-showcase">
        <div className="section-header-elite">
          <h2 className="title-serif" style={{ color: primaryColor }}>التشكيلة المختارة</h2>
          <div className="header-line-silver" style={{ background: primaryColor }} />
        </div>

        {products.length > 0 ? (
          <div className="products-grid">
            {products.map((prod, index) => (
              <div key={prod.id} className={`product-card-elite glass-panel animate-fade-in stagger-${(index % 5) + 1}`}>
                <div className="product-img-ph">
                  {prod.images
                    ? <img src={prod.images} alt={prod.name} />
                    : <div className="placeholder-solid" style={{ background: secondaryColor }} />
                  }
                </div>
                <div className="product-details-elite">
                  <h4 className="title-serif">{prod.name}</h4>
                  {prod.description && <p className="prod-desc text-muted">{prod.description.slice(0, 70)}...</p>}
                  <p className="price" style={{ color: primaryColor }}>{prod.price} ج.م</p>
                  <div className="stock-badge">{prod.stock > 0 ? `متاح (${prod.stock})` : 'نفذت الكمية'}</div>
                  <button className="btn-luxe full-width" style={{ marginTop: '15px', '--btn-color': primaryColor }}>
                    <ShoppingCart size={18} /> أضف للسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-catalog text-center glass-panel">
            <BadgeCheck size={48} color={primaryColor} />
            <h3 className="title-serif">ترقبوا التدشين قريباً</h3>
            <p className="text-muted">الماركة تقوم حالياً بتجهيز أحدث مجموعاتها الفاخرة.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
