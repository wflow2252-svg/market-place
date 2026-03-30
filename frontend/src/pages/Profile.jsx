import { User } from 'lucide-react';
import './Admin.css'; // Reuse basic cards

const Profile = () => {
  const userName = localStorage.getItem('userName') || 'مستخدم عادي';
  const role = localStorage.getItem('userRole') || 'USER';

  return (
    <div className="admin-page container" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '60px' }}>
      <div className="admin-header glass-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <User size={64} color="var(--primary-color)" />
        <h2 className="title-serif text-gradient" style={{ marginTop: '16px' }}>أهلاً بك، {userName}</h2>
        <p>نوع الحساب: {role}</p>
        <div style={{ marginTop: '20px' }}>
          <p>أنت الآن في ملفك الشخصي. سيتم دمج سجل مشترياتك وطلباتك هنا في التحديثات القادمة للبرنامج.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
