import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import {
    FiUser, FiMail, FiPhone, FiLock, FiArrowLeft, FiPackage, FiHeart, FiGift,
    FiHelpCircle, FiCreditCard, FiGlobe, FiAlertCircle, FiSettings,
    FiLogOut, FiPlus, FiTrash, FiTrendingUp, FiBriefcase
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    // States for interactive modals
    const [editProfileShow, setEditProfileShow] = useState(false);
    const [changePasswordShow, setChangePasswordShow] = useState(false);
    const [addressShow, setAddressShow] = useState(false);
    const [couponsShow, setCouponsShow] = useState(false);
    const [loanShow, setLoanShow] = useState(false);
    const [languageModalShow, setLanguageModalShow] = useState(false);
    const [currentLanguage, setCurrentLanguage] = useState('English');
    const [faqShow, setFaqShow] = useState(false);

    // Address management
    const [addresses, setAddresses] = useState([]);
    const [newAddressShow, setNewAddressShow] = useState(false);

    // Fetch user profile on load to sync addresses
    useEffect(() => {
        if (user) {
            setAddresses(user.addresses || []);
        }
        userAPI.getProfile()
            .then(res => {
                if (res.data?.data) {
                    updateUser(res.data.data);
                    setAddresses(res.data.data.addresses || []);
                }
            })
            .catch(() => { });
    }, []);

    // Form Hooks
    const { register, handleSubmit, setValue } = useForm({
        defaultValues: { fullName: user?.fullName, phone: user?.phone }
    });

    useEffect(() => {
        if (user) {
            setValue('fullName', user.fullName);
            setValue('phone', user.phone || '');
        }
    }, [user, setValue]);

    const { register: regPass, handleSubmit: handlePassSubmit, reset: resetPass } = useForm();
    const { register: regAddr, handleSubmit: handleAddrSubmit, reset: resetAddr } = useForm();

    const [loading, setLoading] = useState(false);
    const [passLoading, setPassLoading] = useState(false);
    const [addrLoading, setAddrLoading] = useState(false);

    const onProfileSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await userAPI.updateProfile(data);
            updateUser(res.data.data);
            toast.success('Profile updated successfully!');
            setEditProfileShow(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const onPassSubmit = async (data) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        setPassLoading(true);
        try {
            await authAPI.changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            });
            toast.success('Password changed successfully!');
            resetPass();
            setChangePasswordShow(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setPassLoading(false);
        }
    };

    const onAddrSubmit = async (data) => {
        setAddrLoading(true);
        try {
            const res = await userAPI.addAddress({
                label: data.label || 'Home',
                fullName: data.fullName,
                phone: data.phone,
                addressLine1: data.addressLine1,
                addressLine2: data.addressLine2,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                isDefault: data.isDefault || false
            });
            setAddresses(res.data.data);
            updateUser({ addresses: res.data.data });
            toast.success('Address added successfully!');
            resetAddr();
            setNewAddressShow(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add address');
        } finally {
            setAddrLoading(false);
        }
    };

    const deleteAddress = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await userAPI.deleteAddress(addressId);
            setAddresses(res.data.data);
            updateUser({ addresses: res.data.data });
            toast.success('Address deleted successfully!');
        } catch (err) {
            toast.error('Failed to delete address');
        }
    };

    const handleCopyCoupon = (code) => {
        navigator.clipboard.writeText(code);
        toast.success(`Coupon code "${code}" copied!`);
    };

    const handleLanguageSelect = (lang) => {
        setCurrentLanguage(lang);
        setLanguageModalShow(false);
        toast.success(`Language changed to ${lang}!`);
    };

    const themesConfig = [
        { name: 'light', label: 'Light', color: '#2563EB' },
        { name: 'dark', label: 'Dark Mode', color: '#3B82F6' },
        { name: 'midnight', label: 'Midnight Blue', color: '#6366F1' },
        { name: 'sunset', label: 'Sunset Amber', color: '#F97316' },
        { name: 'forest', label: 'Forest Green', color: '#059669' }
    ];

    const mockCoupons = [
        { code: 'READ50', desc: 'Get flat 50% discount on all bestseller books', minOrder: '₹499' },
        { code: 'WELCOME20', desc: 'Save 20% on your first bookstore order', minOrder: '₹0' },
        { code: 'BOOKVIP', desc: '15% Off + Exclusive free express delivery', minOrder: '₹999' }
    ];

    const mockLanguages = [
        { name: 'English', native: 'English' },
        { name: 'Hindi', native: 'हिंदी' },
        { name: 'Telugu', native: 'తెలుగు' },
        { name: 'Tamil', native: 'தமிழ்' },
        { name: 'Kannada', native: 'ಕನ್ನಡ' }
    ];

    const mockCoins = user?.spentTotal ? Math.round(user.spentTotal / 10) : 105;

    return (
        <>
            <Helmet><title>My Account - BookStore</title></Helmet>
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <Container>
                    <div className="breadcrumb-custom mb-2">
                        <Link to="/">Home</Link>
                        <span>/</span>
                        <span style={{ color: 'white' }}>Account</span>
                    </div>
                    <h1>My Account</h1>
                </Container>
            </div>

            <Container className="pb-5">
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>

                        {/* 1. Header Profile block (Narala Manoj Vibe) */}
                        <div style={{
                            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--border-color)',
                            padding: '1.25rem',
                            marginBottom: '1rem',
                            position: 'relative',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <div className="d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center gap-3">
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: '1.2rem',
                                        border: '2px solid white',
                                        color: 'white',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}>
                                        {(user?.fullName || 'U').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h5 style={{ fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                                            {user?.fullName || 'BookStore Friend'}
                                        </h5>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                                            Enjoy member privileges, free packaging & benefits.
                                        </p>
                                    </div>
                                </div>
                                <div style={{
                                    background: 'rgba(251, 191, 36, 0.15)',
                                    border: '1px solid rgba(251, 191, 36, 0.4)',
                                    borderRadius: 'var(--radius-full)',
                                    padding: '0.35rem 0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontSize: '0.85rem',
                                    fontWeight: 750,
                                    color: 'var(--text-primary)'
                                }} title="Coins balance">
                                    <span>🪙</span> {mockCoins}
                                </div>
                            </div>
                            <div style={{
                                background: 'rgba(37, 99, 235, 0.08)',
                                borderTop: '1px solid var(--border-color)',
                                padding: '0.5rem 1.25rem',
                                margin: '0.75rem -1.25rem -1.25rem',
                                borderBottomLeftRadius: 'var(--radius-lg)',
                                borderBottomRightRadius: 'var(--radius-lg)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{ fontSize: '0.72rem', fontWeight: 650, color: 'var(--text-secondary)' }}>
                                    Explore <strong style={{ color: 'var(--primary)' }}>BOOKSTORE VIP</strong> benefits
                                </span>
                                <button
                                    onClick={() => toast.success('You have entered VIP Portal! Get active discounts enabled.')}
                                    style={{
                                        border: 'none',
                                        background: 'linear-gradient(135deg, var(--secondary), var(--secondary-dark))',
                                        color: 'white',
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-sm)'
                                    }}
                                >
                                    Explore
                                </button>
                            </div>
                        </div>

                        {/* 2. Grid of 4 options boxes */}
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <Link to="/orders" style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '0.85rem',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        transition: 'var(--transition-fast)'
                                    }} className="category-card">
                                        <FiPackage size={22} style={{ color: 'var(--primary)' }} />
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Orders</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-6">
                                <Link to="/wishlist" style={{ textDecoration: 'none' }}>
                                    <div style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: '0.85rem',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '0.25rem',
                                        transition: 'var(--transition-fast)'
                                    }} className="category-card">
                                        <FiHeart size={22} style={{ color: 'var(--secondary)' }} />
                                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Wishlist</span>
                                    </div>
                                </Link>
                            </div>
                            <div className="col-6">
                                <div onClick={() => setCouponsShow(true)} style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.85rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-fast)'
                                }} className="category-card">
                                    <FiGift size={22} style={{ color: 'var(--success)' }} />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Coupons</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div onClick={() => setFaqShow(true)} style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-md)',
                                    padding: '0.85rem',
                                    textAlign: 'center',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    cursor: 'pointer',
                                    transition: 'var(--transition-fast)'
                                }} className="category-card">
                                    <FiHelpCircle size={22} style={{ color: 'var(--info)' }} />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Help Center</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. Theme Customizer Panel */}
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1.25rem',
                            marginBottom: '1rem'
                        }}>
                            <h6 style={{ fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                <FiSettings style={{ color: 'var(--primary)' }} /> Select Color Theme
                            </h6>
                            <div className="d-flex flex-wrap gap-2">
                                {themesConfig.map((t) => {
                                    const active = theme === t.name;
                                    return (
                                        <button
                                            key={t.name}
                                            onClick={() => setTheme(t.name)}
                                            style={{
                                                flex: '1 0 calc(50% - 0.5rem)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                background: active ? 'var(--primary-50)' : 'var(--bg-secondary)',
                                                border: active ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-md)',
                                                padding: '0.5rem 0.75rem',
                                                fontSize: '0.78rem',
                                                fontWeight: active ? 750 : 550,
                                                color: 'var(--text-primary)',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            <span style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                background: t.color,
                                                border: '1px solid var(--text-muted)',
                                                display: 'inline-block'
                                            }} />
                                            {t.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Finance Options */}
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1rem 0',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ padding: '0 1.25rem 0.5rem', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                                Finance Options
                            </div>

                            <div onClick={() => setLoanShow(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} className="sidebar-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FiCreditCard style={{ color: 'var(--primary)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>BookStore Pay Later</div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Limit balance up to ₹10,000 | Activate now</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>&gt;</span>
                            </div>

                            <div onClick={() => toast.success('BookStore Reward Card: Application processing.')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', cursor: 'pointer' }} className="sidebar-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <FiTrendingUp style={{ color: 'var(--secondary)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>Apply for BookStore Credit Card</div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>5% Unlimited cashback + ₹500 welcome voucher</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>&gt;</span>
                            </div>
                        </div>

                        {/* 5. Languages */}
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1rem 1.25rem',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ fontWeight: 800, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                                Try BookStore in your language
                            </div>
                            <div className="d-flex flex-wrap gap-1">
                                {mockLanguages.slice(0, 4).map((l) => (
                                    <button
                                        key={l.name}
                                        onClick={() => handleLanguageSelect(l.name)}
                                        style={{
                                            border: `1px solid ${currentLanguage === l.name ? 'var(--primary)' : 'var(--border-color)'}`,
                                            background: currentLanguage === l.name ? 'var(--primary-50)' : 'var(--bg-secondary)',
                                            color: currentLanguage === l.name ? 'var(--primary)' : 'var(--text-primary)',
                                            padding: '0.25rem 0.65rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.72rem',
                                            fontWeight: 700,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {l.native}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setLanguageModalShow(true)}
                                    style={{
                                        border: '1px solid var(--border-color)',
                                        background: 'transparent',
                                        color: 'var(--primary)',
                                        padding: '0.25rem 0.65rem',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    + {mockLanguages.length - 4} more
                                </button>
                            </div>
                        </div>

                        {/* 6. Settings */}
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1rem 0',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ padding: '0 1.25rem 0.5rem', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                                Account Settings
                            </div>

                            <div onClick={() => setEditProfileShow(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} className="sidebar-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                    <FiUser />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 650 }}>Edit Profile Info</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&gt;</span>
                            </div>

                            <div onClick={() => setAddressShow(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} className="sidebar-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                    <FiGlobe />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 650 }}>Saved Addresses ({addresses.length})</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&gt;</span>
                            </div>

                            <div onClick={() => setChangePasswordShow(true)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} className="sidebar-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                    <FiLock />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 650 }}>Change Password</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&gt;</span>
                            </div>

                            <div onClick={() => toast.success('Active devices: Chrome Windows (Current UI session)')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--border-light)', cursor: 'pointer' }} className="sidebar-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                    <FiSettings />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 650 }}>Manage Active Devices</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>&gt;</span>
                            </div>

                            <div onClick={() => {
                                updateUser({ preferences: { notifications: !user?.preferences?.notifications } });
                                toast.success('Notification preferences updated!');
                            }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', cursor: 'pointer' }} className="sidebar-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                    <FiAlertCircle />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 650 }}>Notification Settings</span>
                                </div>
                                <span style={{ fontSize: '0.72rem', background: 'var(--primary)', color: 'white', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                                    {user?.preferences?.notifications !== false ? 'ON' : 'OFF'}
                                </span>
                            </div>
                        </div>

                        {/* 7. Earn with BookStore */}
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            padding: '1rem 0',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ padding: '0 1.25rem 0.5rem', fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                                Earn with BookStore
                            </div>

                            <div onClick={() => toast.success('Author portal is under review. Update details soon.')} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', cursor: 'pointer' }} className="sidebar-link">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                    <FiBriefcase />
                                    <span style={{ fontSize: '0.82rem', fontWeight: 650 }}>Sell on BookStore (Author / Merchant)</span>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>&gt;</span>
                            </div>
                        </div>

                        {/* 8. Log out */}
                        <button
                            onClick={logout}
                            style={{
                                width: '100%',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--danger)',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                padding: '0.85rem',
                                borderRadius: 'var(--radius-md)',
                                transition: 'var(--transition-fast)',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                            className="btn-icon-hover"
                        >
                            <FiLogOut /> Log Out
                        </button>

                    </Col>
                </Row>
            </Container>

            {/* Edit Profile Modal */}
            <Modal show={editProfileShow} onHide={() => setEditProfileShow(false)} centered size="sm">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Edit Profile</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    <form onSubmit={handleSubmit(onProfileSubmit)}>
                        <div className="mb-3">
                            <label className="form-label">Full Name</label>
                            <input className="form-input" {...register('fullName', { required: true })} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Email (Immutable)</label>
                            <input className="form-input" type="email" value={user?.email || ''} disabled />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Phone</label>
                            <input className="form-input" {...register('phone')} />
                        </div>
                        <button type="submit" className="btn-primary-custom w-100 mt-2" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Change Password Modal */}
            <Modal show={changePasswordShow} onHide={() => setChangePasswordShow(false)} centered size="sm">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    <form onSubmit={handlePassSubmit(onPassSubmit)}>
                        <div className="mb-3">
                            <label className="form-label">Current Password</label>
                            <input className="form-input" type="password" {...regPass('currentPassword', { required: 'Required' })} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">New Password</label>
                            <input className="form-input" type="password" {...regPass('newPassword', { required: 'Required', minLength: 6 })} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Confirm New Password</label>
                            <input className="form-input" type="password" {...regPass('confirmPassword', { required: 'Required' })} />
                        </div>
                        <button type="submit" className="btn-primary-custom w-100 mt-2" disabled={passLoading}>
                            {passLoading ? 'Changing...' : 'Change Password'}
                        </button>
                    </form>
                </Modal.Body>
            </Modal>

            {/* Saved Addresses Modal */}
            <Modal show={addressShow} onHide={() => setAddressShow(false)} centered size="md">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Saved Addresses</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span style={{ fontSize: '0.85rem', fontWeight: 650 }}>{addresses.length} Address(es) saved</span>
                        <button
                            onClick={() => setNewAddressShow(!newAddressShow)}
                            className="btn-primary-custom"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        >
                            <FiPlus /> Add New
                        </button>
                    </div>

                    {newAddressShow && (
                        <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px dashed var(--primary)',
                            padding: '1rem',
                            marginBottom: '1rem'
                        }}>
                            <h6 style={{ fontWeight: 800, marginBottom: '0.75rem', fontSize: '0.85rem' }}><FiPlus /> New Address</h6>
                            <form onSubmit={handleAddrSubmit(onAddrSubmit)}>
                                <div className="row g-2">
                                    <div className="col-8">
                                        <label className="form-label">Contact Name</label>
                                        <input className="form-input" {...regAddr('fullName', { required: true })} />
                                    </div>
                                    <div className="col-4">
                                        <label className="form-label">Label (e.g. Home)</label>
                                        <input className="form-input" {...regAddr('label', { required: true })} placeholder="Home" />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">Phone</label>
                                        <input className="form-input" {...regAddr('phone', { required: true })} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">Postal Code</label>
                                        <input className="form-input" {...regAddr('postalCode', { required: true })} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Address Line 1</label>
                                        <input className="form-input" {...regAddr('addressLine1', { required: true })} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label">Address Line 2 (Optional)</label>
                                        <input className="form-input" {...regAddr('addressLine2')} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">City</label>
                                        <input className="form-input" {...regAddr('city', { required: true })} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">State</label>
                                        <input className="form-input" {...regAddr('state', { required: true })} />
                                    </div>
                                    <div className="col-12 mt-2">
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                                            <input type="checkbox" {...regAddr('isDefault')} /> Make default address
                                        </label>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 mt-3 justify-content-end">
                                    <button type="button" onClick={() => setNewAddressShow(false)} className="btn-secondary-custom" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
                                    <button type="submit" className="btn-primary-custom" style={{ padding: '0.35rem 0.85rem', fontSize: '0.75rem' }} disabled={addrLoading}>{addrLoading ? 'Adding...' : 'Add Address'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {addresses.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <FiGlobe size={24} className="mb-2" />
                            <p style={{ fontSize: '0.8rem' }}>No addresses found. Add an address for checkouts.</p>
                        </div>
                    ) : (
                        addresses.map((a) => (
                            <div key={a._id || Math.random().toString()} style={{
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)',
                                padding: '0.85rem',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div>
                                    <span style={{
                                        fontSize: '0.65rem',
                                        background: a.isDefault ? 'var(--primary)' : 'var(--bg-tertiary)',
                                        color: a.isDefault ? 'white' : 'var(--text-secondary)',
                                        padding: '0.15rem 0.4rem',
                                        borderRadius: '4px',
                                        fontWeight: 800,
                                        marginRight: '0.4rem'
                                    }}>
                                        {a.label || 'Home'}
                                    </span>
                                    <strong style={{ fontSize: '0.82rem' }}>{a.fullName}</strong>
                                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                        {a.addressLine1}, {a.addressLine2 && `${a.addressLine2}, `}{a.city}, {a.state} - {a.postalCode}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Phone: {a.phone}</div>
                                </div>
                                <button
                                    onClick={() => deleteAddress(a._id)}
                                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                                    title="Delete address"
                                >
                                    <FiTrash size={15} />
                                </button>
                            </div>
                        ))
                    )}
                </Modal.Body>
            </Modal>

            {/* Coupons Modal */}
            <Modal show={couponsShow} onHide={() => setCouponsShow(false)} centered size="sm">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Active Coupons</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        Use these coupon codes at checkout to avail massive discount. Click to copy!
                    </p>
                    {mockCoupons.map((c) => (
                        <div
                            key={c.code}
                            onClick={() => handleCopyCoupon(c.code)}
                            style={{
                                border: '1px dashed var(--success)',
                                background: 'var(--bg-secondary)',
                                borderRadius: 'var(--radius-md)',
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                cursor: 'pointer',
                                transition: 'var(--transition-fast)'
                            }}
                            className="category-card"
                        >
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong style={{ color: 'var(--success)', fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>{c.code}</strong>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Min order: {c.minOrder}</span>
                            </div>
                            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>
                                {c.desc}
                            </p>
                        </div>
                    ))}
                </Modal.Body>
            </Modal>

            {/* Help Support Modal */}
            <Modal show={faqShow} onHide={() => setFaqShow(false)} centered size="md">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 850, fontSize: '1.05rem', color: 'var(--text-primary)' }}>FAQs & Help Support</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--primary)' }}>Q: How do I track my delivery package?</h6>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Track statuses live under your "Orders" tab. Once shipped, the tracking links are available.
                        </p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <h6 style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--primary)' }}>Q: What forms of payments do you accept?</h6>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            We support all major Credit Cards, Debit Cards, Net Banking, EMI, and BookStore Pay Later.
                        </p>
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h6 style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.35rem', color: 'var(--primary)' }}>Q: Can I request returns/refunds?</h6>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
                            Yes! BookStore provides a no-questions-asked 7-day stress free returns policy on all books.
                        </p>
                    </div>

                    <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 650 }}>Still need support?</span>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Our customer support is available 24/7.</p>
                        <Link to="/contact" onClick={() => setFaqShow(false)} className="btn-primary-custom" style={{ textDecoration: 'none', padding: '0.35rem 0.85rem', fontSize: '0.75rem' }}>
                            Contact Help Desk
                        </Link>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Language Selection Modal */}
            <Modal show={languageModalShow} onHide={() => setLanguageModalShow(false)} centered size="sm">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>Select Language</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    {mockLanguages.map((l) => (
                        <div
                            key={l.name}
                            onClick={() => handleLanguageSelect(l.name)}
                            style={{
                                padding: '0.65rem',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer',
                                background: currentLanguage === l.name ? 'var(--primary-50)' : 'transparent',
                                border: `1px solid ${currentLanguage === l.name ? 'var(--primary)' : 'transparent'}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                marginBottom: '0.25rem'
                            }}
                            className="category-card"
                        >
                            <span>{l.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{l.native}</span>
                        </div>
                    ))}
                </Modal.Body>
            </Modal>

            {/* Pay Later Activation modal */}
            <Modal show={loanShow} onHide={() => setLoanShow(false)} centered size="md">
                <Modal.Header closeButton style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                    <Modal.Title style={{ fontWeight: 855, fontSize: '1.05rem', color: 'var(--text-primary)' }}>BookStore Pay Later Credit</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
                        color: 'white',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        boxShadow: 'var(--shadow-md)'
                    }}>
                        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Approved Credit Limit</div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0 0.75rem', fontFamily: 'var(--font-display)' }}>₹10,000</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', opacity: 0.9 }}>
                            <span>Available balance: ₹10,000</span>
                            <span>Billed amount: ₹0</span>
                        </div>
                    </div>

                    <h6 style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '0.5rem' }}>Benefits of Pay Later:</h6>
                    <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', marginBottom: '1.25rem' }}>
                        <li>Buy books instantly, pay next month on 5th</li>
                        <li>No interest rates or extra processing fees</li>
                        <li>One-click fast secure checkout orders</li>
                    </ul>

                    <button
                        onClick={() => {
                            toast.success('BookStore Pay Later activated successfully! Choose it during checkout.');
                            setLoanShow(false);
                        }}
                        className="btn-primary-custom w-100"
                    >
                        Activate Now (One-Click)
                    </button>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Profile;
