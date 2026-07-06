import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiHeart, FiUser, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { orderAPI, userAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderAPI.getAll({ limit: 5, sort: 'newest' }).then(({ data }) => setOrders(data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const stats = [
        { icon: FiPackage, label: 'Total Orders', value: orders.length, color: '#2563EB', link: '/orders' },
        { icon: FiHeart, label: 'Wishlist', value: user?.wishlist?.length || 0, color: '#EF4444', link: '/wishlist' },
        { icon: FiShoppingBag, label: 'In Cart', value: 0, color: '#F97316', link: '/cart' },
    ];

    return (
        <>
            <Helmet><title>Dashboard - BookStore</title></Helmet>
            <div className="page-header">
                <Container>
                    <h1>My Dashboard</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>Welcome back, {user?.fullName}!</p>
                </Container>
            </div>
            <Container className="py-4">
                <Row className="g-3 mb-4">
                    {stats.map(({ icon: Icon, label, value, color, link }) => (
                        <Col md={4} key={label}>
                            <Link to={link} style={{ textDecoration: 'none' }}>
                                <div className="stat-card">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="stat-icon" style={{ background: color }}><Icon size={22} /></div>
                                        <div>
                                            <div className="stat-value">{value}</div>
                                            <div className="stat-label">{label}</div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Col>
                    ))}
                </Row>

                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 style={{ fontWeight: 800, margin: 0 }}>Recent Orders</h5>
                        <Link to="/orders" style={{ fontSize: '0.85rem', fontWeight: 600 }}>View All</Link>
                    </div>
                    {orders.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No orders yet. Start shopping!</p> : (
                        orders.map((order) => (
                            <Link to={`/orders/${order._id}`} key={order._id} style={{ textDecoration: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid var(--border-light)', transition: 'var(--transition-fast)' }}>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>#{order.orderNumber}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()} · {order.items?.length} item(s)</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{order.finalAmount}</div>
                                        <span className="tag" style={{
                                            background: order.orderStatus === 'delivered' ? 'var(--success)' : order.orderStatus === 'cancelled' ? 'var(--danger)' : 'var(--primary)',
                                            color: 'white', fontSize: '0.7rem'
                                        }}>{order.orderStatus}</span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </Container>
        </>
    );
};

export default Dashboard;
