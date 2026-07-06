import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar as BsNavbar, Dropdown } from 'react-bootstrap';
import { FiSearch, FiShoppingCart, FiHeart, FiUser, FiSun, FiMoon, FiMenu, FiLogOut, FiSettings, FiPackage, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { bookAPI } from '../services/api';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (val) => {
        setSearchQuery(val);
        clearTimeout(timerRef.current);
        if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        timerRef.current = setTimeout(async () => {
            try {
                const { data } = await bookAPI.autocomplete(val);
                setSuggestions(data.data);
                setShowSuggestions(true);
            } catch { setSuggestions([]); }
        }, 300);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) { navigate(`/books?q=${searchQuery}`); setShowSuggestions(false); }
    };

    return (
        <BsNavbar expand="lg" className="navbar-main">
            <Container>
                <Link to="/" className="navbar-brand d-flex align-items-center gap-2 me-4">
                    <span style={{ fontSize: '1.6rem' }}>📚</span>
                    <span className="navbar-brand-text">BookStore</span>
                </Link>

                <BsNavbar.Toggle aria-controls="main-nav"><FiMenu /></BsNavbar.Toggle>

                <BsNavbar.Collapse id="main-nav">
                    <Nav className="me-auto">
                        <NavLink to="/" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>Home</NavLink>
                        <NavLink to="/books" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>Books</NavLink>
                        <NavLink to="/categories" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>Categories</NavLink>
                        <NavLink to="/authors" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>Authors</NavLink>
                        <NavLink to="/books?isBestSeller=true" className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}>Best Sellers</NavLink>
                    </Nav>

                    {/* Search */}
                    <div className="search-wrapper me-3 d-none d-lg-block" ref={searchRef}>
                        <form onSubmit={handleSearchSubmit}>
                            <FiSearch className="search-icon" />
                            <input className="search-input" placeholder="Search books, authors, ISBN..." value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} />
                        </form>
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="search-dropdown">
                                {suggestions.map((book) => (
                                    <div className="search-item" key={book._id}
                                        onClick={() => { navigate(`/books/${book.slug}`); setShowSuggestions(false); setSearchQuery(''); }}>
                                        <img src={book.coverImage} alt={book.title} />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{book.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.author?.name}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>₹{book.finalPrice}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="d-flex align-items-center gap-1">
                        <button className="nav-icon-btn" onClick={toggleTheme} title="Toggle theme">
                            {theme === 'light' ? <FiMoon /> : <FiSun />}
                        </button>

                        <button className="nav-icon-btn" onClick={() => navigate('/wishlist')} title="Wishlist"><FiHeart /></button>
                        <button className="nav-icon-btn" onClick={() => navigate('/cart')} title="Cart">
                            <FiShoppingCart />
                            {isAuthenticated && cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>

                        {isAuthenticated ? (
                            <Dropdown align="end">
                                <Dropdown.Toggle as="button" className="nav-icon-btn" style={{ border: '2px solid var(--primary)', color: 'var(--primary)' }}>
                                    <FiUser />
                                </Dropdown.Toggle>
                                <Dropdown.Menu style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xl)', minWidth: '200px' }}>
                                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.fullName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                                    </div>
                                    <Dropdown.Item as={Link} to="/dashboard" style={{ color: 'var(--text-secondary)' }}><FiGrid className="me-2" />Dashboard</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/orders" style={{ color: 'var(--text-secondary)' }}><FiPackage className="me-2" />My Orders</Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/profile" style={{ color: 'var(--text-secondary)' }}><FiSettings className="me-2" />Settings</Dropdown.Item>
                                    {isAdmin && <Dropdown.Item as={Link} to="/admin" style={{ color: 'var(--primary)', fontWeight: 600 }}><FiGrid className="me-2" />Admin Panel</Dropdown.Item>}
                                    <Dropdown.Divider style={{ borderColor: 'var(--border-color)' }} />
                                    <Dropdown.Item onClick={logout} style={{ color: 'var(--danger)' }}><FiLogOut className="me-2" />Logout</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        ) : (
                            <div className="d-flex gap-2 ms-2">
                                <Link to="/login" className="btn-secondary-custom" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Login</Link>
                                <Link to="/register" className="btn-primary-custom" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Sign Up</Link>
                            </div>
                        )}
                    </div>
                </BsNavbar.Collapse>
            </Container>
        </BsNavbar>
    );
};

export default Navbar;
