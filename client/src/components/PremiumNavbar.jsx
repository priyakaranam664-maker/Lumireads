import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiShoppingCart, FiUser, FiMenu, FiX,
  FiHome, FiBook, FiUsers, FiBell, FiLogOut, FiSettings,
  FiHeart, FiAward, FiClipboard, FiSun, FiMoon
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { generalAPI } from '../services/api';
import '../styles/premium-navbar.css';

const PremiumNavbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cart } = useCart();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = cart?.items?.length || 0;

  // Fetch user notifications
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await generalAPI.getNotifications();
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Click outside listener to close dropdown
  useEffect(() => {
    if (!notificationsOpen) return;
    const closeDropdown = () => setNotificationsOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [notificationsOpen]);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await generalAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await generalAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <FiShoppingCart size={16} />;
      case 'promo':
        return <FiAward size={16} />;
      case 'stock':
        return <FiBook size={16} />;
      default:
        return <FiBell size={16} />;
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${searchQuery}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { label: 'Home', path: '/', icon: FiHome },
    { label: 'Books', path: '/books', icon: FiBook },
    { label: 'Authors', path: '/authors', icon: FiUsers },
    { label: 'Categories', path: '/categories', icon: FiAward },
  ];

  const userMenuItems = [
    { label: 'Profile', path: '/profile', icon: FiUser },
    { label: 'Wishlist', path: '/wishlist', icon: FiHeart },
    { label: 'Orders', path: '/orders', icon: FiClipboard },
    { label: 'Settings', path: '/settings', icon: FiSettings },
  ];

  return (
    <motion.nav
      className={`navbar-premium ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="logo-icon gradient-primary-text">
            <FiBook size={24} />
          </div>
          <div>
            <span className="logo-text">LumiReads</span>
            <span className="logo-subtext">Where Every Story Finds Its Reader.</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-menu">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {isActive(path) && <div className="nav-indicator" />}
            </Link>
          ))}
        </div>

        {/* Search Bar */}
        <motion.div
          className={`search-container ${searchOpen ? 'open' : ''}`}
          layout
        >
          {searchOpen && (
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '100%' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
            >
              <input
                type="text"
                placeholder="Search books..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </motion.form>
          )}
          <button
            className="search-btn"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <FiSearch size={20} />
          </button>
        </motion.div>

        {/* Right Actions */}
        <div className="navbar-actions">
          {/* Theme Toggle */}
          <motion.button
            className="action-btn theme-toggle"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Toggle theme"
            aria-label="Toggle color theme"
          >
            {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
          </motion.button>

          {/* Wishlist */}
          <motion.button
            className="action-btn"
            onClick={() => navigate('/wishlist')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Wishlist"
            aria-label="Open wishlist"
          >
            <FiHeart size={20} />
          </motion.button>

          {/* Notifications */}
          <div 
            className="notification-container" 
            style={{ position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              className="action-btn notification-btn"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Notifications"
              aria-label="Toggle notifications menu"
            >
              <FiBell size={20} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </motion.button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  className="notifications-dropdown"
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="notifications-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && (
                      <button className="mark-all-btn" onClick={handleMarkAllRead}>
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="notifications-list">
                    {notifications.length === 0 ? (
                      <div className="notifications-empty">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                          onClick={(e) => {
                            if (!n.isRead) handleMarkRead(n._id, e);
                            if (n.link) navigate(n.link);
                            setNotificationsOpen(false);
                          }}
                        >
                          <div className={`notification-icon-wrapper ${n.type || 'system'}`}>
                            {getNotificationIcon(n.type)}
                          </div>
                          <div className="notification-content">
                            <div className="notification-title">{n.title}</div>
                            <div className="notification-message">{n.message}</div>
                            <div className="notification-time">{formatTimeAgo(n.createdAt)}</div>
                          </div>
                          {!n.isRead && (
                            <div className="notification-actions">
                              <button
                                className="mark-read-single-btn"
                                onClick={(e) => handleMarkRead(n._id, e)}
                                title="Mark as read"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart */}
          <motion.button
            className="action-btn cart-btn"
            onClick={() => navigate('/cart')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Cart"
            aria-label="Open shopping cart"
          >
            <FiShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount}</span>
            )}
          </motion.button>

          {/* Auth */}
          {isAuthenticated ? (
            <div className="user-menu">
              <motion.button
                className="action-btn user-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Account"
              >
                <div className="user-avatar">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
              </motion.button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-ghost">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            className="mobile-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {navItems.map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                className={`mobile-nav-item ${isActive(path) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}

            {isAuthenticated && (
              <div className="mobile-user-menu">
                {userMenuItems.map(({ label, path }) => (
                  <Link
                    key={path}
                    to={path}
                    className="mobile-nav-item"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
                <button
                  className="btn-ghost mobile-logout"
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default PremiumNavbar;
