import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Uhome = () => {
    const navigate = useNavigate();
    const [featured, setFeatured] = useState([]);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const categories = [
        { name: 'Fiction', icon: '📖' },
        { name: 'Science', icon: '🔬' },
        { name: 'Biographies', icon: '👤' },
        { name: "Children's Books", icon: '👶' },
    ];

    useEffect(() => {
        axios.get('/api/books/featured?limit=4').then(res => {
            setFeatured(res.data.data || []);
        }).catch(() => { });
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#5D2E17' }}>
                <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem' }}>📚 BookVerse</span>
                <div className="ms-auto d-flex align-items-center gap-3">
                    <span className="text-white fw-semibold cursor-pointer" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/home')}>Home</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/products')}>Products</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/orders')}>My Orders</span>
                    <button onClick={handleLogout} className="btn btn-sm btn-outline-light ms-2 px-3 fw-bold">Logout</button>
                </div>
            </nav>

            {/* Hero */}
            <div className="container text-center py-5">
                <h1 className="fw-bold mt-4" style={{ color: '#883311', fontSize: '2.8rem' }}>
                    Welcome, {user.fullName || 'Reader'}!
                </h1>
                <p className="text-muted mx-auto mt-2" style={{ maxWidth: '600px', fontSize: '1.05rem' }}>
                    Your gateway to infinite stories. Browse, discover, and shop your favorite books.
                </p>
                <button onClick={() => navigate('/user/products')} className="btn btn-lg px-4 mt-3 text-white fw-bold" style={{ backgroundColor: '#A0522D', border: 'none' }}>
                    Start Shopping
                </button>

                {/* Categories */}
                <h4 className="fw-bold mt-5 pt-4 mb-4" style={{ color: '#883311' }}>Explore by Category</h4>
                <div className="row justify-content-center gap-3 px-3">
                    {categories.map((cat, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(`/user/products?category=${cat.name}`)}
                            className="col-12 col-sm-5 col-md-2 p-4 text-center rounded shadow-sm"
                            style={{ backgroundColor: '#EADBC8', cursor: 'pointer', transition: 'transform 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <div style={{ fontSize: '2.5rem' }} className="mb-2">{cat.icon}</div>
                            <div className="fw-bold text-dark">{cat.name}</div>
                        </div>
                    ))}
                </div>

                {/* Featured */}
                {featured.length > 0 && (
                    <>
                        <h4 className="fw-bold mt-5 pt-4 mb-4" style={{ color: '#883311' }}>Featured Books</h4>
                        <div className="row g-4 justify-content-center">
                            {featured.map(book => (
                                <div key={book._id} className="col-6 col-md-3">
                                    <div className="card h-100 shadow-sm border-0" style={{ cursor: 'pointer', backgroundColor: '#FDFBF7' }} onClick={() => navigate(`/user/item/${book.slug || book._id}`)}>
                                        <img src={book.coverImage} alt={book.title} className="card-img-top" style={{ height: '220px', objectFit: 'cover' }} />
                                        <div className="card-body p-3">
                                            <h6 className="fw-bold text-truncate">{book.title}</h6>
                                            <p className="small text-muted mb-1">{book.author?.name}</p>
                                            <p className="fw-bold" style={{ color: '#8B4513' }}>₹{book.finalPrice || book.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Uhome;
