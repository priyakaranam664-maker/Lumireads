import { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import {
    FiBook, FiUsers, FiShoppingBag, FiDollarSign,
    FiTrendingUp, FiActivity, FiSearch, FiArrowUp
} from 'react-icons/fi';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

/* ── Animated counter ── */
const AnimatedNumber = ({ target }) => {
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!target) return;
        const num = typeof target === 'string'
            ? parseFloat(target.replace(/[^0-9.]/g, ''))
            : target;
        if (isNaN(num)) { setVal(target); return; }
        let start = 0;
        const step = num / 40;
        const timer = setInterval(() => {
            start += step;
            if (start >= num) { setVal(target); clearInterval(timer); }
            else setVal(typeof target === 'string' ? target.replace(/[\d,]+/, Math.floor(start).toLocaleString()) : Math.floor(start));
        }, 25);
        return () => clearInterval(timer);
    }, [target]);
    return <>{val}</>;
};

/* ── Status pill ── */
const StatusPill = ({ status }) => {
    const map = {
        pending:   { bg: 'rgba(245,158,11,0.15)',   color: '#f59e0b' },
        confirmed: { bg: 'rgba(37,99,235,0.15)',    color: '#3b82f6' },
        shipped:   { bg: 'rgba(124,58,237,0.15)',   color: '#8b5cf6' },
        delivered: { bg: 'rgba(16,185,129,0.15)',   color: '#10b981' },
        cancelled: { bg: 'rgba(239,68,68,0.15)',    color: '#ef4444' },
    };
    const style = map[status] || { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8' };
    return (
        <span className="admin-status-pill" style={{ background: style.bg, color: style.color }}>
            {status}
        </span>
    );
};

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [orderSearch, setOrderSearch] = useState('');

    useEffect(() => {
        adminAPI.getDashboard()
            .then(({ data }) => setStats(data.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const statCards = [
        {
            icon: FiDollarSign, label: 'Total Revenue',
            value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`,
            color: '#10b981', bg: 'rgba(16,185,129,0.12)',
            accent: '#10b981', accentBg: 'rgba(16,185,129,0.06)',
            trend: '+12.5%'
        },
        {
            icon: FiShoppingBag, label: 'Total Orders',
            value: stats?.totalOrders || 0,
            color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',
            accent: '#3b82f6', accentBg: 'rgba(59,130,246,0.06)',
            trend: '+8.1%'
        },
        {
            icon: FiBook, label: 'Total Books',
            value: stats?.totalBooks || 0,
            color: '#f97316', bg: 'rgba(249,115,22,0.12)',
            accent: '#f97316', accentBg: 'rgba(249,115,22,0.06)',
            trend: '+3.4%'
        },
        {
            icon: FiUsers, label: 'Total Users',
            value: stats?.totalUsers || 0,
            color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',
            accent: '#8b5cf6', accentBg: 'rgba(139,92,246,0.06)',
            trend: '+19.2%'
        },
    ];

    const revenueData = stats?.revenueByMonth || [
        { month: 'Jan', revenue: 12000 }, { month: 'Feb', revenue: 19000 },
        { month: 'Mar', revenue: 15000 }, { month: 'Apr', revenue: 22000 },
        { month: 'May', revenue: 28000 }, { month: 'Jun', revenue: 35000 },
    ];

    const orderStatusData = [
        { name: 'Pending',   value: stats?.ordersByStatus?.pending   || 5,  color: '#f59e0b' },
        { name: 'Confirmed', value: stats?.ordersByStatus?.confirmed || 8,  color: '#3b82f6' },
        { name: 'Shipped',   value: stats?.ordersByStatus?.shipped   || 3,  color: '#8b5cf6' },
        { name: 'Delivered', value: stats?.ordersByStatus?.delivered || 20, color: '#10b981' },
        { name: 'Cancelled', value: stats?.ordersByStatus?.cancelled || 2,  color: '#ef4444' },
    ];

    const filteredOrders = (stats?.recentOrders || []).filter(order =>
        !orderSearch ||
        order.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        order.user?.fullName?.toLowerCase().includes(orderSearch.toLowerCase())
    );

    return (
        <>
            <Helmet><title>Admin Dashboard — BookStore</title></Helmet>

            {/* Page header */}
            <div className="admin-page-header">
                <div>
                    <h4>Dashboard</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                        Welcome back — here's what's happening today
                    </p>
                </div>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.45rem 1rem',
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem', fontWeight: 600, color: '#818cf8'
                }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} />
                    Live
                </div>
            </div>

            {/* Stat Cards */}
            <Row className="g-3 mb-4">
                {statCards.map(({ icon: Icon, label, value, color, bg, accent, accentBg, trend }) => (
                    <Col sm={6} xl={3} key={label}>
                        <div
                            className="stat-card"
                            style={{ '--stat-accent': accent, '--stat-accent-bg': accentBg }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div className="stat-icon" style={{ background: bg, color }}>
                                    <Icon size={22} />
                                </div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                                    fontSize: '0.72rem', fontWeight: 700,
                                    color: '#10b981',
                                    background: 'rgba(16,185,129,0.1)',
                                    padding: '0.18rem 0.5rem',
                                    borderRadius: 'var(--radius-full)'
                                }}>
                                    <FiArrowUp size={10} />{trend}
                                </div>
                            </div>
                            <div className="stat-value"><AnimatedNumber target={value} /></div>
                            <div className="stat-label">{label}</div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* Charts Row */}
            <Row className="g-3 mb-4">
                {/* Revenue Area Chart */}
                <Col lg={8}>
                    <div className="admin-chart-card">
                        <div className="admin-chart-card-title">
                            <FiTrendingUp style={{ color: '#6366f1' }} />
                            Revenue Overview
                            <span className="admin-chart-badge">
                                <FiArrowUp size={10} /> +23.1% this month
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 8, fontSize: '0.85rem'
                                    }}
                                    formatter={(v) => [`₹${v.toLocaleString()}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone" dataKey="revenue"
                                    stroke="#6366f1" fillOpacity={1}
                                    fill="url(#colorRev)" strokeWidth={2.5}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Col>

                {/* Order Status Pie */}
                <Col lg={4}>
                    <div className="admin-chart-card">
                        <div className="admin-chart-card-title">
                            <FiActivity style={{ color: '#8b5cf6' }} />
                            Order Status
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie
                                    data={orderStatusData}
                                    cx="50%" cy="50%"
                                    innerRadius={48} outerRadius={72}
                                    paddingAngle={4} dataKey="value"
                                >
                                    {orderStatusData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 8, fontSize: '0.85rem'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ marginTop: '0.5rem' }}>
                            {orderStatusData.map((d) => (
                                <div key={d.name} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    alignItems: 'center', marginBottom: '0.45rem',
                                    fontSize: '0.82rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{
                                            width: 9, height: 9, borderRadius: '50%',
                                            background: d.color, display: 'inline-block', flexShrink: 0
                                        }} />
                                        <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                                    </div>
                                    <span style={{
                                        fontWeight: 700, color: 'var(--text-primary)',
                                        background: 'var(--bg-secondary)',
                                        padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.78rem'
                                    }}>{d.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Recent Orders Table */}
            {(stats?.recentOrders?.length > 0 || true) && (
                <div className="admin-chart-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
                        <div className="admin-chart-card-title" style={{ marginBottom: 0 }}>
                            <FiShoppingBag style={{ color: '#f97316' }} />
                            Recent Orders
                        </div>
                        {/* Search bar */}
                        <div className="admin-table-search" id="orders-search-bar">
                            <FiSearch size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            <input
                                type="text"
                                placeholder="Search by order or customer…"
                                value={orderSearch}
                                onChange={e => setOrderSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {stats?.recentOrders?.length > 0 ? (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', fontSize: '0.875rem', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        {['Order', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                                            <th key={h} style={{
                                                padding: '0.6rem 0.75rem',
                                                color: 'var(--text-muted)',
                                                fontWeight: 700,
                                                fontSize: '0.72rem',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.06em',
                                                borderBottom: '2px solid var(--border-color)',
                                                textAlign: 'left',
                                                whiteSpace: 'nowrap'
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{
                                                padding: '2rem', textAlign: 'center',
                                                color: 'var(--text-muted)', fontSize: '0.85rem'
                                            }}>
                                                No orders match your search.
                                            </td>
                                        </tr>
                                    ) : filteredOrders.map((order, idx) => (
                                        <tr
                                            key={order._id}
                                            style={{
                                                borderBottom: '1px solid var(--border-light)',
                                                background: idx % 2 === 1 ? 'var(--bg-secondary)' : 'transparent',
                                                transition: 'background 0.15s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 1 ? 'var(--bg-secondary)' : 'transparent'}
                                        >
                                            <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>
                                                #{order.orderNumber}
                                            </td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {order.user?.fullName || '—'}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                                ₹{order.finalAmount?.toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <StatusPill status={order.orderStatus} />
                                            </td>
                                            <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                            <FiShoppingBag size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                            <p style={{ margin: 0 }}>No orders yet</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default AdminDashboard;
