import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserSignup = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
                role: 'user'
            });
            if (res.data.success) {
                toast.success('User registration successful! Please log in.');
                navigate('/user/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F4ECE1', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Outfit, sans-serif' }}>
            <div className="card shadow-sm p-4 border-0" style={{ width: '360px', backgroundColor: '#FDFBF7', borderRadius: '8px' }}>
                <h4 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>User Registration</h4>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Name</label>
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
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
                        {loading ? 'Submitting...' : 'Signup'}
                    </button>
                </form>
                <div className="text-center mt-2 small text-muted">
                    Already have an account? <Link to="/user/login" style={{ color: '#8B4513', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default UserSignup;
