import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMapPin, FiCreditCard, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Checkout = () => {
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const { register, handleSubmit, formState: { errors } } = useForm({
        defaultValues: {
            fullName: user?.fullName || '',
            phone: user?.phone || '',
            address: user?.addresses?.[0]?.street || '',
            city: user?.addresses?.[0]?.city || '',
            state: user?.addresses?.[0]?.state || '',
            pincode: user?.addresses?.[0]?.pincode || '',
        },
    });

    if (!cart || !cart.items?.length) {
        return (
            <Container className="py-5">
                <div className="empty-state">
                    <h3>No items to checkout</h3>
                    <p>Your cart is empty</p>
                </div>
            </Container>
        );
    }

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            const orderData = {
                shippingAddress: {
                    fullName: formData.fullName,
                    phone: formData.phone,
                    street: formData.address,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    country: 'India',
                },
                paymentMethod,
                notes: formData.notes,
            };
            const { data } = await orderAPI.create(orderData);
            await clearCart();
            toast.success('Order placed successfully!');
            navigate(`/orders/${data.data._id}`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Order failed');
        } finally { setLoading(false); }
    };

    const shipping = cart.shippingCharges !== undefined ? cart.shippingCharges : ((cart.subtotal || 0) >= 499 ? 0 : 49);
    const subtotal = cart.subtotal || 0;
    const couponDiscount = cart.couponDiscount || 0;
    const total = cart.grandTotal !== undefined ? cart.grandTotal : (subtotal + shipping - couponDiscount);

    return (
        <>
            <Helmet><title>Checkout - BookStore</title></Helmet>
            <div className="page-header">
                <Container><h1>Checkout</h1></Container>
            </div>

            <Container className="py-4">
                <div className="mb-3">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: 0, fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                        <FiArrowLeft size={16} /> Back to Cart
                    </button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Row className="g-4">
                        <Col lg={8}>
                            {/* Shipping */}
                            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                                <h5 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMapPin style={{ color: 'var(--primary)' }} /> Shipping Address</h5>
                                <Row className="g-3">
                                    <Col md={6}>
                                        <label className="form-label">Full Name</label>
                                        <input className="form-input" {...register('fullName', { required: 'Required' })} />
                                        {errors.fullName && <small style={{ color: 'var(--danger)' }}>{errors.fullName.message}</small>}
                                    </Col>
                                    <Col md={6}>
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" {...register('phone', { required: 'Required' })} />
                                        {errors.phone && <small style={{ color: 'var(--danger)' }}>{errors.phone.message}</small>}
                                    </Col>
                                    <Col xs={12}>
                                        <label className="form-label">Address</label>
                                        <input className="form-input" {...register('address', { required: 'Required' })} />
                                        {errors.address && <small style={{ color: 'var(--danger)' }}>{errors.address.message}</small>}
                                    </Col>
                                    <Col md={4}>
                                        <label className="form-label">City</label>
                                        <input className="form-input" {...register('city', { required: 'Required' })} />
                                        {errors.city && <small style={{ color: 'var(--danger)' }}>{errors.city.message}</small>}
                                    </Col>
                                    <Col md={4}>
                                        <label className="form-label">State</label>
                                        <input className="form-input" {...register('state', { required: 'Required' })} />
                                        {errors.state && <small style={{ color: 'var(--danger)' }}>{errors.state.message}</small>}
                                    </Col>
                                    <Col md={4}>
                                        <label className="form-label">Pincode</label>
                                        <input className="form-input" {...register('pincode', { required: 'Required' })} />
                                        {errors.pincode && <small style={{ color: 'var(--danger)' }}>{errors.pincode.message}</small>}
                                    </Col>
                                    <Col xs={12}>
                                        <label className="form-label">Order Notes (Optional)</label>
                                        <textarea className="form-input" rows={2} {...register('notes')} placeholder="Any special instructions..." />
                                    </Col>
                                </Row>
                            </div>

                            {/* Payment Method */}
                            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                                <h5 style={{ fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCreditCard style={{ color: 'var(--primary)' }} /> Payment Method</h5>
                                {[
                                    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive the order', icon: '💵' },
                                    { value: 'stripe', label: 'Credit/Debit Card', desc: 'Secure payment via Stripe', icon: '💳' },
                                    { value: 'razorpay', label: 'Razorpay (UPI/Net Banking)', desc: 'UPI, Net Banking, Wallets', icon: '🏦' },
                                ].map((method) => (
                                    <label key={method.value} style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)',
                                        border: `2px solid ${paymentMethod === method.value ? 'var(--primary)' : 'var(--border-color)'}`,
                                        background: paymentMethod === method.value ? 'var(--primary-50)' : 'transparent', marginBottom: '0.5rem', cursor: 'pointer'
                                    }}
                                        onClick={() => setPaymentMethod(method.value)}>
                                        <input type="radio" name="payment" value={method.value} checked={paymentMethod === method.value} onChange={() => setPaymentMethod(method.value)} />
                                        <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{method.label}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{method.desc}</div>
                                        </div>
                                        {paymentMethod === method.value && <FiCheck style={{ marginLeft: 'auto', color: 'var(--primary)' }} size={20} />}
                                    </label>
                                ))}
                            </div>
                        </Col>

                        <Col lg={4}>
                            <div className="order-summary">
                                <h5 style={{ fontWeight: 800, marginBottom: '1rem' }}>Order Summary</h5>
                                {cart.items.filter((item) => item.book).map((item) => (
                                    <div key={item._id} className="d-flex gap-2 mb-2" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
                                        <img src={item.book?.coverImage} alt="" style={{ width: 40, height: 55, borderRadius: 4, objectFit: 'cover' }} />
                                        <div className="flex-grow-1">
                                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.book?.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>₹{(item.book?.finalPrice || item.price) * item.quantity}</div>
                                    </div>
                                ))}

                                <div className="mt-3">
                                    <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span>Subtotal</span><span>₹{subtotal}</span>
                                    </div>
                                    {couponDiscount > 0 && (
                                        <div className="d-flex justify-content-between mb-1" style={{ fontSize: '0.9rem', color: 'var(--success)' }}>
                                            <span>Discount</span><span>-₹{couponDiscount}</span>
                                        </div>
                                    )}
                                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span>Shipping</span><span style={{ color: shipping === 0 ? 'var(--success)' : undefined, fontWeight: 600 }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                                    </div>
                                    <hr style={{ borderColor: 'var(--border-color)' }} />
                                    <div className="d-flex justify-content-between" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                        <span>Total</span><span>₹{total}</span>
                                    </div>
                                </div>

                                <button type="submit" className="btn-primary-custom w-100 justify-content-center mt-3" disabled={loading}
                                    style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
                                    {loading ? 'Placing Order...' : `Place Order - ₹${total}`}
                                </button>
                            </div>
                        </Col>
                    </Row>
                </form>
            </Container>
        </>
    );
};

export default Checkout;
