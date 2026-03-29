import { Settings, Plus, Edit, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  return (
    <div className="admin-page container">
      <div className="admin-header glass-panel">
        <div className="admin-title">
          <ShieldCheck size={32} color="var(--accent-color)" />
          <h2 className="title-serif text-gradient">لوحة تحكم الإدارة</h2>
        </div>
        <p>إدارة الماركات، المنتجات، ونظام الترويج</p>
      </div>

      <div className="admin-grid">
        <aside className="admin-sidebar glass-panel">
          <ul className="admin-menu">
            <li className="active"><Settings size={18}/> إعدادات المنصة</li>
            <li><Plus size={18}/> إضافة ماركة جديدة</li>
            <li><Sparkles size={18}/> إدارة الترويج (Promotions)</li>
          </ul>
        </aside>

        <main className="admin-content glass-panel">
          <div className="content-header">
            <h3>الماركات المسجلة</h3>
            <button className="btn btn-primary"><Plus size={16}/> إضافة ماركة</button>
          </div>
          
          <table className="admin-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>القسم</th>
                <th>حالة الترويج</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lumière</td>
                <td>مجوهرات وساعات</td>
                <td><span className="badge-promoted">مميز</span></td>
                <td className="actions-cell">
                  <button className="btn-icon"><Edit size={16}/></button>
                  <button className="btn-icon delete"><Trash2 size={16}/></button>
                </td>
              </tr>
              <tr>
                <td>Velvet</td>
                <td>أزياء فاخرة</td>
                <td>-</td>
                <td className="actions-cell">
                  <button className="btn-icon"><Edit size={16}/></button>
                  <button className="btn-icon delete"><Trash2 size={16}/></button>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
};

export default Admin;
