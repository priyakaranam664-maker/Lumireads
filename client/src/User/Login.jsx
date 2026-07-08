import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserLogin = () => {
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
                if (user.role !== 'user') {
                    toast.error('Access denied. User account required.');
                    setLoading(false);
                    return;
                }
                localStorage.setItem('accessToken', res.data.data.accessToken);
                localStorage.setItem('user', JSON.stringify(user));
                toast.success('Login successful!');
                navigate('/user/home');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F4ECE1', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Outfit, sans-serif' }}>
            <div className="card shadow-sm p-4 border-0" style={{ width: '360px', backgroundColor: '#FDFBF7', borderRadius: '8px' }}>
                <h4 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Login to User Account</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Email address</label>
                        <input
                            type="email"
                            className="form-control form-control-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Password</label>
                        <input
                            type="password"
                            className="form-control form-control-sm"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-sm w-100 text-white fw-bold mb-3 py-2"
                        style={{ backgroundColor: '#8B4513', border: 'none', borderRadius: '4px' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <div className="text-center mt-2 small text-muted">
                    Don't have an account? Create <Link to="/user/signup" style={{ color: '#8B4513', fontWeight: 'bold', textDecoration: 'none' }}>Signup</Link>
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
