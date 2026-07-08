import React, { useEffect, useState } from 'react';
import Anavbar from './Anavbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('/api/users?role=user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async (id, currentStatus) => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.put(`/api/users/${id}`, { isActive: !currentStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User status updated');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Anavbar />
            <div className="container py-5">
                <h3 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Users List</h3>
                <div className="card shadow-sm p-4 border" style={{ backgroundColor: '#FDFBF7' }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Sl No</th>
                                    <th>User ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Operation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">No users found.</td>
                                    </tr>
                                ) : (
                                    users.map((user, idx) => (
                                        <tr key={user._id}>
                                            <td>{idx + 1}</td>
                                            <td><code>{user._id}</code></td>
                                            <td>{user.fullName}</td>
                                            <td>{user.email}</td>
                                            <td>
                                                <span className={`badge ${user.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                    {user.isActive ? 'Active' : 'Deactivated'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${user.isActive ? 'btn-outline-danger' : 'btn-outline-success'} fw-bold`}
                                                    onClick={() => handleDeactivate(user._id, user.isActive)}
                                                >
                                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Users;
