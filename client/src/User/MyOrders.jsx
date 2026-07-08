import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await axios.get('/api/orders', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data.data || []);
            } catch (error) {
                console.error(error);
                toast.error('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    return (
        <div style={{ backgroundColor: '#F4ECE1', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Navbar */}
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#8B4513' }}>
                <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => navigate('/user/home')}>
                    BookStore
                </span>
                <div className="ms-auto d-flex align-items-center gap-4">
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/home')}>Home</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/products')}>Books</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/wishlist')}>Wishlist</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/orders')}>My Orders</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={handleLogout}>Logout ({user.fullName?.split(' ')[0]})</span>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="container py-5 flex-grow-1">
                <h2 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>My Orders</h2>

                {loading ? (
                    <div className="text-center py-5 text-muted">Loading your orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-5 text-muted">You haven't placed any orders yet.</div>
                ) : (
                    <div className="d-flex flex-column gap-3">
                        {orders.map((order) => {
                            const firstItem = order.items?.[0] || {};
                            const formattedDate = new Date(order.createdAt).toLocaleDateString('ja-JP').replace(/\//g, '.');
                            const deliveryDate = order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('ja-JP').replace(/\//g, '.') : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('ja-JP').replace(/\//g, '.');

                            return (
                                <div
                                    key={order._id}
                                    className="card p-3 border-0 shadow-sm"
                                    style={{ backgroundColor: '#FDFBF7', borderRadius: '10px' }}
                                >
                                    <div className="row align-items-center g-3 text-center text-md-start">
                                        {/* Image */}
                                        <div className="col-12 col-md-1 text-center">
                                            <img
                                                src={firstItem.coverImage || 'https://via.placeholder.com/60x90?text=Cover'}
                                                alt={firstItem.title}
                                                style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #dac4b0' }}
                                            />
                                        </div>

                                        {/* Columns of details */}
                                        <div className="col-6 col-md-2">
                                            <div className="text-muted small fw-bold">Product Name</div>
                                            <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '140px' }} title={firstItem.title}>
                                                {firstItem.title}
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-1">
                                            <div className="text-muted small fw-bold">Order ID</div>
                                            <code className="small text-secondary">{order.orderNumber?.substring(0, 12)}</code>
                                        </div>

                                        <div className="col-12 col-md-2">
                                            <div className="text-muted small fw-bold">Address</div>
                                            <div className="small text-muted text-truncate" style={{ maxWidth: '150px' }} title={`${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state}`}>
                                                {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-1 col-lg-1">
                                            <div className="text-muted small fw-bold">Seller</div>
                                            <div className="small text-secondary">Seller</div>
                                        </div>

                                        <div className="col-6 col-md-1 col-lg-1">
                                            <div className="text-muted small fw-bold">Booking Date</div>
                                            <div className="small text-secondary">{formattedDate}</div>
                                        </div>

                                        <div className="col-6 col-md-1 col-lg-1">
                                            <div className="text-muted small fw-bold">Delivery By</div>
                                            <div className="small text-secondary">{deliveryDate}</div>
                                        </div>

                                        <div className="col-6 col-md-1 col-lg-1">
                                            <div className="text-muted small fw-bold">Price</div>
                                            <div className="fw-bold text-dark">₹{order.totalAmount}</div>
                                        </div>

                                        <div className="col-12 col-md-1 text-center">
                                            <div className="text-muted small fw-bold mb-1">Status</div>
                                            <span
                                                className="fw-bold"
                                                style={{
                                                    color: order.orderStatus === 'delivered' ? '#5CB85C' : '#D9534F',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {order.orderStatus === 'pending' ? 'outforway' : order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="py-4 text-center mt-5" style={{ backgroundColor: '#EADBC8', borderTop: '1px solid #dac4b0' }}>
                <div className="container">
                    <button
                        onClick={() => navigate('/contact')}
                        className="btn btn-sm px-4 py-2 text-white mb-3"
                        style={{ backgroundColor: '#8B4513', border: 'none', borderRadius: '4px' }}
                    >
                        Contact Us
                    </button>
                    <p className="mb-2 fw-semibold italic" style={{ fontStyle: 'italic', color: '#5D2E17' }}>
                        "Embark on a literary journey with our book haven — where every page turns into an adventure!"
                    </p>
                    <p className="mb-2 fw-bold text-secondary">
                        📞 Call At: 127-865-585-67
                    </p>
                    <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
                        © 2026 <span className="fw-bold" style={{ color: '#8B4513' }}>BookVerse</span>. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
