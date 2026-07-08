import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
    const navigate = useNavigate();

    const categories = [
        { name: 'Fiction', icon: '📖' },
        { name: 'Science', icon: '🔬' },
        { name: 'Biographies', icon: '👤' },
        { name: "Children's Books", icon: '👶' },
    ];

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            {/* Header / Navbar */}
            <nav className="navbar navbar-expand-lg py-3 shadow-sm px-4" style={{ backgroundColor: '#5D2E17' }}>
                <span className="navbar-brand text-white fw-bold d-flex align-items-center" style={{ fontSize: '1.6rem', cursor: 'pointer' }} onClick={() => navigate('/bookverse')}>
                    📚 BookVerse
                </span>
                <div className="ms-auto d-flex gap-2">
                    <button
                        onClick={() => navigate('/user/login')}
                        className="btn px-4 fw-bold"
                        style={{ backgroundColor: '#D9534F', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        User
                    </button>
                    <button
                        onClick={() => navigate('/seller/login')}
                        className="btn px-4 fw-bold"
                        style={{ backgroundColor: '#5CB85C', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Seller
                    </button>
                    <button
                        onClick={() => navigate('/admin/login')}
                        className="btn px-4 fw-bold"
                        style={{ backgroundColor: '#D9534F', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        Admin
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="container text-center py-5">
                <h1 className="fw-extrabold mt-5" style={{ color: '#883311', fontSize: '3rem', fontWeight: '800' }}>
                    Your Gateway to Infinite Stories
                </h1>
                <p className="mx-auto mt-3 text-muted" style={{ maxWidth: '700px', fontSize: '1.1rem' }}>
                    Discover captivating books, connect with passionate sellers, and fuel your love for reading — only at <strong>BookVerse</strong>.
                </p>

                <button
                    onClick={() => navigate('/user/products')}
                    className="btn btn-lg px-4 mt-4 text-white fw-bold shadow-sm"
                    style={{ backgroundColor: '#A0522D', border: 'none', borderRadius: '4px' }}
                >
                    Start Exploring
                </button>

                {/* Categories */}
                <h3 className="fw-bold mt-5 pt-5 mb-4" style={{ color: '#883311' }}>Explore by Category</h3>
                <div className="row justify-content-center gap-3 px-3">
                    {categories.map((cat, idx) => (
                        <div
                            key={idx}
                            onClick={() => navigate(`/user/products?category=${cat.name}`)}
                            className="col-12 col-sm-5 col-md-2 p-4 text-center rounded shadow-sm border"
                            style={{
                                backgroundColor: '#EADBC8',
                                cursor: 'pointer',
                                border: '1px solid #dac4b0',
                                transition: 'transform 0.2s',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1.0)'; }}
                        >
                            <div style={{ fontSize: '2.5rem' }} className="mb-2">{cat.icon}</div>
                            <div className="fw-bold text-dark">{cat.name}</div>
                        </div>
                    ))}
                </div>

                {/* Contact Us Footer Link Button */}
                <div className="mt-5 pt-5">
                    <button
                        onClick={() => navigate('/contact')}
                        className="btn btn-sm px-4 py-2 text-white"
                        style={{ backgroundColor: '#5D2E17', border: 'none', borderRadius: '4px' }}
                    >
                        Contact Us
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;
