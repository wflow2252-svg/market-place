import { ArrowRight, ShoppingBag, TrendingUp } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-modern">
      <div className="hero-content">
        <div className="badge-promo-top">
          <TrendingUp size={16} /> المنصة الأولى للماركات في الشرق الأوسط
        </div>
        <h1>تجربة تسوق فريدة لأرقى <span className="text-primary">العلامات التجارية</span></h1>
        <p className="hero-subtitle">
          اكتشف أحدث المنتجات من أشهر الماركات العالمية والمحلية في مكان واحد. تسوق بأمان وبثقة مع خدمات التوصيل السريع وضمان الجودة.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary btn-lg">
            تصفح الماركات <ArrowRight size={20} />
          </button>
          <button className="btn btn-outline btn-lg">
            أفضل العروض
          </button>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">+500</span>
            <span className="stat-label">ماركة مسجلة</span>
          </div>
          <div className="stat">
            <span className="stat-num">+10k</span>
            <span className="stat-label">منتج أصلي</span>
          </div>
          <div className="stat">
            <span className="stat-num">24/7</span>
            <span className="stat-label">دعم فني</span>
          </div>
        </div>
      </div>
      
      <div className="hero-image-wrapper">
        <div className="hero-image-ph card">
          <ShoppingBag size={80} className="text-gray" opacity={0.2} />
          <h3>مساحة عرض المنتجات المروجة</h3>
        </div>
      </div>
    </section>
  );
};

export default Hero;
