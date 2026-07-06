import { useState, useEffect } from 'react';
import { Row, Col, Form, Modal } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiSearch, FiShoppingBag, FiTruck, FiCheck, FiX, FiMoreVertical } from 'react-icons/fi';
import { orderAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = { sort: 'newest' };
            if (search) params.q = search;
            if (statusFilter) params.orderStatus = statusFilter;
            const { data } = await orderAPI.getAllAdmin(params);
            setOrders(data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchOrders(); }, [search, statusFilter]);

    const handleOpenStatusModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.orderStatus);
        setShowStatusModal(true);
    };

    const handleStatusUpdate = async () => {
        if (!newStatus) return;
        setSubmitting(true);
        try {
            await orderAPI.updateStatus(selectedOrder._id, { orderStatus: newStatus });
            toast.success('Order status updated');
            setShowStatusModal(false);
            fetchOrders();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setSubmitting(false); }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: '#F59E0B', icon: FiShoppingBag },
            confirmed: { bg: '#2563EB', icon: FiCheck },
            shipped: { bg: '#7C3AED', icon: FiTruck },
            delivered: { bg: '#10B981', icon: FiCheck },
            cancelled: { bg: '#EF4444', icon: FiX }
        };
        const b = badges[status] || badges.pending;
        return (
            <span className="tag" style={{ background: b.bg, color: 'white', display: 'flex', alignItems: 'center', gap: '0.3rem', width: 'fit-content' }}>
                <b.icon size={10} /> {status.toUpperCase()}
            </span>
        );
    };

    return (
        <>
            <Helmet><title>Manage Orders - Admin</title></Helmet>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontWeight: 800, marginBottom: 0 }}>Orders</h4>
            </div>

            <div className="d-flex gap-3 mb-4 flex-wrap">
                <div className="search-wrapper flex-grow-1">
                    <FiSearch className="search-icon" />
                    <input className="search-input" placeholder="Search order #, customer, phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Form.Select size="sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '200px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </Form.Select>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                {['Order #', 'Customer', 'Date', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>#{order.orderNumber}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ fontWeight: 600 }}>{order.user?.fullName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.user?.email}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>₹{order.finalAmount}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{order.paymentMethod}</div>
                                        <div style={{ fontSize: '0.7rem', color: order.paymentStatus === 'completed' ? 'var(--success)' : 'var(--warning)' }}>{order.paymentStatus}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{getStatusBadge(order.orderStatus)}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div className="d-flex gap-1">
                                            <Link to={`/orders/${order._id}`} className="btn-icon" title="View Details"><FiEye size={14} /></Link>
                                            <button className="btn-icon" onClick={() => handleOpenStatusModal(order)} title="Update Status"><FiMoreVertical size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <div className="empty-state"><h3>No orders found</h3></div>}
                </div>
            )}

            {/* Status Modal */}
            <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800 }}>Update Order Status</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Updating status for Order <b>#{selectedOrder?.orderNumber}</b></p>
                    <Form.Select className="form-input mb-4" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </Form.Select>
                    <div className="d-flex gap-2 justify-content-end">
                        <button type="button" className="btn-secondary-custom" onClick={() => setShowStatusModal(false)}>Cancel</button>
                        <button type="button" className="btn-primary-custom" onClick={handleStatusUpdate} disabled={submitting}>{submitting ? 'Updating...' : 'Update Status'}</button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminOrders;
