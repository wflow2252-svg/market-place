import { Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import './BrandCard.css';

const BrandCard = ({ brand }) => {
  const theme = brand.brandProfile?.theme
    ? (() => { try { return JSON.parse(brand.brandProfile.theme); } catch { return {}; } })()
    : {};
  const color    = theme.primary || brand.color || '#e67e22';
  const logo     = brand.brandProfile?.logo || null;
  const isPaused = brand.brandProfile?.isPaused || false;
  const count    = brand._count?.products ?? 0;

  return (
    <Link
      to={`/brand/${brand.id}`}
      className={`brand-card-figma ${brand.promoted ? 'brand-promoted' : ''} ${isPaused ? 'brand-paused' : ''}`}
    >
      {/* Promoted Badge */}
      {brand.promoted && (
        <span className="bc-promoted-badge">
          <BadgeCheck size={12}/> مميز
        </span>
      )}

      {/* Paused Overlay */}
      {isPaused && <div className="bc-paused-overlay"><span>متجر موقوف مؤقتاً</span></div>}

      {/* Top Row: Name + Label */}
      <div className="bc-top-row">
        <div className="bc-name-block">
          <span className="bc-name">{brand.name}</span>
          <span className="bc-title">{brand.category || brand.brandProfile?.description?.slice(0, 30) || 'علامة تجارية'}</span>
        </div>
        <span className="bc-eval" style={{ color }}>
          {count > 0 ? `${count} منتج` : 'جديد'}
        </span>
      </div>

      {/* Bottom: Logo */}
      <div className="bc-logo-wrap">
        {logo
          ? <img src={logo} alt={brand.name} className="bc-logo-img"/>
          : (
            <div className="bc-logo-ph" style={{ background: color }}>
              {brand.name.charAt(0).toUpperCase()}
            </div>
          )
        }
      </div>
    </Link>
  );
};

export default BrandCard;
