import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BadgeCheck, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import './BrandPage.css';

const API = import.meta.env.VITE_API_URL || '';

const BrandPage = () => {
  const { id } = useParams();
  const [brand, setBrand]       = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cart, setCart]         = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [brandRes, prodRes] = await Promise.all([
          fetch(`${API}/v1/brands/${id}`),
          fetch(`${API}/v1/products/brand/${id}`)
        ]);
        const brandData = await brandRes.json();
        const prodData  = await prodRes.json();
        if (brandData.success) setBrand(brandData.brand);
        if (prodData.success)  setProducts(prodData.data);
      } catch (err) {
        console.error('Error loading brand page:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  const addToCart = (product) => {
    setCart(c => {
      const existing = c.find(i => i.id === product.id);
      if (existing) return c.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { ...product, qty: 1 }];
    });
  };

  if (loading) {
    return (
      <div className="bp-loading-page">
        <div className="bp-cover-skeleton"/>
        <div className="container">
          <div className="bp-info-skeleton"/>
          <div className="bp-products-skeleton">
            {[1,2,3,4].map(i => <div key={i} className="bp-prod-skeleton"/>)}
          </div>
        </div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="container bp-not-found">
        <Package size={64} color="#cbd5e1"/>
        <h2>البراند غير موجود</h2>
        <Link to="/" className="btn btn-primary">العودة للرئيسية</Link>
      </div>
    );
  }

  const profile  = brand.brandProfile || {};
  const theme    = profile.theme ? (() => { try { return JSON.parse(profile.theme); } catch { return {}; } })() : {};
  const color    = theme.primary || '#2563eb';
  const isPaused = profile.isPaused || false;

  const promoted = products.filter(p => p.stock > 0).slice(0, 2).map(p => p.id);

  return (
    <div className="brand-page">

      {/* Paused Banner */}
      {isPaused && (
        <div className="bp-paused-banner">
          <span>⏸ هذا المتجر موقوف مؤقتاً ولا يقبل الطلبات حالياً</span>
        </div>
      )}

      {/* Cover / Banner */}
      <div
        className="brand-cover"
        style={{
          background: profile.banner
            ? `url(${profile.banner}) center/cover no-repeat`
            : `linear-gradient(135deg, ${color}20, ${color}40)`
        }}
      >
        <div className="cover-gradient"/>
        <div className="container cover-content">
          <div className="brand-avatar" style={{ background: color, boxShadow: `0 8px 32px ${color}50` }}>
            {profile.logo ? <img src={profile.logo} alt={brand.name}/> : brand.name.charAt(0).toUpperCase()}
          </div>
          <div className="brand-header-info">
            <div className="brand-name-row">
              <h1>{brand.name}</h1>
              {!isPaused && <span className="bp-active-dot">● نشط</span>}
            </div>
            {profile.description && <p className="brand-cat">{profile.description}</p>}
            <span className="bp-count-badge" style={{ background: color + '20', color }}>
              {brand._count?.products || 0} منتج
            </span>
          </div>
        </div>
      </div>

      {/* Cart bar */}
      {cart.length > 0 && (
        <div className="bp-cart-bar">
          <span>🛒 {cart.reduce((s, i) => s + i.qty, 0)} عناصر في السلة</span>
          <span className="bp-cart-total">{cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)} ج.م</span>
        </div>
      )}

      {/* Products */}
      <div className="container brand-content">
        <div className="section-header-left">
          <h2>المنتجات</h2>
          <span className="prod-count">{products.length} منتج</span>
        </div>

        {products.length === 0 ? (
          <div className="bp-no-products">
            <Package size={56} color="#cbd5e1"/>
            <p>لا توجد منتجات متاحة حالياً</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(prod => {
              const isPromoted = promoted.includes(prod.id);
              const inCart = cart.find(i => i.id === prod.id)?.qty || 0;
              return (
                <div key={prod.id} className={`product-card card ${isPromoted ? 'prod-promoted' : ''}`}>
                  {isPromoted && (
                    <span className="badge-promoted prod-badge">
                      <BadgeCheck size={12}/> الأكثر مبيعاً
                    </span>
                  )}

                  {/* Product Image */}
                  <div className="product-img-ph" style={{
                    background: prod.images ? 'transparent' : color + '15',
                    overflow: 'hidden'
                  }}>
                    {prod.images
                      ? <img src={prod.images} alt={prod.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                      : (
                        <div className="prod-img-fallback" style={{ color }}>
                          <ShoppingCart size={40}/>
                        </div>
                      )
                    }
                  </div>

                  {/* Details */}
                  <div className="product-details">
                    <h4>{prod.name}</h4>
                    {prod.description && <p className="prod-desc">{prod.description}</p>}
                    <div className="prod-bottom">
                      <p className="price" style={{ color }}>{prod.price.toFixed(2)} ج.م</p>
                      {prod.stock > 0 ? (
                        <button
                          className={`btn btn-primary full-width ${inCart > 0 ? 'in-cart' : ''}`}
                          style={{ background: color, borderColor: color }}
                          onClick={() => !isPaused && addToCart(prod)}
                          disabled={isPaused}
                        >
                          <ShoppingCart size={16}/>
                          {inCart > 0 ? `في السلة (${inCart})` : 'أضف للسلة'}
                        </button>
                      ) : (
                        <button className="btn btn-out-of-stock full-width" disabled>نفد المخزون</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPage;
