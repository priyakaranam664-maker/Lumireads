import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiGrid, FiBook, FiLayers, FiUsers, FiShoppingBag, FiTag, FiUserCheck } from 'react-icons/fi';

const sidebarLinks = [
    { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
    { to: '/admin/books', icon: FiBook, label: 'Books' },
    { to: '/admin/categories', icon: FiLayers, label: 'Categories' },
    { to: '/admin/authors', icon: FiUserCheck, label: 'Authors' },
    { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { to: '/admin/users', icon: FiUsers, label: 'Users' },
    { to: '/admin/coupons', icon: FiTag, label: 'Coupons' },
];

const AdminLayout = () => (
    <div>
        <Navbar />
        <div className="d-flex">
            <aside className="admin-sidebar d-none d-lg-block">
                <div style={{ padding: '0 1.5rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                    <h6 style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Panel</h6>
                </div>
                {sidebarLinks.map(({ to, icon: Icon, label, end }) => (
                    <NavLink key={to} to={to} end={end} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                        <Icon size={18} /> {label}
                    </NavLink>
                ))}
            </aside>
            <div className="admin-content flex-grow-1">
                <Outlet />
            </div>
        </div>
    </div>
);

export default AdminLayout;
