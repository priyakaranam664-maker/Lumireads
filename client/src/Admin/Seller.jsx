import React, { useEffect, useState } from 'react';
import Anavbar from './Anavbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Seller = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSellers = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('/api/users?role=seller', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSellers(res.data.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load sellers');
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
            toast.success('Seller status updated');
            fetchSellers();
        } catch (error) {
            toast.error('Failed to update seller status');
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Anavbar />
            <div className="container py-5">
                <h3 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Sellers List</h3>
                <div className="card shadow-sm p-4 border" style={{ backgroundColor: '#FDFBF7' }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Sl No</th>
                                    <th>Seller ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Operation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">No sellers found.</td>
                                    </tr>
                                ) : (
                                    sellers.map((seller, idx) => (
                                        <tr key={seller._id}>
                                            <td>{idx + 1}</td>
                                            <td><code>{seller._id}</code></td>
                                            <td>{seller.fullName}</td>
                                            <td>{seller.email}</td>
                                            <td>
                                                <span className={`badge ${seller.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                    {seller.isActive ? 'Active' : 'Blocked'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className={`btn btn-sm ${seller.isActive ? 'btn-outline-danger' : 'btn-outline-success'} fw-bold`}
                                                    onClick={() => handleDeactivate(seller._id, seller.isActive)}
                                                >
                                                    {seller.isActive ? 'Block' : 'Unblock'}
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

export default Seller;
