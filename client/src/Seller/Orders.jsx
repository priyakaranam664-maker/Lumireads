import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('/api/orders/admin/all', {
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

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`/api/orders/admin/${id}`, { orderStatus: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Order status updated`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    useEffect(() => { fetchOrders(); }, []);

    return (
        <div style={{ backgroundColor: '#F4ECE1', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Navbar */}
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#8B4513' }}>
                <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => navigate('/seller/home')}>
                    BookStore (Seller)
                </span>
                <div className="ms-auto d-flex align-items-center gap-4">
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/seller/home')}>Home</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/seller/products')}>My Products</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/seller/add-book')}>Add Books</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/seller/orders')}>Orders</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={handleLogout}>Logout ({user.fullName?.split(' ')[0]})</span>
                </div>
            </nav>

            {/* Main Area */}
            <div className="container py-5 flex-grow-1">
                <h2 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Orders</h2>

                {loading ? (
                    <div className="text-center py-5 text-muted">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-5 text-muted">No orders received yet.</div>
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

                                        {/* Detail Columns */}
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

                                        <div className="col-6 col-md-1">
                                            <div className="text-muted small fw-bold">Customer Name</div>
                                            <div className="small text-secondary">{order.user?.fullName?.split(' ')[0] || 'Client'}</div>
                                        </div>

                                        <div className="col-12 col-md-2">
                                            <div className="text-muted small fw-bold">Address</div>
                                            <div className="small text-muted text-truncate" style={{ maxWidth: '140px' }} title={`${order.shippingAddress?.addressLine1}, ${order.shippingAddress?.city}, ${order.shippingAddress?.state}`}>
                                                {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}
                                            </div>
                                        </div>

                                        <div className="col-6 col-md-1">
                                            <div className="text-muted small fw-bold">Booking Date</div>
                                            <div className="small text-secondary">{formattedDate}</div>
                                        </div>

                                        <div className="col-6 col-md-1">
                                            <div className="text-muted small fw-bold">Delivery By</div>
                                            <div className="small text-secondary">{deliveryDate}</div>
                                        </div>

                                        <div className="col-6 col-md-1">
                                            <div className="text-muted small fw-bold">Warranty</div>
                                            <div className="small text-secondary">1 year</div>
                                        </div>

                                        <div className="col-6 col-md-1">
                                            <div className="text-muted small fw-bold">Price</div>
                                            <div className="fw-bold text-dark">₹{order.totalAmount}</div>
                                        </div>

                                        <div className="col-12 col-md-1 text-center">
                                            <div className="text-muted small fw-bold mb-1">Status</div>
                                            <div className="d-flex flex-column align-items-center gap-1">
                                                <span
                                                    className="fw-bold"
                                                    style={{
                                                        color: order.orderStatus === 'delivered' ? '#5CB85C' : '#D9534F',
                                                        fontSize: '0.85rem'
                                                    }}
                                                >
                                                    {order.orderStatus === 'pending' ? 'outforway' : order.orderStatus}
                                                </span>
                                                <select
                                                    className="form-select form-select-sm mt-1"
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    style={{ fontSize: '0.75rem', padding: '0.2rem' }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
