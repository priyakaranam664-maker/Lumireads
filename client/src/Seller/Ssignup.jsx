import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Ssignup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/register', {
                fullName,
                email,
                password,
                phone,
                role: 'seller'
            });
            if (res.data.success) {
                toast.success('Seller registered successfully! Please log in.');
                navigate('/seller/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Outfit, sans-serif' }}>
            <div className="card shadow-sm p-4 border" style={{ width: '380px', backgroundColor: '#FDFBF7' }}>
                <h4 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Seller Registration</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Seller / Business Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter business name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter contact email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Phone</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-secondary small fw-bold">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Create password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-lg w-100 text-white fw-bold mb-3"
                        style={{ backgroundColor: '#5CB85C', border: 'none', borderRadius: '4px' }}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <div className="text-center mt-3 small text-muted">
                    Already registered? <Link to="/seller/login" style={{ color: '#5CB85C', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Ssignup;
