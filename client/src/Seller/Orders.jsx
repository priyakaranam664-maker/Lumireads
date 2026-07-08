import React, { useEffect, useState } from 'react';
import Snavbar from './Snavbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

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
            toast.success(`Order status updated to ${newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Snavbar />
            <div className="container py-5">
                <h3 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Orders Received</h3>
                <div className="card shadow-sm p-4 border" style={{ backgroundColor: '#FDFBF7' }}>
                    {loading ? (
                        <p className="text-center text-muted">Loading orders...</p>
                    ) : orders.length === 0 ? (
                        <p className="text-center text-muted py-4">No orders received yet.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Order #</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order._id}>
                                            <td><code className="small">{order.orderNumber}</code></td>
                                            <td>{order.user?.fullName || 'N/A'}</td>
                                            <td>{order.items?.length || 0} items</td>
                                            <td className="fw-bold">₹{order.totalAmount}</td>
                                            <td>
                                                <span className={`badge ${order.orderStatus === 'delivered' ? 'bg-success' :
                                                        order.orderStatus === 'cancelled' ? 'bg-danger' :
                                                            order.orderStatus === 'shipped' ? 'bg-info' :
                                                                'bg-warning text-dark'
                                                    }`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td>
                                                <select
                                                    className="form-select form-select-sm"
                                                    value={order.orderStatus}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    style={{ width: '140px' }}
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="confirmed">Confirmed</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="shipped">Shipped</option>
                                                    <option value="delivered">Delivered</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Orders;
