import { Link } from 'react-router-dom';
import { BadgeCheck, ArrowLeft } from 'lucide-react';
import './BrandCard.css';

const BrandCard = ({ brand }) => {
  // AI Theme color extraction
  let primaryColor = brand.color || '#3b82f6';
  if (brand.brandTheme) {
    try {
      const theme = JSON.parse(brand.brandTheme);
      primaryColor = theme.primaryColor;
    } catch (e) {}
  }

  return (
    <Link to={`/brand/${brand.id}`} className="brand-card glass-panel animate-float">
      <div className="brand-logo-wrapper" style={{ backgroundColor: `${primaryColor}10` }}>
        {brand.brandLogo ? (
          <img src={brand.brandLogo} alt={brand.name} className="brand-card-logo" />
        ) : (
          <div className="logo-placeholder-premium" style={{ color: primaryColor, borderColor: `${primaryColor}30` }}>
            {brand.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="brand-card-info">
        <h3 className="text-gradient" style={{ fontSize: '1.4rem' }}>{brand.name}</h3>
        <p className="brand-category">{brand.brandDescription?.slice(0, 40) || 'ماركة فاخرة موثقة'}...</p>
        <div className="brand-action-link" style={{ color: primaryColor }}>
          <span>استكشاف المجموعة</span>
          <ArrowLeft size={16} />
        </div>
      </div>
    </Link>
  );
};

export default BrandCard;
