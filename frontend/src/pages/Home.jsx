import Hero from '../components/Hero';
import BrandCard from '../components/BrandCard';
import './Home.css';

// Mock Data
const MOCK_BRANDS = [
  { id: 1, name: 'Lumière', category: 'مجوهرات وساعات', promoted: true, color: '#f59e0b' },
  { id: 2, name: 'Aura', category: 'مستحضرات تجميل', promoted: true, color: '#ec4899' },
  { id: 3, name: 'Velvet', category: 'أزياء فاخرة', promoted: false, color: '#8b5cf6' },
  { id: 4, name: 'Onyx', category: 'اكسسوارات', promoted: false, color: '#0ea5e9' },
  { id: 5, name: 'Natura', category: 'عناية بالبشرة', promoted: false, color: '#10b981' },
  { id: 6, name: 'Elegance', category: 'عطور', promoted: false, color: '#f43f5e' }
];

const Home = () => {
  return (
    <div className="container">
      <Hero />
      
      <section className="brands-section">
        <div className="section-header">
          <h2>العلامات التجارية المتميزة</h2>
          <p className="section-subtitle">تصفح أحدث التشكيلات من أفضل الماركات العالمية والموثوقة.</p>
        </div>
        
        <div className="brands-grid">
          {MOCK_BRANDS.sort((a, b) => (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0)).map(brand => (
            <div key={brand.id} className="grid-item">
              <BrandCard brand={brand} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
