import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiTruck, FiPackage, FiX, FiArrowLeft } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        orderAPI.get(id).then(({ data }) => setOrder(data.data)).catch(() => toast.error('Order not found')).finally(() => setLoading(false));
    }, [id]);

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        try {
            const { data } = await orderAPI.cancel(id, { reason: 'Cancelled by user' });
            setOrder(data.data);
            toast.success('Order cancelled');
        } catch (err) { toast.error(err.response?.data?.message || 'Cannot cancel'); }
    };

    if (loading) return <LoadingSpinner />;
    if (!order) return <div className="empty-state"><h3>Order not found</h3></div>;

    const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
    const currentStep = steps.indexOf(order.orderStatus);
    const isCancelled = order.orderStatus === 'cancelled';

    return (
        <>
            <Helmet><title>{`Order #${order.orderNumber} - BookStore`}</title></Helmet>
            <div className="page-header">
                <Container>
                    <div className="breadcrumb-custom mb-2"><Link to="/">Home</Link><span>/</span><Link to="/orders">Orders</Link><span>/</span><span style={{ color: 'white' }}>#{order.orderNumber}</span></div>
                    <h1>Order #{order.orderNumber}</h1>
                </Container>
            </div>

            <Container className="py-4">
                <div className="mb-3">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: 0, fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                        <FiArrowLeft size={16} /> Back to Orders
                    </button>
                </div>
                {/* Progress */}
                {!isCancelled && (
                    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="d-flex justify-content-between" style={{ maxWidth: 600, margin: '0 auto' }}>
                            {steps.map((step, i) => {
                                const icons = [FiPackage, FiCheck, FiTruck, FiCheck];
                                const Icon = icons[i];
                                const isActive = i <= currentStep;
                                return (
                                    <div key={step} className="text-center" style={{ flex: 1 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem',
                                            background: isActive ? 'var(--primary)' : 'var(--bg-tertiary)', color: isActive ? 'white' : 'var(--text-muted)'
                                        }}>
                                            <Icon size={18} />
                                        </div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isActive ? 'var(--primary)' : 'var(--text-muted)', textTransform: 'capitalize' }}>{step}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                {isCancelled && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--danger)' }}>
                        <FiX style={{ color: 'var(--danger)' }} size={24} /> <strong style={{ color: 'var(--danger)' }}>Order Cancelled</strong>
                        {order.cancelReason && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 0 }}>Reason: {order.cancelReason}</p>}
                    </div>
                )}

                <Row className="g-4">
                    <Col lg={8}>
                        {/* Items */}
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>Order Items</h5>
                            {order.items?.map((item, i) => (
                                <div key={i} className="d-flex gap-3 align-items-center" style={{ padding: '0.75rem 0', borderBottom: i < order.items.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                                    <img src={item.book?.coverImage} alt="" style={{ width: 50, height: 70, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                                    <div className="flex-grow-1">
                                        <h6 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.1rem' }}>{item.book?.title || item.title}</h6>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 0 }}>Qty: {item.quantity} × ₹{item.price}</p>
                                    </div>
                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>
                    </Col>

                    <Col lg={4}>
                        <div className="order-summary" style={{ position: 'static' }}>
                            <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>Summary</h5>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                                <p style={{ marginBottom: '0.3rem' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p style={{ marginBottom: '0.3rem' }}><strong>Payment:</strong> {order.paymentMethod?.toUpperCase()}</p>
                                <p style={{ marginBottom: '0.3rem' }}><strong>Payment Status:</strong> {order.paymentStatus}</p>
                            </div>
                            {order.shippingAddress && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <strong style={{ fontSize: '0.85rem' }}>Shipping To:</strong>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 0 }}>
                                        {order.shippingAddress.fullName}<br />
                                        {order.shippingAddress.street}<br />
                                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                    </p>
                                </div>
                            )}
                            <hr style={{ borderColor: 'var(--border-color)' }} />
                            <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.9rem' }}><span>Subtotal</span><span>₹{order.totalAmount}</span></div>
                            {order.discount > 0 && <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.9rem', color: 'var(--success)' }}><span>Discount</span><span>-₹{order.discount}</span></div>}
                            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem' }}><span>Shipping</span><span>{order.shippingCharge > 0 ? `₹${order.shippingCharge}` : 'FREE'}</span></div>
                            <div className="d-flex justify-content-between" style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}><span>Total</span><span>₹{order.finalAmount}</span></div>

                            {order.orderStatus === 'pending' && (
                                <button onClick={handleCancel} className="btn-secondary-custom w-100 mt-3" style={{ color: 'var(--danger)', borderColor: 'var(--danger)', justifyContent: 'center' }}>
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default OrderDetail;
