import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const res = await axios.get(`/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return <div className="text-center py-5" style={{ backgroundColor: '#F9F6F0', minHeight: '100vh' }}>Loading...</div>;
    if (!order) return <div className="text-center py-5" style={{ backgroundColor: '#F9F6F0', minHeight: '100vh' }}>Order not found.</div>;

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#5D2E17' }}>
                <span className="navbar-brand text-white fw-bold">📚 BookVerse</span>
            </nav>
            <div className="container py-5">
                <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>← Back</button>
                <div className="card shadow-sm p-4 border" style={{ backgroundColor: '#FDFBF7' }}>
                    <h4 className="fw-bold mb-3" style={{ color: '#5D2E17' }}>Order #{order.orderNumber}</h4>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <p><strong>Status:</strong> <span className={`badge ${order.orderStatus === 'delivered' ? 'bg-success' : order.orderStatus === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'}`}>{order.orderStatus}</span></p>
                            <p><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</p>
                            <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                        </div>
                        <div className="col-md-6">
                            <p><strong>Shipping To:</strong></p>
                            <p className="text-muted small">
                                {order.shippingAddress?.fullName}<br />
                                {order.shippingAddress?.addressLine1}<br />
                                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                            </p>
                        </div>
                    </div>
                    <h5 className="fw-bold mb-3">Items</h5>
                    {order.items?.map((item, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-3 mb-3 p-3 border rounded">
                            <img src={item.coverImage} alt={item.title} style={{ width: '60px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                                <div className="fw-bold">{item.title}</div>
                                <div className="small text-muted">Qty: {item.quantity} × ₹{item.finalPrice}</div>
                            </div>
                            <div className="ms-auto fw-bold" style={{ color: '#8B4513' }}>₹{item.quantity * item.finalPrice}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderItem;
