import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Products = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

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

    useEffect(() => {
        fetchBooks();
    }, [searchParams]);

    const handleAddToWishlist = async (bookId) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please login first');
                return navigate('/user/login');
            }
            await axios.post('/api/wishlist', { bookId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Added to Wishlist!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to wishlist');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    return (
        <div style={{ backgroundColor: '#F4ECE1', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
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

            <div className="container py-5">
                <h3 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Books List</h3>
                {loading ? (
                    <p className="text-center text-muted">Loading books...</p>
                ) : books.length === 0 ? (
                    <p className="text-center text-muted py-4">No books found.</p>
                ) : (
                    <div className="row g-4 justify-content-center">
                        {books.map((book) => (
                            <div key={book._id} className="col-12 col-sm-6 col-md-3">
                                <div
                                    className="card h-100 shadow-sm border-0 p-3"
                                    style={{ backgroundColor: '#FDFBF7', borderRadius: '4px' }}
                                >
                                    <img
                                        src={book.coverImage}
                                        alt={book.title}
                                        className="card-img-top rounded mb-3"
                                        style={{ height: '260px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body p-0 text-center text-sm-start">
                                        <h6 className="fw-bold mb-1 text-truncate">{book.title}</h6>
                                        <p className="text-muted small mb-1">Author: {book.author?.name || 'Unknown'}</p>
                                        <p className="text-muted small mb-2">Genre: {book.category?.name || 'N/A'}</p>
                                        <p className="fw-bold fs-6 mb-3" style={{ color: '#8B4513' }}>₹{book.finalPrice || book.price}</p>

                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm w-50 py-2 border text-muted fw-semibold"
                                                style={{ backgroundColor: '#FFFFFF' }}
                                                onClick={() => handleAddToWishlist(book._id)}
                                            >
                                                Wishlist
                                            </button>
                                            <button
                                                className="btn btn-sm w-50 py-2 text-white fw-bold"
                                                style={{ backgroundColor: '#8B4513' }}
                                                onClick={() => navigate(`/user/item/${book.slug || book._id}`)}
                                            >
                                                View
                                            </button>
                                        </div>
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
