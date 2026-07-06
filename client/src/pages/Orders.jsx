import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiPackage, FiArrowLeft } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const params = { sort: 'newest' };
        if (statusFilter) params.orderStatus = statusFilter;
        orderAPI.getAll(params).then(({ data }) => setOrders(data.data)).catch(() => { }).finally(() => setLoading(false));
    }, [statusFilter]);

    if (loading) return <LoadingSpinner />;

    const statusColors = { pending: '#F59E0B', confirmed: '#2563EB', shipped: '#7C3AED', delivered: '#10B981', cancelled: '#EF4444' };

    return (
        <>
            <Helmet><title>My Orders - BookStore</title></Helmet>
            <div className="page-header">
                <Container><div className="breadcrumb-custom mb-2"><Link to="/">Home</Link><span>/</span><span style={{ color: 'white' }}>Orders</span></div><h1>My Orders</h1></Container>
            </div>
            <Container className="py-4">
                <div className="mb-3">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: 0, fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                        <FiArrowLeft size={16} /> Back
                    </button>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 style={{ fontWeight: 700, margin: 0 }}>{orders.length} Order(s)</h5>
                    <Form.Select size="sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: 'auto', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                        <option value="">All Orders</option>
                        {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>)}
                    </Form.Select>
                </div>

                {orders.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon"><FiPackage /></div><h3>No Orders Found</h3><Link to="/books" className="btn-primary-custom">Shop Now</Link></div>
                ) : orders.map((order) => (
                    <Link to={`/orders/${order._id}`} key={order._id} style={{ textDecoration: 'none' }}>
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', padding: '1rem', marginBottom: '0.75rem', transition: 'var(--transition-fast)' }} className="cart-item">
                            <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                                    <div>
                                        <h6 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Order #{order.orderNumber}</h6>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                        <div className="d-flex gap-2 flex-wrap">
                                            {order.items?.slice(0, 3).map((item, i) => (
                                                <img key={i} src={item.book?.coverImage} alt="" style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                                            ))}
                                            {order.items?.length > 3 && <span className="tag">+{order.items.length - 3} more</span>}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>₹{order.finalAmount}</div>
                                        <span style={{ display: 'inline-block', padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 700, background: statusColors[order.orderStatus] || 'var(--primary)', color: 'white', textTransform: 'capitalize' }}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </Container>
        </>
    );
};

export default Orders;
