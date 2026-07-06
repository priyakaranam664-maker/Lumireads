import { useState, useEffect } from 'react';
import { Row, Col, Modal, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { authorAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminAuthors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null);
    const [formData, setFormData] = useState({ name: '', biography: '', photo: '', country: '', awards: '' });
    const [submitting, setSubmitting] = useState(false);

    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const { data } = await authorAPI.getAll({ limit: 100 });
            setAuthors(data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchAuthors(); }, []);

    const handleOpenModal = (auth = null) => {
        if (auth) {
            setSelectedAuthor(auth);
            setFormData({ name: auth.name, biography: auth.biography || '', photo: auth.photo || '', country: auth.country || '', awards: auth.awards?.join(', ') || '' });
        } else {
            setSelectedAuthor(null);
            setFormData({ name: '', biography: '', photo: '', country: '', awards: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const dataToSubmit = { ...formData, awards: formData.awards ? formData.awards.split(',').map(a => a.trim()) : [] };
        try {
            if (selectedAuthor) {
                await authorAPI.update(selectedAuthor._id, dataToSubmit);
                toast.success('Author updated');
            } else {
                await authorAPI.create(dataToSubmit);
                toast.success('Author created');
            }
            setShowModal(false);
            fetchAuthors();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this author? All their books will remain but have no author linked.')) return;
        try {
            await authorAPI.delete(id);
            toast.success('Author deleted');
            fetchAuthors();
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    return (
        <>
            <Helmet><title>Manage Authors - Admin</title></Helmet>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontWeight: 800, marginBottom: 0 }}>Authors</h4>
                <button className="btn-primary-custom" onClick={() => handleOpenModal()}><FiPlus /> Add Author</button>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                {['Photo', 'Name', 'Country', 'Books', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {authors.map((auth) => (
                                <tr key={auth._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <img src={auth.photo || 'https://via.placeholder.com/40'} alt={auth.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{auth.name}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{auth.country || '-'}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}><span className="tag">{auth.bookCount || 0}</span></td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div className="d-flex gap-1">
                                            <button className="btn-icon" onClick={() => handleOpenModal(auth)}><FiEdit2 size={14} /></button>
                                            <button className="btn-icon" onClick={() => handleDelete(auth._id)} style={{ color: 'var(--danger)' }}><FiTrash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {authors.length === 0 && <div className="empty-state"><h3>No authors found</h3></div>}
                </div>
            )}

            {/* Author Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800 }}>{selectedAuthor ? 'Edit Author' : 'Add Author'}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)' }}>
                    <Form onSubmit={handleSubmit}>
                        <Row className="g-3">
                            <Col md={6}>
                                <label className="form-label">Full Name *</label>
                                <input className="form-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </Col>
                            <Col md={6}>
                                <label className="form-label">Country</label>
                                <input className="form-input" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                            </Col>
                            <Col md={12}>
                                <label className="form-label">Photo URL</label>
                                <input className="form-input" value={formData.photo} onChange={(e) => setFormData({ ...formData, photo: e.target.value })} />
                            </Col>
                            <Col md={12}>
                                <label className="form-label">Biography</label>
                                <textarea className="form-input" rows={4} value={formData.biography} onChange={(e) => setFormData({ ...formData, biography: e.target.value })} />
                            </Col>
                            <Col md={12}>
                                <label className="form-label">Awards (Comma separated)</label>
                                <input className="form-input" value={formData.awards} onChange={(e) => setFormData({ ...formData, awards: e.target.value })} placeholder="e.g. Booker Prize, Pulitzer Prize" />
                            </Col>
                        </Row>
                        <div className="d-flex gap-2 justify-content-end mt-4">
                            <button type="button" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn-primary-custom" disabled={submitting}>{submitting ? 'Saving...' : 'Save Author'}</button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminAuthors;
