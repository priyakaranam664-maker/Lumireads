import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Uhome = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        axios.get('/api/books').then(res => {
            setBooks(res.data.data || []);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    return (
        <div style={{ backgroundColor: '#F4ECE1', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column' }}>
            {/* Header / Navbar */}
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#8B4513' }}>
                <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem', cursor: 'pointer' }} onClick={() => navigate('/user/home')}>
                    BookStore
                </span>
                <div className="ms-auto d-flex align-items-center gap-4">
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/home')}>Home</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/products')}>Books</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/wishlist')}>Wishlist</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/orders')}>My Orders</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={handleLogout}>Logout ({user.fullName?.split(' ')[0]})</span>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container py-5 flex-grow-1 text-center">

                {/* Best Seller Section */}
                <h3 className="fw-bold mb-4" style={{ color: '#5D2E17' }}>Best Seller</h3>
                {loading ? (
                    <p className="text-muted">Loading...</p>
                ) : (
                    <div className="row g-4 justify-content-center">
                        {books.slice(0, 4).map((book) => (
                            <div key={book._id} className="col-6 col-md-3">
                                <div
                                    className="card h-100 border-0 shadow-sm"
                                    style={{ backgroundColor: '#FDFBF7', cursor: 'pointer', borderRadius: '4px' }}
                                    onClick={() => navigate(`/user/item/${book.slug || book._id}`)}
                                >
                                    <img src={book.coverImage} alt={book.title} className="card-img-top" style={{ height: '280px', objectFit: 'cover' }} />
                                    <div className="card-body p-2 border-top">
                                        <div className="fw-bold small text-uppercase text-truncate" style={{ fontSize: '0.8rem' }}>{book.title}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Top Recommendation Section */}
                <h3 className="fw-bold mt-5 mb-4" style={{ color: '#5D2E17' }}>Top Recommendation</h3>
                {loading ? (
                    <p className="text-muted">Loading...</p>
                ) : (
                    <div className="row g-4 justify-content-center">
                        {books.slice(4, 8).map((book) => (
                            <div key={book._id} className="col-6 col-md-3">
                                <div
                                    className="card h-100 border-0 shadow-sm pb-2"
                                    style={{ backgroundColor: '#FDFBF7', cursor: 'pointer', borderRadius: '4px' }}
                                    onClick={() => navigate(`/user/item/${book.slug || book._id}`)}
                                >
                                    <img src={book.coverImage} alt={book.title} className="card-img-top" style={{ height: '280px', objectFit: 'cover' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Uhome;
