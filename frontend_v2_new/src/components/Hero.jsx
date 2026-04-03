import { ArrowRight, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-warm animate-fade">
      {/* Background Blobs */}
      <div className="hero-blob blob-1"></div>
      <div className="hero-blob blob-2"></div>
      
      <div className="hero-content">
        <div className="badge-promo-top glass-panel animate-float-slow">
          <ShieldCheck size={16} color="var(--accent-orange)" /> MarketPlace - وجهتك الودودة للماركات العالمية والمحلية في مصر
        </div>
        <h1 className="text-gradient-warm animate-fade-in stagger-1">
          أقوى البراندات العالمية <br/> <span className="text-accent-orange">والمحلية في مصر</span>
        </h1>
        <p className="hero-subtitle animate-fade-in stagger-2">
          استمتع بتجربة تسوق آمنة ومريحة. بنقدملك أرقى تشكيلات الماركات العالمية والمحلية بضمان الجودة، وسرعة في التوصيل لكل محافظات مصر.
        </p>
        <div className="hero-actions animate-fade-in stagger-3">
          <button className="btn-luxe shine-button">
            اشتري دلوقتي <ArrowRight size={20} />
          </button>
          <button className="btn-outline-warm glass-panel">
            اكتشف العروض
          </button>
        </div>
        <div className="hero-stats animate-fade-in stagger-4">
          <div className="stat glass-panel">
            <span className="stat-num text-accent-orange">+500</span>
            <span className="stat-label">براند في مصر</span>
          </div>
          <div className="stat glass-panel">
            <span className="stat-num text-accent-orange">+10k</span>
            <span className="stat-label">قطعة مختارة</span>
          </div>
          <div className="stat glass-panel">
            <span className="stat-num text-accent-orange">24/7</span>
            <span className="stat-label">دعم دائم</span>
          </div>
        </div>
      </div>
      
      <div className="hero-image-wrapper animate-fade-in stagger-2">
        <div className="hero-floating-card glass-panel animate-luxe">
          <div className="luxury-icon-box">
            <Zap size={40} color="var(--accent-orange)" />
          </div>
          <h3>تسوق بذكاء رقيق</h3>
          <p>تخصيص الهوية الذكي بلمسات دافئة</p>
        </div>
        <div className="hero-main-card glass-panel">
          <ShoppingBag size={120} className="hero-main-icon" />
          <div className="hero-decoration"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
