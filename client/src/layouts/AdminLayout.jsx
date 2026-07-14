import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
    FiGrid, FiBook, FiLayers, FiUsers, FiShoppingBag,
    FiTag, FiUserCheck, FiLogOut, FiSettings
} from 'react-icons/fi';

const sidebarLinks = [
    { section: 'Overview' },
    { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
    { section: 'Catalogue' },
    { to: '/admin/books', icon: FiBook, label: 'Books' },
    { to: '/admin/categories', icon: FiLayers, label: 'Categories' },
    { to: '/admin/authors', icon: FiUserCheck, label: 'Authors' },
    { section: 'Operations' },
    { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    { to: '/admin/users-manage', icon: FiUsers, label: 'Users' },
    { to: '/admin/coupons', icon: FiTag, label: 'Coupons' },
];

const AdminLayout = () => {
    const { user, logout } = useAuth();

    const initials = user?.fullName
        ? user.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : 'AD';

    return (
        <div>
            <Navbar />
            <div className="d-flex">
                {/* ── Premium Dark Sidebar ── */}
                <aside className="admin-sidebar d-none d-lg-block">
                    {/* Profile Card */}
                    <div className="admin-sidebar-profile">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div className="admin-sidebar-avatar">{initials}</div>
                            <div style={{ overflow: 'hidden' }}>
                                <div className="admin-sidebar-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.fullName || 'Administrator'}
                                </div>
                                <div className="admin-sidebar-role">Admin</div>
                            </div>
                        </div>
                        <div style={{
                            marginTop: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            padding: '0.4rem 0.7rem',
                            background: 'rgba(16,185,129,0.12)',
                            borderRadius: '6px',
                            width: 'fit-content'
                        }}>
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%',
                                background: '#10b981',
                                display: 'inline-block',
                                boxShadow: '0 0 6px #10b981'
                            }} />
                            <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>System Online</span>
                        </div>
                    </div>

                    {/* Nav Links */}
                    {sidebarLinks.map((item, i) => {
                        if (item.section) {
                            return (
                                <div key={`section-${i}`} className="admin-sidebar-section">
                                    {item.section}
                                </div>
                            );
                        }
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <span className="sidebar-link-icon">
                                    <item.icon size={16} />
                                </span>
                                {item.label}
                            </NavLink>
                        );
                    })}

                    {/* Bottom actions */}
                    <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '1rem 0.75rem',
                        borderTop: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem'
                    }}>
                        <button
                            onClick={logout}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.65rem 1.4rem',
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: 'rgba(239,68,68,0.75)', fontSize: '0.875rem',
                                fontWeight: 500, width: '100%', borderRadius: 'var(--radius-md)',
                                transition: 'all 0.2s',
                                fontFamily: 'var(--font-sans)'
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                e.currentTarget.style.color = '#f87171';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'none';
                                e.currentTarget.style.color = 'rgba(239,68,68,0.75)';
                            }}
                        >
                            <span style={{
                                width: 34, height: 34, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', borderRadius: 'var(--radius-sm)',
                                background: 'rgba(239,68,68,0.1)'
                            }}>
                                <FiLogOut size={16} />
                            </span>
                            Sign Out
                        </button>
                    </div>
                </aside>

                {/* ── Main Content ── */}
                <div className="admin-content flex-grow-1">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
