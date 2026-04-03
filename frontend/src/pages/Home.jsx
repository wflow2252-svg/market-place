import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import BrandCard from '../components/BrandCard';
import './Home.css';

const API = import.meta.env.VITE_API_URL || '';

const Home = () => {
  const [brands, setBrands]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all'); // 'all' | 'active' | 'new'

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const r = await fetch(`${API}/v1/brands`);
        const d = await r.json();
        if (d.success) setBrands(d.brands);
      } catch (err) {
        console.error('Error fetching brands:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // Separate promoted (active, has products) vs regular
  const promoted = brands.filter(b => !b.brandProfile?.isPaused && (b._count?.products || 0) > 0);
  const regular  = brands.filter(b => !(b._count?.products > 0 && !b.brandProfile?.isPaused));

  // Map promoted brands for the card
  const displayBrands = brands
    .map(b => ({ ...b, promoted: !b.brandProfile?.isPaused && (b._count?.products || 0) >= 3 }))
    .sort((a, b) => (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0));

  return (
    <div>
      <div className="container">
        <Hero />

        <section className="brands-section">
          <div className="section-header">
            <div className="section-header-text">
              <h2>العلامات التجارية</h2>
              <p className="section-subtitle">تصفح مجموعة من أفضل الماركات وأحدث تشكيلاتها</p>
            </div>
            <div className="brands-filter">
              {[
                { key: 'all',    label: 'الكل' },
                { key: 'active', label: 'النشطة' },
                { key: 'new',    label: 'الجديدة' },
              ].map(f => (
                <button
                  key={f.key}
                  className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="brands-skeleton">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card"/>)}
            </div>
          ) : displayBrands.length === 0 ? (
            <div className="brands-empty">
              <p>لا توجد براندات مسجلة بعد</p>
            </div>
          ) : (
            <div className="brands-grid">
              {displayBrands
                .filter(b => {
                  if (filter === 'active') return !b.brandProfile?.isPaused;
                  if (filter === 'new')    return (b._count?.products || 0) === 0;
                  return true;
                })
                .map(brand => (
                  <div key={brand.id} className="grid-item">
                    <BrandCard brand={brand} />
                  </div>
                ))
              }
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
