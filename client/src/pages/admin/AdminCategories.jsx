import { useState, useEffect } from 'react';
import { Row, Col, Modal, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiLayers } from 'react-icons/fi';
import { categoryAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', icon: '', isFeatured: false });
    const [submitting, setSubmitting] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const { data } = await categoryAPI.getAll();
            setCategories(data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleOpenModal = (cat = null) => {
        if (cat) {
            setSelectedCategory(cat);
            setFormData({ name: cat.name, description: cat.description || '', icon: cat.icon || '', isFeatured: cat.isFeatured || false });
        } else {
            setSelectedCategory(null);
            setFormData({ name: '', description: '', icon: '', isFeatured: false });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedCategory) {
                await categoryAPI.update(selectedCategory._id, formData);
                toast.success('Category updated');
            } else {
                await categoryAPI.create(formData);
                toast.success('Category created');
            }
            setShowModal(false);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure? This may affect books in this category.')) return;
        try {
            await categoryAPI.delete(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    return (
        <>
            <Helmet><title>Manage Categories - Admin</title></Helmet>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontWeight: 800, marginBottom: 0 }}>Categories</h4>
                <button className="btn-primary-custom" onClick={() => handleOpenModal()}><FiPlus /> Add Category</button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                {['Icon', 'Name', 'Description', 'Books', 'Featured', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '0.75rem 1rem', fontSize: '1.5rem' }}>{cat.icon || '📁'}</td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{cat.description || '-'}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}><span className="tag">{cat.bookCount || 0}</span></td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{ color: cat.isFeatured ? 'var(--success)' : 'var(--text-muted)' }}>{cat.isFeatured ? 'Yes' : 'No'}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div className="d-flex gap-1">
                                            <button className="btn-icon" onClick={() => handleOpenModal(cat)}><FiEdit2 size={14} /></button>
                                            <button className="btn-icon" onClick={() => handleDelete(cat._id)} style={{ color: 'var(--danger)' }}><FiTrash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {categories.length === 0 && <div className="empty-state"><h3>No categories found</h3></div>}
                </div>
            )}

            {/* Category Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800 }}>{selectedCategory ? 'Edit Category' : 'Add Category'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)' }}>
                    <Form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Category Name *</label>
                            <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Icon (Emoji or URL) *</label>
                            <input className="form-input" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-input" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="mb-4">
                            <Form.Check type="checkbox" label="Featured Category" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} />
                        </div>
                        <div className="d-flex gap-2 justify-content-end">
                            <button type="button" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn-primary-custom" disabled={submitting}>{submitting ? 'Saving...' : 'Save Category'}</button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminCategories;
