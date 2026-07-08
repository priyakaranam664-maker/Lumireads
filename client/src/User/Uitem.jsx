import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Uitem = () => {
    const { identifier } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

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
            navigate('/cart');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to checkout');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/bookverse');
    };

    if (loading) return <div className="text-center py-5" style={{ backgroundColor: '#F4ECE1', minHeight: '100vh' }}>Loading...</div>;
    if (!book) return <div className="text-center py-5" style={{ backgroundColor: '#F4ECE1', minHeight: '100vh' }}>Book not found.</div>;

    return (
        <div style={{ backgroundColor: '#F4ECE1', minHeight: '100vh', fontFamily: 'Outfit, sans-serif', pb: '50px' }}>
            {/* Header */}
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

            <div className="container py-5 text-center">
                {/* Large book cover centered */}
                <div className="d-flex justify-content-center mb-4">
                    <img
                        src={book.coverImage}
                        alt={book.title}
                        className="shadow"
                        style={{ height: '350px', width: '240px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                </div>

                {/* Two Columns Grid Below */}
                <div className="row g-4 justify-content-center text-start mx-auto" style={{ maxWidth: '800px' }}>

                    {/* Left Panel: Description */}
                    <div className="col-12 col-md-6">
                        <div className="card p-3 h-100 border-0 shadow-sm" style={{ backgroundColor: '#FDFBF7' }}>
                            <h6 className="fw-bold border-bottom pb-2">Description</h6>
                            <p className="small text-muted" style={{ lineHeight: '1.6' }}>
                                {book.description || 'A practical guide to building good habits and breaking bad ones, backed by scientific research.'}
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Info */}
                    <div className="col-12 col-md-6">
                        <div className="card p-3 h-100 border-0 shadow-sm" style={{ backgroundColor: '#FDFBF7' }}>
                            <h6 className="fw-bold border-bottom pb-2">Info</h6>
                            <div className="small">
                                <div className="mb-2"><strong>Title:</strong> {book.title}</div>
                                <div className="mb-2"><strong>Author:</strong> {book.author?.name || 'Unknown'}</div>
                                <div className="mb-2"><strong>Genre:</strong> {book.category?.name || 'Self-Help / Psychology'}</div>
                                <div className="mb-2"><strong>Price:</strong> ₹{book.finalPrice || book.price}</div>
                                <div><strong>Seller:</strong> {book.seller?.fullName || 'Pravanshu'}</div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* But Now Button Centered */}
                <div className="mt-4">
                    <button
                        className="btn btn-sm px-5 py-2 text-white fw-bold"
                        style={{ backgroundColor: '#8B4513', border: 'none', borderRadius: '4px' }}
                        onClick={handleAddToCart}
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Uitem;
