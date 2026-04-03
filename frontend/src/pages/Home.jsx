import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import BrandCard from '../components/BrandCard';
import './Home.css';

const Home = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${API_URL}/v1/brands`);
        const data = await res.json();
        if (data.success) {
          setBrands(data.brands);
        }
      } catch (error) {
        console.error('Fetch brands failed:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="container animate-fade">
      <Hero />
      
      <section className="brands-section">
        <div className="section-header">
          <h2 className="text-gradient">أيقونات الفخامة</h2>
          <p className="section-subtitle">اكتشف الماركات التي تعيد تعريف التميز بهويتها الفريدة.</p>
        </div>
        
        {loading ? (
          <div className="loading-grid">
            {[1,2,3].map(i => <div key={i} className="skeleton-card glass-panel"></div>)}
          </div>
        ) : (
          <div className="brands-grid">
            {brands.length > 0 ? (
              brands.map(brand => (
                <div key={brand.id} className="grid-item">
                  <BrandCard brand={brand} />
                </div>
              ))
            ) : (
              <div className="empty-state glass-panel">
                <p>قريباً سيتم إطلاق مجموعة من أرقى الماركات العالمية.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
