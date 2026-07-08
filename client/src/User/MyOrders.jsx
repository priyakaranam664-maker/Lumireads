import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#5D2E17' }}>
                <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem' }}>📚 BookVerse</span>
                <div className="ms-auto d-flex align-items-center gap-3">
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/home')}>Home</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/products')}>Products</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/orders')}>My Orders</span>
                    <button onClick={handleLogout} className="btn btn-sm btn-outline-light ms-2 px-3 fw-bold">Logout</button>
                </div>
            </nav>

            <div className="container py-5">
                <h3 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>User Orders</h3>
                <div className="card shadow-sm p-4 border" style={{ backgroundColor: '#FDFBF7' }}>
                    {loading ? (
                        <p className="text-center text-muted">Loading...</p>
                    ) : orders.length === 0 ? (
                        <p className="text-center text-muted py-4">You haven't placed any orders yet.</p>
                    ) : (
                        orders.map((order) => (
                            <div key={order._id} className="card mb-3 p-3 border shadow-sm" style={{ cursor: 'pointer' }} onClick={() => navigate(`/user/order/${order._id}`)}>
                                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                                    <div className="d-flex align-items-center gap-3">
                                        {order.items?.[0]?.coverImage && (
                                            <img src={order.items[0].coverImage} alt="" style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                                        )}
                                        <div>
                                            <div className="fw-bold">{order.items?.[0]?.title || 'Order'}</div>
                                            <div className="small text-muted">Order ID: {order.orderNumber}</div>
                                            {order.items?.length > 1 && <div className="small text-muted">+{order.items.length - 1} more items</div>}
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold" style={{ color: '#8B4513' }}>₹{order.totalAmount}</div>
                                        <div className="small text-muted">
                                            {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`badge fs-6 ${order.orderStatus === 'delivered' ? 'bg-success' :
                                                order.orderStatus === 'cancelled' ? 'bg-danger' :
                                                    order.orderStatus === 'shipped' ? 'bg-info' :
                                                        'bg-warning text-dark'
                                            }`}>
                                            Status: {order.orderStatus}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
