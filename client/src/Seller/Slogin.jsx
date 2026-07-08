import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Slogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            if (res.data.success) {
                const user = res.data.data.user;
                if (user.role !== 'seller') {
                    toast.error('Access denied. Seller account required.');
                    setLoading(false);
                    return;
                }
                localStorage.setItem('accessToken', res.data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(user));
                toast.success('Seller login successful!');
                navigate('/seller/home');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Please verify credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Outfit, sans-serif' }}>
            <div className="card shadow-sm p-4 border" style={{ width: '380px', backgroundColor: '#FDFBF7' }}>
                <h4 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Login to Seller Account</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="form-label text-secondary small fw-bold">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
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
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <div className="text-center mt-3 small text-muted">
                    Don't have a seller account? <Link to="/seller/signup" style={{ color: '#5CB85C', fontWeight: 'bold', textDecoration: 'none' }}>Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Slogin;
