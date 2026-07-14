import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import insforge from '../lib/insforge';
import toast from 'react-hot-toast';

const FloatingField = ({ id, type = 'text', label, icon: Icon, name, register: reg, errors, touchedFields, isSubmitted, children, autoComplete }) => {
    const hasError = !!errors[name];
    const isValid = !hasError && (touchedFields[name] || isSubmitted);
    const cls = hasError ? 'has-error' : isValid ? 'is-valid' : '';

    return (
        <div className="fl-group">
            <input
                id={id}
                className={`fl-input ${cls}`}
                type={type}
                placeholder={label}
                autoComplete={autoComplete}
                {...reg}
            />
            <label htmlFor={id} className="fl-label">{label}</label>
            <span className="fl-icon"><Icon size={15} /></span>
            {children}
            {isValid && !children && <span className="fl-status-icon valid">✓</span>}
            {hasError && <div className="fl-error"><FiAlertCircle size={12} />{errors[name].message}</div>}
        </div>
    );
};

const Register = () => {
    const { register: registerUser } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors, touchedFields, isSubmitted }, watch } = useForm({ mode: 'onTouched' });

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            await registerUser(formData);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally { setLoading(false); }
    };

    const passwordValue = watch('password');

    return (
        <>
            <Helmet><title>Create Account — BookStore</title></Helmet>
            <div className="auth-page">
                <div className="auth-blob-extra" />
                <div className="auth-card" style={{ maxWidth: '490px' }}>
                    {/* Logo */}
                    <div className="auth-logo-wrap">📚</div>
                    <h2 style={{ textAlign: 'center', fontSize: '1.6rem' }}>Create Account</h2>
                    <p style={{ textAlign: 'center', marginBottom: '1.75rem', fontSize: '0.88rem' }}>
                        Join thousands of book lovers today
                    </p>

                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        {/* Full Name */}
                        <FloatingField
                            id="reg-fullname"
                            label="Full Name"
                            icon={FiUser}
                            name="fullName"
                            autoComplete="name"
                            register={register('fullName', {
                                required: 'Full name is required',
                                minLength: { value: 2, message: 'Minimum 2 characters' }
                            })}
                            errors={errors}
                            touchedFields={touchedFields}
                            isSubmitted={isSubmitted}
                        />

                        {/* Email */}
                        <FloatingField
                            id="reg-email"
                            type="email"
                            label="Email Address"
                            icon={FiMail}
                            name="email"
                            autoComplete="email"
                            register={register('email', {
                                required: 'Email is required',
                                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                            })}
                            errors={errors}
                            touchedFields={touchedFields}
                            isSubmitted={isSubmitted}
                        />

                        {/* Phone */}
                        <FloatingField
                            id="reg-phone"
                            type="tel"
                            label="Phone Number"
                            icon={FiPhone}
                            name="phone"
                            autoComplete="tel"
                            register={register('phone', {
                                required: 'Phone number is required',
                                pattern: { value: /^[0-9]{10}$/, message: '10-digit number required' }
                            })}
                            errors={errors}
                            touchedFields={touchedFields}
                            isSubmitted={isSubmitted}
                        />

                        {/* Password */}
                        <div className="fl-group">
                            <input
                                id="reg-password"
                                className={`fl-input ${errors.password ? 'has-error' : (!errors.password && (touchedFields.password || isSubmitted) && passwordValue?.length >= 6) ? 'is-valid' : ''}`}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="password"
                                autoComplete="new-password"
                                style={{ paddingRight: '2.8rem' }}
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters' }
                                })}
                            />
                            <label htmlFor="reg-password" className="fl-label">Password</label>
                            <span className="fl-icon"><FiLock size={15} /></span>
                            <button
                                type="button"
                                className="fl-toggle-btn"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label="Toggle password"
                            >
                                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                            {errors.password && (
                                <div className="fl-error"><FiAlertCircle size={12} />{errors.password.message}</div>
                            )}
                            {/* Password strength bar */}
                            {passwordValue && (
                                <div style={{ display: 'flex', gap: '4px', marginTop: '0.4rem' }}>
                                    {[6, 9, 12].map((threshold, i) => (
                                        <div key={i} style={{
                                            flex: 1, height: 3, borderRadius: 2,
                                            background: passwordValue.length >= threshold
                                                ? i === 0 ? '#f59e0b' : i === 1 ? '#3b82f6' : '#10b981'
                                                : 'rgba(255,255,255,0.1)',
                                            transition: 'background 0.3s'
                                        }} />
                                    ))}
                                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', marginLeft: '4px', lineHeight: '12px' }}>
                                        {passwordValue.length < 6 ? 'Weak' : passwordValue.length < 9 ? 'Fair' : passwordValue.length < 12 ? 'Good' : 'Strong'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="fl-group">
                            <input
                                id="reg-confirm-password"
                                className={`fl-input ${errors.confirmPassword ? 'has-error' : (!errors.confirmPassword && (touchedFields.confirmPassword || isSubmitted) && watch('confirmPassword')) ? 'is-valid' : ''}`}
                                type="password"
                                placeholder="confirmPassword"
                                autoComplete="new-password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (val) => val === passwordValue || 'Passwords do not match'
                                })}
                            />
                            <label htmlFor="reg-confirm-password" className="fl-label">Confirm Password</label>
                            <span className="fl-icon"><FiLock size={15} /></span>
                            {!errors.confirmPassword && touchedFields.confirmPassword && watch('confirmPassword') && (
                                <span className="fl-status-icon valid">✓</span>
                            )}
                            {errors.confirmPassword && (
                                <div className="fl-error"><FiAlertCircle size={12} />{errors.confirmPassword.message}</div>
                            )}
                        </div>

                        <button
                            type="submit"
                            id="register-submit-btn"
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
                                    Creating Account…
                                </>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-divider"><span>OR CONTINUE WITH</span></div>

                    <button
                        id="register-google-btn"
                        type="button"
                        className="auth-btn-social"
                        onClick={async () => {
                            const { error } = await insforge.auth.signInWithOAuth('google', {
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
                        Already have an account? <Link to="/login">Sign in</Link>
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </>
    );
};

export default Register;
