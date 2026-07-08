import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const Products = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const params = {};
                const cat = searchParams.get('category');
                if (cat) params.search = cat;
                const res = await axios.get('/api/books', { params });
                setBooks(res.data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooks();
    }, [searchParams]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#5D2E17' }}>
                <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem' }}>📚 BookVerse</span>
                <div className="ms-auto d-flex align-items-center gap-3">
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/home')}>Home</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/products')}>Products</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/orders')}>My Orders</span>
                    <button onClick={handleLogout} className="btn btn-sm btn-outline-light ms-2 px-3 fw-bold">Logout</button>
                </div>
            </nav>

            <div className="container py-5">
                <h3 className="text-center fw-bold mb-5" style={{ color: '#5D2E17' }}>Browse Books</h3>
                {loading ? (
                    <p className="text-center text-muted">Loading books...</p>
                ) : books.length === 0 ? (
                    <p className="text-center text-muted py-4">No books found.</p>
                ) : (
                    <div className="row g-4">
                        {books.map((book) => (
                            <div key={book._id} className="col-6 col-sm-4 col-md-3">
                                <div
                                    className="card h-100 shadow-sm border-0"
                                    style={{ cursor: 'pointer', backgroundColor: '#FDFBF7' }}
                                    onClick={() => navigate(`/user/item/${book.slug || book._id}`)}
                                >
                                    <img src={book.coverImage} alt={book.title} className="card-img-top" style={{ height: '250px', objectFit: 'cover' }} />
                                    <div className="card-body">
                                        <h6 className="fw-bold text-truncate">{book.title}</h6>
                                        <p className="text-muted small mb-1">{book.author?.name || 'Unknown'}</p>
                                        {book.discountPercent > 0 && (
                                            <span className="badge bg-danger me-2">{book.discountPercent}% OFF</span>
                                        )}
                                        <p className="fw-bold mt-1" style={{ color: '#8B4513' }}>₹{book.finalPrice || book.price}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
