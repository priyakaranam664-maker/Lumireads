import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Asignup = () => {
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
                role: 'admin'
            });
            if (res.data.success) {
                toast.success('Admin registered successfully! Please log in.');
                navigate('/admin/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontFamily: 'Outfit, sans-serif' }}>
            <div className="card shadow-sm p-5 border" style={{ width: '400px', backgroundColor: '#FDFBF7' }}>
                <h3 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Admin Registration</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label text-secondary small fw-bold">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter your name"
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
                            placeholder="Enter your email"
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
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-lg w-100 text-white fw-bold mb-3"
                        style={{ backgroundColor: '#8B4513', border: 'none', borderRadius: '4px' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Signup'}
                    </button>
                </form>
                <div className="text-center mt-3 small text-muted">
                    Already have an account? <Link to="/admin/login" style={{ color: '#8B4513', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Asignup;
