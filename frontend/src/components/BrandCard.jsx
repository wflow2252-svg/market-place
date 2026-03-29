import { Link } from 'react-router-dom';
import { BadgeCheck, ArrowLeft } from 'lucide-react';
import './BrandCard.css';

const BrandCard = ({ brand }) => {
  return (
    <Link to={`/brand/${brand.id}`} className={`brand-card card ${brand.promoted ? 'brand-promoted' : ''}`}>
      {brand.promoted && (
        <span className="badge-promoted brand-badge">
          <BadgeCheck size={14}/> ترويج
        </span>
      )}
      
      <div className="brand-logo-container" style={{ backgroundColor: brand.color + '10' }}>
        <div className="logo-placeholder" style={{ color: brand.color, border: `2px solid ${brand.color}30` }}>
          {brand.name.charAt(0)}
        </div>
      </div>
      
      <div className="brand-info">
        <h3>{brand.name}</h3>
        <p className="brand-category">{brand.category}</p>
        <div className="brand-action">
          <span>تسوق الآن</span>
          <ArrowLeft size={16} />
        </div>
      </div>
    </Link>
  );
};

export default BrandCard;
