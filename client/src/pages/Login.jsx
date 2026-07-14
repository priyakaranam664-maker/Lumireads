import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import insforge from '../lib/insforge';
import toast from 'react-hot-toast';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors, touchedFields, isSubmitted } } = useForm({ mode: 'onTouched' });

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            const user = await login(formData);
            navigate(user.role === 'admin' ? '/admin' : '/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally { setLoading(false); }
    };

    const fieldState = (name) => {
        if (errors[name]) return 'has-error';
        if ((touchedFields[name] || isSubmitted) && !errors[name]) return 'is-valid';
        return '';
    };

    return (
        <>
            <Helmet><title>Sign In — BookStore</title></Helmet>
            <div className="auth-page">
                <div className="auth-blob-extra" />
                <div className="auth-card">
                    {/* Logo */}
                    <div className="auth-logo-wrap">📚</div>
                    <h2 style={{ textAlign: 'center', fontSize: '1.6rem' }}>Welcome Back</h2>
                    <p style={{ textAlign: 'center', marginBottom: '1.75rem', fontSize: '0.88rem' }}>
                        Sign in to your BookStore account
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* Email */}
                        <div className="fl-group">
                            <input
                                id="login-email"
                                className={`fl-input ${fieldState('email')}`}
                                type="email"
                                placeholder="email"
                                autoComplete="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                                })}
                            />
                            <label htmlFor="login-email" className="fl-label">Email Address</label>
                            <span className="fl-icon"><FiMail size={15} /></span>
                            {!errors.email && touchedFields.email && (
                                <span className="fl-status-icon valid">✓</span>
                            )}
                            {errors.email && <span className="fl-status-icon invalid">✗</span>}
                            {errors.email && (
                                <div className="fl-error">
                                    <FiAlertCircle size={12} />{errors.email.message}
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div className="fl-group">
                            <input
                                id="login-password"
                                className={`fl-input ${fieldState('password')}`}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="password"
                                autoComplete="current-password"
                                style={{ paddingRight: '2.8rem' }}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters' }
                                })}
                            />
                            <label htmlFor="login-password" className="fl-label">Password</label>
                            <span className="fl-icon"><FiLock size={15} /></span>
                            <button
                                type="button"
                                className="fl-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                            {errors.password && (
                                <div className="fl-error">
                                    <FiAlertCircle size={12} />{errors.password.message}
                                </div>
                            )}
                        </div>

                        {/* Remember me + Forgot */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
                            <label className="auth-remember">
                                <input
                                    type="checkbox"
                                    id="remember-me"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Remember me</span>
                            </label>
                            <Link
                                to="/forgot-password"
                                style={{ fontSize: '0.82rem', color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            id="login-submit-btn"
                            className="auth-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span style={{
                                        width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
                                        borderTopColor: '#fff', borderRadius: '50%',
                                        display: 'inline-block', animation: 'spin 0.7s linear infinite'
                                    }} />
                                    Signing in…
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    <div className="auth-divider"><span>OR CONTINUE WITH</span></div>

                    <button
                        id="login-google-btn"
                        type="button"
                        className="auth-btn-social"
                        onClick={async () => {
                            const { data, error } = await insforge.auth.signInWithOAuth('google', {
                                redirectTo: window.location.origin + '/login'
                            });
                            if (error) toast.error(error.message);
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    <p className="auth-footer-text">
                        Don't have an account? <Link to="/register">Create one</Link>
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
};

export default Login;
