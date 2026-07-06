import { useState, useEffect } from 'react';
import { Row, Col, Modal, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiTag } from 'react-icons/fi';
import { couponAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '', discountType: 'percentage', discountValue: 0,
        minPurchase: 0, maxDiscount: 0, expiresAt: '', usageLimit: 0, isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const { data } = await couponAPI.getAll();
            setCoupons(data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleOpenModal = (cpn = null) => {
        if (cpn) {
            setSelectedCoupon(cpn);
            setFormData({
                code: cpn.code,
                discountType: cpn.discountType,
                discountValue: cpn.discountValue,
                minPurchase: cpn.minPurchase || 0,
                maxDiscount: cpn.maxDiscount || 0,
                expiresAt: cpn.expiresAt ? new Date(cpn.expiresAt).toISOString().split('T')[0] : '',
                usageLimit: cpn.usageLimit || 0,
                isActive: cpn.isActive
            });
        } else {
            setSelectedCoupon(null);
            setFormData({
                code: '', discountType: 'percentage', discountValue: 0,
                minPurchase: 0, maxDiscount: 0, expiresAt: '', usageLimit: 0, isActive: true
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedCoupon) {
                await couponAPI.update(selectedCoupon._id, formData);
                toast.success('Coupon updated');
            } else {
                await couponAPI.create(formData);
                toast.success('Coupon created');
            }
            setShowModal(false);
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Save failed');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this coupon code?')) return;
        try {
            await couponAPI.delete(id);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    return (
        <>
            <Helmet><title>Manage Coupons - Admin</title></Helmet>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontWeight: 800, marginBottom: 0 }}>Coupons</h4>
                <button className="btn-primary-custom" onClick={() => handleOpenModal()}><FiPlus /> New Coupon</button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                {['Code', 'Discount', 'Min Purchase', 'Usage', 'Expires', 'Status', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map((c) => (
                                <tr key={c._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '0.75rem 1rem' }}><code style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', background: 'var(--primary-50)', padding: '0.2rem 0.5rem', borderRadius: 4 }}>{c.code}</code></td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>₹{c.minPurchase || 0}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>{c.usedCount} / {c.usageLimit || '∞'}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: new Date(c.expiresAt) < new Date() ? 'var(--danger)' : 'inherit' }}>
                                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span className="tag" style={{ background: c.isActive ? 'var(--success)' : 'var(--bg-tertiary)', color: 'white' }}>{c.isActive ? 'Active' : 'Hidden'}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div className="d-flex gap-1">
                                            <button className="btn-icon" onClick={() => handleOpenModal(c)}><FiEdit2 size={14} /></button>
                                            <button className="btn-icon" onClick={() => handleDelete(c._id)} style={{ color: 'var(--danger)' }}><FiTrash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {coupons.length === 0 && <div className="empty-state"><h3>No coupons found</h3></div>}
                </div>
            )}

            {/* Coupon Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800 }}>{selectedCoupon ? 'Edit Coupon' : 'Create New Coupon'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)' }}>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <label className="form-label">Coupon Code *</label>
                                <input className="form-input" style={{ textTransform: 'uppercase' }} value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required />
                            </Col>
                            <Col md={6}>
                                <label className="form-label">Discount Type</label>
                                <Form.Select className="form-input" value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}>
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (₹)</option>
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <label className="form-label">Discount Value *</label>
                                <input className="form-input" type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })} required />
                            </Col>
                            <Col md={6}>
                                <label className="form-label">Min Purchase Required (₹)</label>
                                <input className="form-input" type="number" value={formData.minPurchase} onChange={(e) => setFormData({ ...formData, minPurchase: Number(e.target.value) })} />
                            </Col>
                            <Col md={6}>
                                <label className="form-label">Max Discount (₹ - only for percentage)</label>
                                <input className="form-input" type="number" value={formData.maxDiscount} onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })} />
                            </Col>
                            <Col md={6}>
                                <label className="form-label">Expiration Date</label>
                                <input className="form-input" type="date" value={formData.expiresAt} onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })} />
                            </Col>
                            <Col md={6}>
                                <label className="form-label">Usage Limit (0 for infinite)</label>
                                <input className="form-input" type="number" value={formData.usageLimit} onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })} />
                            </Col>
                            <Col md={6} className="d-flex align-items-end mb-2">
                                <Form.Check type="checkbox" label="Is Active" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} />
                            </Col>
                        </Row>
                        <div className="d-flex gap-2 justify-content-end mt-4">
                            <button type="button" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn-primary-custom" disabled={submitting}>{submitting ? 'Saving...' : 'Save Coupon'}</button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminCoupons;
