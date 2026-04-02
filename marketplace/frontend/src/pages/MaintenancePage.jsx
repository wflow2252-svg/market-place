import { Wrench } from 'lucide-react';
import './MaintenancePage.css';

const MaintenancePage = ({ message }) => {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="icon-wrapper">
          <Wrench size={60} strokeWidth={1.5} />
        </div>
        <h1 className="maintenance-title">عذراً، الموقع تحت الصيانة</h1>
        <p className="maintenance-desc">
          {message || 'نحن نضع اللمسات الأخيرة على بعض التحديثات الرائعة. سنعود للعمل قريباً جداً!'}
        </p>
        <div className="maintenance-footer">
          <p>LuxeBrands Team</p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
