import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiUser, FiMail, FiPhone, FiLock, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { userAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const { register, handleSubmit } = useForm({
        defaultValues: { fullName: user?.fullName, email: user?.email, phone: user?.phone },
    });
    const { register: regPass, handleSubmit: handlePassSubmit, reset: resetPass } = useForm();

    const onProfileSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await userAPI.updateProfile(data);
            updateUser(res.data.data);
            toast.success('Profile updated!');
        } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
        finally { setLoading(false); }
    };

    const onPassSubmit = async (data) => {
        setPassLoading(true);
        try {
            await authAPI.changePassword(data);
            toast.success('Password changed!');
            resetPass();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
        finally { setPassLoading(false); }
    };

    const navigate = useNavigate();

    return (
        <>
            <Helmet><title>Profile - BookStore</title></Helmet>
            <div className="page-header"><Container><h1>My Profile</h1></Container></div>
            <Container className="py-4">
                <div className="mb-3">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: 0, fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                        <FiArrowLeft size={16} /> Back
                    </button>
                </div>
                <Row className="g-4">
                    <Col lg={6}>
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <h5 style={{ fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiUser style={{ color: 'var(--primary)' }} /> Personal Info</h5>
                            <form onSubmit={handleSubmit(onProfileSubmit)}>
                                <div className="mb-3"><label className="form-label">Full Name</label><input className="form-input" {...register('fullName')} /></div>
                                <div className="mb-3"><label className="form-label">Email</label><input className="form-input" type="email" {...register('email')} disabled /></div>
                                <div className="mb-3"><label className="form-label">Phone</label><input className="form-input" {...register('phone')} /></div>
                                <button type="submit" className="btn-primary-custom" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
                            </form>
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                            <h5 style={{ fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiLock style={{ color: 'var(--primary)' }} /> Change Password</h5>
                            <form onSubmit={handlePassSubmit(onPassSubmit)}>
                                <div className="mb-3"><label className="form-label">Current Password</label><input className="form-input" type="password" {...regPass('currentPassword', { required: true })} /></div>
                                <div className="mb-3"><label className="form-label">New Password</label><input className="form-input" type="password" {...regPass('newPassword', { required: true, minLength: 6 })} /></div>
                                <div className="mb-3"><label className="form-label">Confirm New Password</label><input className="form-input" type="password" {...regPass('confirmPassword', { required: true })} /></div>
                                <button type="submit" className="btn-primary-custom" disabled={passLoading}>{passLoading ? 'Changing...' : 'Change Password'}</button>
                            </form>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Profile;
