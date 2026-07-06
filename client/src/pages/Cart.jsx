import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Cart = () => {
    const { cart, cartLoading, updateQuantity, removeFromCart, clearCart, applyCoupon, removeCoupon } = useCart();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState('');

    if (cartLoading) return <LoadingSpinner />;

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <>
                <Helmet><title>Cart - BookStore</title></Helmet>
                <Container className="py-5">
                    <div className="empty-state">
                        <div className="empty-state-icon">🛒</div>
                        <h3>Your Cart is Empty</h3>
                        <p>Looks like you haven't added any books yet</p>
                        <Link to="/books" className="btn-primary-custom">Start Shopping <FiShoppingBag /></Link>
                    </div>
                </Container>
            </>
        );
    }

    return (
        <>
            <Helmet><title>{`Cart (${cart.items.length}) - BookStore`}</title></Helmet>
            <div className="page-header">
                <Container>
                    <div className="breadcrumb-custom mb-2"><Link to="/">Home</Link><span>/</span><span style={{ color: 'white' }}>Shopping Cart</span></div>
                    <h1>Shopping Cart</h1>
                </Container>
            </div>

            <Container className="py-4">
                <div className="mb-3">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: 0, fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                        <FiArrowLeft size={16} /> Continue Shopping
                    </button>
                </div>
                <Row className="g-4">
                    <Col lg={8}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 style={{ fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{cart.items.length} Item(s)</h5>
                            <button onClick={clearCart} style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                <FiTrash2 size={14} /> Clear Cart
                            </button>
                        </div>

                        {cart.items.filter((item) => item.book).map((item) => (
                            <div className="cart-item" key={item._id}>
                                <Link to={`/books/${item.book?.slug || item.book?._id}`}>
                                    <img src={item.book?.coverImage} alt={item.book?.title} />
                                </Link>
                                <div className="flex-grow-1">
                                    <Link to={`/books/${item.book?.slug || item.book?._id}`} style={{ textDecoration: 'none' }}>
                                        <h6 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>{item.book?.title}</h6>
                                    </Link>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>by {item.book?.author?.name}</p>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center gap-2">
                                            <button className="qty-btn" onClick={() => updateQuantity(item.book?._id, item.quantity - 1)} disabled={item.quantity <= 1}><FiMinus size={12} /></button>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', width: 24, textAlign: 'center' }}>{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(item.book?._id, item.quantity + 1)}><FiPlus size={12} /></button>
                                        </div>
                                        <div className="d-flex align-items-center gap-3">
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>₹{(item.book?.finalPrice || item.price) * item.quantity}</div>
                                                {item.book?.discountPercent > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{item.book?.price * item.quantity}</div>}
                                            </div>
                                            <button onClick={() => removeFromCart(item.book?._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Col>

                    <Col lg={4}>
                        <div className="order-summary">
                            <h5 style={{ fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>Order Summary</h5>

                            {/* Coupon */}
                            <div className="mb-3">
                                {cart.coupon ? (
                                    <div style={{ background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div><FiTag style={{ color: 'var(--success)' }} /> <strong>{cart.coupon.code}</strong><br /><small style={{ color: 'var(--success)' }}>-₹{cart.discount}</small></div>
                                        <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                    </div>
                                ) : (
                                    <div className="d-flex gap-2">
                                        <input className="form-input" placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ fontSize: '0.85rem' }} />
                                        <button className="btn-secondary-custom" onClick={() => { applyCoupon(couponCode); setCouponCode(''); }} style={{ whiteSpace: 'nowrap', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Apply</button>
                                    </div>
                                )}
                            </div>

                            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <span>Subtotal</span><span>₹{cart.totalPrice || cart.subtotal || 0}</span>
                            </div>
                            {cart.discount > 0 && (
                                <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem', color: 'var(--success)' }}>
                                    <span>Discount</span><span>-₹{cart.discount}</span>
                                </div>
                            )}
                            <div className="d-flex justify-content-between mb-2" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <span>Shipping</span><span style={{ color: 'var(--success)', fontWeight: 600 }}>{(cart.totalPrice || 0) >= 499 ? 'FREE' : '₹49'}</span>
                            </div>
                            <hr style={{ borderColor: 'var(--border-color)' }} />
                            <div className="d-flex justify-content-between mb-3" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                <span>Total</span><span>₹{(cart.finalAmount || cart.totalPrice || 0) + ((cart.totalPrice || 0) < 499 ? 49 : 0)}</span>
                            </div>

                            <button className="btn-primary-custom w-100 justify-content-center" onClick={() => navigate('/checkout')}
                                style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
                                Proceed to Checkout
                            </button>
                            <Link to="/books" className="d-block text-center mt-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Continue Shopping</Link>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Cart;
