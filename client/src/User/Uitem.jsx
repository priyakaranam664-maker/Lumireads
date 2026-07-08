import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Uitem = () => {
    const { identifier } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/books/${identifier}`).then(res => {
            setBook(res.data.data?.book || res.data.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [identifier]);

    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                toast.error('Please login first');
                return navigate('/user/login');
            }
            await axios.post('/api/cart/items', { bookId: book._id, quantity: 1 }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Added to cart!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    if (loading) return <div className="text-center py-5 text-muted" style={{ backgroundColor: '#F9F6F0', minHeight: '100vh' }}>Loading...</div>;
    if (!book) return <div className="text-center py-5 text-muted" style={{ backgroundColor: '#F9F6F0', minHeight: '100vh' }}>Book not found.</div>;

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <nav className="navbar navbar-expand-lg px-4 py-3" style={{ backgroundColor: '#5D2E17' }}>
                <span className="navbar-brand text-white fw-bold" style={{ fontSize: '1.4rem' }}>📚 BookVerse</span>
                <div className="ms-auto d-flex align-items-center gap-3">
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/home')}>Home</span>
                    <span className="text-white fw-semibold" style={{ cursor: 'pointer' }} onClick={() => navigate('/user/products')}>Products</span>
                </div>
            </nav>

            <div className="container py-5">
                <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>← Back</button>
                <div className="row g-5">
                    <div className="col-md-5">
                        <img src={book.coverImage} alt={book.title} className="w-100 rounded shadow" style={{ maxHeight: '500px', objectFit: 'cover' }} />
                    </div>
                    <div className="col-md-7">
                        <h2 className="fw-bold" style={{ color: '#5D2E17' }}>{book.title}</h2>
                        <p className="text-muted">Author: <strong>{book.author?.name || 'Unknown'}</strong></p>
                        <p className="text-muted">Category: <strong>{book.category?.name || 'N/A'}</strong></p>

                        <div className="d-flex align-items-center gap-3 mt-3">
                            {book.discountPercent > 0 && (
                                <span className="text-muted text-decoration-line-through fs-5">₹{book.price}</span>
                            )}
                            <span className="fw-bold fs-3" style={{ color: '#D9534F' }}>₹{book.finalPrice || book.price}</span>
                            {book.discountPercent > 0 && (
                                <span className="badge bg-success fs-6">{book.discountPercent}% OFF</span>
                            )}
                        </div>

                        <p className="mt-4 text-dark">{book.description}</p>

                        <div className="mt-3 d-flex gap-2">
                            <span className="badge bg-secondary">Stock: {book.stockQuantity}</span>
                            <span className="badge bg-info">Rating: {book.averageRating}/5</span>
                            <span className="badge bg-warning text-dark">{book.format}</span>
                        </div>

                        <div className="mt-4 d-flex gap-3">
                            <button className="btn btn-lg text-white fw-bold px-4" style={{ backgroundColor: '#8B4513', border: 'none' }} onClick={handleAddToCart}>
                                🛒 Add to Cart
                            </button>
                            <button className="btn btn-lg text-white fw-bold px-4" style={{ backgroundColor: '#D9534F', border: 'none' }} onClick={() => {
                                handleAddToCart();
                                navigate('/cart');
                            }}>
                                ⚡ Buy Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Uitem;
