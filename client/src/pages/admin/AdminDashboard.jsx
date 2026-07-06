import { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiBook, FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminAPI.getDashboard().then(({ data }) => setStats(data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const statCards = [
        { icon: FiDollarSign, label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
        { icon: FiShoppingBag, label: 'Total Orders', value: stats?.totalOrders || 0, color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)' },
        { icon: FiBook, label: 'Total Books', value: stats?.totalBooks || 0, color: '#F97316', bg: 'rgba(249, 115, 22, 0.1)' },
        { icon: FiUsers, label: 'Total Users', value: stats?.totalUsers || 0, color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.1)' },
    ];

    const revenueData = stats?.revenueByMonth || [
        { month: 'Jan', revenue: 12000 }, { month: 'Feb', revenue: 19000 }, { month: 'Mar', revenue: 15000 },
        { month: 'Apr', revenue: 22000 }, { month: 'May', revenue: 28000 }, { month: 'Jun', revenue: 35000 },
    ];

    const orderStatusData = [
        { name: 'Pending', value: stats?.ordersByStatus?.pending || 5, color: '#F59E0B' },
        { name: 'Confirmed', value: stats?.ordersByStatus?.confirmed || 8, color: '#2563EB' },
        { name: 'Shipped', value: stats?.ordersByStatus?.shipped || 3, color: '#7C3AED' },
        { name: 'Delivered', value: stats?.ordersByStatus?.delivered || 20, color: '#10B981' },
        { name: 'Cancelled', value: stats?.ordersByStatus?.cancelled || 2, color: '#EF4444' },
    ];

    return (
        <>
            <Helmet><title>Admin Dashboard - BookStore</title></Helmet>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Dashboard</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>Welcome to the admin panel</p>
                </div>
            </div>

            <Row className="g-3 mb-4">
                {statCards.map(({ icon: Icon, label, value, color, bg }) => (
                    <Col sm={6} xl={3} key={label}>
                        <div className="stat-card">
                            <div className="d-flex align-items-center gap-3">
                                <div className="stat-icon" style={{ background: bg, color }}><Icon size={22} /></div>
                                <div>
                                    <div className="stat-value">{value}</div>
                                    <div className="stat-label">{label}</div>
                                </div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            <Row className="g-3 mb-4">
                <Col lg={8}>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                        <h6 style={{ fontWeight: 800, marginBottom: '1rem' }}><FiTrendingUp style={{ color: 'var(--primary)' }} /> Revenue Overview</h6>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.85rem' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#2563EB" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Col>
                <Col lg={4}>
                    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', height: '100%' }}>
                        <h6 style={{ fontWeight: 800, marginBottom: '1rem' }}><FiActivity style={{ color: 'var(--primary)' }} /> Order Status</h6>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                                    {orderStatusData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: '0.85rem' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-2">
                            {orderStatusData.map((d) => (
                                <div key={d.name} className="d-flex justify-content-between align-items-center mb-1" style={{ fontSize: '0.8rem' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />{d.name}
                                    </div>
                                    <strong>{d.value}</strong>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Recent Orders */}
            {stats?.recentOrders?.length > 0 && (
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <h6 style={{ fontWeight: 800, marginBottom: '1rem' }}>Recent Orders</h6>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Order</th>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Customer</th>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Amount</th>
                                    <th style={{ padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order) => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '0.5rem', fontWeight: 600 }}>#{order.orderNumber}</td>
                                        <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{order.user?.fullName}</td>
                                        <td style={{ padding: '0.5rem', fontWeight: 700 }}>₹{order.finalAmount}</td>
                                        <td style={{ padding: '0.5rem' }}>
                                            <span className="tag" style={{ background: order.orderStatus === 'delivered' ? 'var(--success)' : 'var(--primary)', color: 'white', textTransform: 'capitalize' }}>{order.orderStatus}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminDashboard;
