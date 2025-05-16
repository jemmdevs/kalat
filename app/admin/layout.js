import Navbar from '../components/Navbar';
import AdminSidebar from './components/AdminSidebar';
import './admin.css';

export default function AdminLayout({ children }) {
  return (
    <>
      <Navbar />
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
} 