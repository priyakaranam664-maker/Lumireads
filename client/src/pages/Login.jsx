import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import insforge from '../lib/insforge';
import toast from 'react-hot-toast';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            const user = await login(formData);
            navigate(user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    return (
        <>
            <Helmet><title>Login - BookStore</title></Helmet>
            <div className="auth-page">
                <div className="auth-card">
                    <div className="text-center mb-4">
                        <span style={{ fontSize: '2.5rem' }}>📚</span>
                        <h2 style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to your BookStore account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="mb-3">
                            <label className="form-label">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <FiMail style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="form-input" type="email" placeholder="you@example.com"
                                    style={{ paddingLeft: '2.5rem' }}
                                    {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })} />
                            </div>
                            {errors.email && <small style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.email.message}</small>}
                        </div>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between">
                                <label className="form-label">Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Forgot?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <FiLock style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input className="form-input" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                            {errors.password && <small style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{errors.password.message}</small>}
                        </div>

                        <button type="submit" className="btn-primary-custom w-100 justify-content-center" disabled={loading}
                            style={{ padding: '0.75rem', fontSize: '0.95rem' }}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="text-center my-3" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', position: 'relative' }}>
                        <hr style={{ borderColor: 'var(--border-color)' }} />
                        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--bg-card)', padding: '0 0.75rem' }}>OR</span>
                    </div>

                    <button
                        type="button"
                        onClick={async () => {
                            const { data, error } = await insforge.auth.signInWithOAuth('google', {
                                redirectTo: window.location.origin + '/login'
                            });
                            if (error) toast.error(error.message);
                        }}
                        className="btn-outline-custom w-100 justify-content-center"
                        style={{ padding: '0.65rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <p className="text-center mt-3" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        Don't have an account? <Link to="/register" style={{ fontWeight: 700 }}>Create one</Link>
                    </p>
                </div>
            </div>
        </>
    );
};

export default Login;
