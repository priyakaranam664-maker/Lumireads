import { useState, useEffect } from 'react';
import { Form, Modal } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiUser, FiCheckCircle, FiSlash, FiSettings } from 'react-icons/fi';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ role: '', isActive: true });
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = { limit: 100 };
            if (search) params.q = search;
            if (roleFilter) params.role = roleFilter;
            const { data } = await userAPI.getAll(params);
            setUsers(data.data);
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, [search, roleFilter]);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setFormData({ role: user.role, isActive: user.isActive });
        setShowModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await userAPI.update(selectedUser._id, formData);
            toast.success('User updated successfully');
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setSubmitting(false); }
    };

    return (
        <>
            <Helmet><title>Manage Users - Admin</title></Helmet>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontWeight: 800, marginBottom: 0 }}>Users</h4>
            </div>

            <div className="d-flex gap-3 mb-4 flex-wrap">
                <div className="search-wrapper flex-grow-1">
                    <FiSearch className="search-icon" />
                    <input className="search-input" placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Form.Select size="sm" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ width: '150px', background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    <option value="">All Roles</option>
                    <option value="user">Users</option>
                    <option value="admin">Admins</option>
                </Form.Select>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                                {['User', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'left' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.fullName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{u.phone || '-'}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span className="tag" style={{ background: u.role === 'admin' ? 'var(--primary)' : 'var(--bg-tertiary)', color: u.role === 'admin' ? 'white' : 'var(--text-secondary)' }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: u.isActive ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                                            {u.isActive ? <FiCheckCircle /> : <FiSlash />} {u.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <button className="btn-icon" onClick={() => handleEdit(u)} title="Manage User"><FiSettings size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && <div className="empty-state"><h3>No users found</h3></div>}
                </div>
            )}

            {/* Edit User Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800 }}>Manage User Account</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)' }}>
                    <div className="text-center mb-4">
                        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem', fontSize: '1.5rem' }}>
                            <FiUser />
                        </div>
                        <h6 style={{ marginBottom: '0.1rem', fontWeight: 700 }}>{selectedUser?.fullName}</h6>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedUser?.email}</p>
                    </div>
                    <form onSubmit={handleUpdate}>
                        <div className="mb-3">
                            <label className="form-label">Account Role</label>
                            <Form.Select className="form-input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                <option value="user">User</option>
                                <option value="admin">Administrator</option>
                            </Form.Select>
                        </div>
                        <div className="mb-4">
                            <label className="form-label">Account Status</label>
                            <Form.Select className="form-input" value={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}>
                                <option value="true">Active (Access Granted)</option>
                                <option value="false">Blocked (Suspended)</option>
                            </Form.Select>
                        </div>
                        <div className="d-flex gap-2 justify-content-end">
                            <button type="button" className="btn-secondary-custom" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="btn-primary-custom" disabled={submitting}>{submitting ? 'Updating...' : 'Save Changes'}</button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default AdminUsers;
