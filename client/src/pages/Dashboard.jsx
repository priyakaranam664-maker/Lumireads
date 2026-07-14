import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiHeart, FiShoppingBag, FiArrowRight, FiClock, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const statusColors = {
    delivered:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
    pending:    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
    confirmed:  { bg: 'rgba(37,99,235,0.12)',   color: '#3b82f6' },
    shipped:    { bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6' },
    cancelled:  { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
};

const Dashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderAPI.getAll({ limit: 5, sort: 'newest' })
            .then(({ data }) => setOrders(data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const stats = [
        { icon: FiPackage,  label: 'Total Orders', value: orders.length, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', link: '/orders' },
        { icon: FiHeart,    label: 'Wishlist',      value: user?.wishlist?.length || 0, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', link: '/wishlist' },
        { icon: FiShoppingBag, label: 'In Cart',   value: 0, color: '#f97316', bg: 'rgba(249,115,22,0.12)', link: '/cart' },
    ];

    const initials = user?.fullName
        ? user.fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <>
            <Helmet><title>My Dashboard — BookStore</title></Helmet>

            {/* Hero banner */}
            <div style={{
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 60%, #24243e 100%)',
                padding: '3rem 1.5rem',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', top: -60, right: -60, width: 280, height: 280,
                    background: 'radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)',
                    borderRadius: '50%', pointerEvents: 'none'
                }} />
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1.3rem', color: '#fff', flexShrink: 0,
                        boxShadow: '0 6px 20px rgba(99,102,241,0.45)'
                    }}>{initials}</div>
                    <div>
                        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>
                            My Dashboard
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                            Welcome back, <strong style={{ color: 'rgba(255,255,255,0.9)' }}>{user?.fullName}</strong> 👋
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {stats.map(({ icon: Icon, label, value, color, bg, link }) => (
                        <Link to={link} key={label} style={{ textDecoration: 'none' }}>
                            <div className="stat-card" style={{ '--stat-accent': color, '--stat-accent-bg': bg }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div className="stat-icon" style={{ background: bg, color }}>
                                        <Icon size={22} />
                                    </div>
                                    <div>
                                        <div className="stat-value">{value}</div>
                                        <div className="stat-label">{label}</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Recent Orders */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                }}>
                    {/* Table header */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '1.25rem 1.5rem',
                        borderBottom: '1px solid var(--border-color)',
                        background: 'var(--bg-secondary)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <FiClock style={{ color: 'var(--primary)' }} size={16} />
                            <h5 style={{ fontWeight: 800, margin: 0, fontSize: '0.95rem' }}>Recent Orders</h5>
                        </div>
                        <Link to="/orders" style={{
                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                            fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)',
                            textDecoration: 'none'
                        }}>
                            View All <FiArrowRight size={13} />
                        </Link>
                    </div>

                    {orders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
                            <FiShoppingBag size={40} style={{ opacity: 0.25, marginBottom: '0.75rem' }} />
                            <p style={{ margin: 0, fontWeight: 600 }}>No orders yet</p>
                            <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>Start exploring our book collection!</p>
                            <Link to="/books" style={{
                                display: 'inline-block', marginTop: '1rem',
                                padding: '0.55rem 1.25rem',
                                background: 'var(--primary)', color: '#fff',
                                borderRadius: 'var(--radius-md)', fontSize: '0.85rem',
                                fontWeight: 700, textDecoration: 'none'
                            }}>Browse Books</Link>
                        </div>
                    ) : (
                        orders.map((order, idx) => {
                            const sc = statusColors[order.orderStatus] || { bg: 'var(--bg-secondary)', color: 'var(--text-muted)' };
                            return (
                                <Link
                                    to={`/orders/${order._id}`}
                                    key={order._id}
                                    style={{ textDecoration: 'none', display: 'block' }}
                                >
                                    <div style={{
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        padding: '1rem 1.5rem',
                                        borderBottom: idx < orders.length - 1 ? '1px solid var(--border-light)' : 'none',
                                        background: idx % 2 === 1 ? 'var(--bg-secondary)' : 'transparent',
                                        transition: 'background 0.15s'
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
                                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1 ? 'var(--bg-secondary)' : 'transparent'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
                                                #{order.orderNumber}
                                            </div>
                                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                &nbsp;·&nbsp;{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                                                ₹{order.finalAmount?.toLocaleString()}
                                            </div>
                                            <span style={{
                                                padding: '0.22rem 0.65rem',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.72rem', fontWeight: 700,
                                                textTransform: 'capitalize',
                                                background: sc.bg, color: sc.color
                                            }}>
                                                {order.orderStatus}
                                            </span>
                                            <FiArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default Dashboard;
