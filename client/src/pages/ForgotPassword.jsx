import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await authAPI.forgotPassword(data);
            setSent(true);
            toast.success('Reset link sent to your email!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to send reset email'); }
        finally { setLoading(false); }
    };

    return (
        <>
            <Helmet><title>Forgot Password - BookStore</title></Helmet>
            <div className="auth-page">
                <div className="auth-card">
                    <div className="text-center mb-4">
                        <span style={{ fontSize: '2.5rem' }}>🔐</span>
                        <h2 style={{ color: 'var(--text-primary)' }}>Forgot Password?</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {sent ? 'Check your email for the reset link' : 'Enter your email to receive a reset link'}
                        </p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mb-4">
                                <label className="form-label">Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <FiMail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input className="form-input" type="email" placeholder="you@example.com" style={{ paddingLeft: '2.5rem' }}
                                        {...register('email', { required: 'Email is required' })} />
                                </div>
                                {errors.email && <small style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.email.message}</small>}
                            </div>
                            <button type="submit" className="btn-primary-custom w-100 justify-content-center" disabled={loading}
                                style={{ padding: '0.75rem' }}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
                            <p style={{ color: 'var(--text-secondary)' }}>We've sent a password reset link to your email address. Please check your inbox.</p>
                        </div>
                    )}

                    <p className="text-center mt-3">
                        <Link to="/login" style={{ fontWeight: 600, fontSize: '0.9rem' }}><FiArrowLeft size={14} /> Back to Login</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
