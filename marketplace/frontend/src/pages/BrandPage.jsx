import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BadgeCheck, ShoppingCart, Loader } from 'lucide-react';
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
        const res = await fetch(`${API_URL}/v1/users/brand/${id}`);
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

  // AI Generated Theme Application
  let theme = { primaryColor: '#94a3b8', secondaryColor: 'rgba(148,163,184,0.1)', accentColor: '#0f172a', styleTemplate: 'Pure Minimal' };
  if (brand.brandTheme) {
    try {
      theme = JSON.parse(brand.brandTheme);
    } catch (e) { console.error('Theme parse error', e); }
  }

  const pageStyle = {
    '--brand-primary': theme.primaryColor,
    '--brand-secondary': theme.secondaryColor,
    '--brand-accent': theme.accentColor,
    backgroundColor: theme.styleTemplate === 'Bold Noir' ? '#050505' : 'transparent'
  };

  const getHeroClass = () => {
    if (theme.styleTemplate === 'Bold Noir') return 'brand-hero elite-bold';
    if (theme.styleTemplate === 'Classic Aurum') return 'brand-hero elite-classic';
    return 'brand-hero elite-minimal';
  };

  const bannerStyle = brand.brandBanner 
    ? { backgroundImage: `url(${brand.brandBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: theme.styleTemplate === 'Bold Noir' 
        ? 'linear-gradient(180deg, #000 0%, #1a1a1a 100%)' 
        : `linear-gradient(135deg, ${theme.primaryColor}, #050505)` };

  return (
    <div className={`brand-page animate-fade-in ${theme.styleTemplate?.toLowerCase().replace(' ', '-')}`} style={pageStyle}>
      {/* Hero Mini-Site Header */}
      <div className={getHeroClass()} style={bannerStyle}>
        <div className="brand-hero-overlay"></div>
        <div className="container brand-hero-content">
          <div className="brand-avatar-premium glass-panel animate-luxe">
            {brand.brandLogo ? (
              <img src={brand.brandLogo} alt={brand.name} />
            ) : (
              <span className="brand-initial title-serif" style={{ color: theme.primaryColor }}>{brand.name.charAt(0).toUpperCase()}</span>
            )}
            <BadgeCheck className="verified-badge-large silver-glow" size={32} style={{ color: theme.primaryColor }} />
          </div>
          <div className="brand-info">
            <h1 className="brand-title title-serif text-gradient-silver">{brand.name}</h1>
            {brand.brandDescription ? (
              <p className="brand-bio">{brand.brandDescription}</p>
            ) : (
              <p className="brand-bio text-muted">الهوية الرقمية الموثقة للماركة على منصة LuxeBrands الفريدة.</p>
            )}
            <div className="brand-stats">
              <span className="glass-panel" style={{ borderColor: theme.primaryColor }}>
                <strong className="text-gradient-silver">{brand.products?.length || 0}</strong> قطع حصرية
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="container brand-showcase">
        <div className="section-header-elite">
          <h2 className="title-serif" style={{ color: theme.primaryColor }}>التشكيلة المختارة</h2>
          <div className="header-line-silver" style={{ background: theme.primaryColor }}></div>
        </div>

        {brand.products && brand.products.length > 0 ? (
          <div className="products-grid">
            {brand.products.map((prod, index) => (
              <div key={prod.id} className={`product-card-elite glass-panel animate-fade-in stagger-${(index % 5) + 1}`}>
                <div className="product-img-ph">
                  {prod.images ? <img src={prod.images} alt={prod.name} /> : <div className="placeholder-solid" style={{ background: theme.secondaryColor }}></div>}
                </div>
                <div className="product-details-elite">
                  <h4 className="title-serif">{prod.name}</h4>
                  <p className="price silver-glow">{prod.price} ج.م</p>
                  <button className="btn-luxe full-width" style={{ marginTop: '15px' }}>
                    <ShoppingCart size={18} /> أضف للنخبة
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-catalog text-center glass-panel">
            <BadgeCheck size={48} color="var(--accent-silver)" />
            <h3 className="title-serif">ترقبوا التدشين قريباً</h3>
            <p className="text-muted">الماركة تقوم حالياً بتجهيز أحدث مجموعاتها الفاخرة.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
