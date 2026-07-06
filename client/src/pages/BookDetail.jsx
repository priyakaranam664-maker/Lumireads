import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Tab, Tabs } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiStar, FiShare2, FiMinus, FiPlus, FiCheck, FiBook, FiGlobe, FiLayers, FiArrowLeft } from 'react-icons/fi';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { bookAPI, reviewAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookDetail = () => {
    const { identifier } = useParams();
    const { isAuthenticated, user, updateUser } = useAuth();
    const { cart, addToCart } = useCart();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [relatedBooks, setRelatedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);

    useEffect(() => {
        const fetchBook = async () => {
            setLoading(true);
            try {
                const { data } = await bookAPI.getBook(identifier);
                const bookData = data.data.book || data.data;
                setBook(bookData);
                setSelectedImage(0);
                // Use relatedBooks from the API response if available
                if (data.data.relatedBooks) {
                    setRelatedBooks(data.data.relatedBooks.filter((b) => b._id !== bookData._id));
                }
                // Fetch reviews
                const revRes = await reviewAPI.getBookReviews(bookData._id, { limit: 10 });
                setReviews(revRes.data.data);
            } catch { toast.error('Book not found'); }
            finally { setLoading(false); }
        };
        fetchBook();
        window.scrollTo(0, 0);
    }, [identifier]);

    const isInWishlist = user?.wishlist?.some((w) => (w._id || w) === book?._id);
    const isAlreadyInCart = cart?.items?.some((item) => (item.book?._id || item.book) === book?._id);

    const handleWishlist = async () => {
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        try {
            const { data } = await userAPI.toggleWishlist(book._id);
            updateUser({ wishlist: data.data });
            toast.success(data.message);
        } catch { }
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        addToCart(book._id, qty);
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        try {
            if (!isAlreadyInCart) {
                await addToCart(book._id, qty);
            }
            navigate('/checkout');
        } catch {
            toast.error('Buy Now failed');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        setSubmitting(true);
        try {
            const { data } = await reviewAPI.create(book._id, { rating: reviewRating, comment: reviewText });
            setReviews((prev) => [data.data, ...prev]);
            setReviewText(''); setReviewRating(5);
            toast.success('Review submitted!');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit review'); }
        finally { setSubmitting(false); }
    };

    const renderStars = (rating, size = 16) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FiStar key={i} size={size} className={i < Math.round(rating) ? 'star-filled' : 'star-empty'}
                fill={i < Math.round(rating) ? '#FBBF24' : 'none'} />
        ));
    };

    if (loading) return <LoadingSpinner />;
    if (!book) return <div className="empty-state"><h3>Book not found</h3></div>;

    const allImages = [book.coverImage, ...(book.galleryImages || [])];

    return (
        <>
            <Helmet><title>{`${book.title} - BookStore`}</title></Helmet>
            <div className="page-header">
                <Container>
                    <div className="breadcrumb-custom">
                        <Link to="/">Home</Link><span>/</span><Link to="/books">Books</Link><span>/</span>
                        <span style={{ color: 'white' }}>{book.title}</span>
                    </div>
                </Container>
            </div>

            <Container className="py-4">
                <div className="mb-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn-back-link"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontWeight: 650,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer',
                            padding: 0,
                            fontSize: '0.9rem',
                            transition: 'color 0.2s ease'
                        }}
                    >
                        <FiArrowLeft size={16} /> Back to Catalog
                    </button>
                </div>
                <Row className="g-4">
                    {/* Images */}
                    <Col lg={5}>
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="book-detail-img mb-3">
                                <img src={allImages[selectedImage]} alt={book.title} style={{ width: '100%', borderRadius: 'var(--radius-lg)' }} />
                            </div>
                            {allImages.length > 1 && (
                                <div className="d-flex gap-2">
                                    {allImages.map((img, i) => (
                                        <img key={i} src={img} alt="" onClick={() => setSelectedImage(i)}
                                            style={{
                                                width: 60, height: 80, objectFit: 'cover', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                border: i === selectedImage ? '2px solid var(--primary)' : '2px solid var(--border-color)', opacity: i === selectedImage ? 1 : 0.6
                                            }} />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </Col>

                    {/* Info */}
                    <Col lg={7}>
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            {book.category && <span className="tag mb-2">{book.category.name}</span>}
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{book.title}</h1>
                            {book.subtitle && <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>{book.subtitle}</p>}

                            <div className="d-flex align-items-center gap-3 mb-3">
                                <Link to={`/authors/${book.author?.slug || book.author?._id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                    by {book.author?.name}
                                </Link>
                                <div className="d-flex align-items-center gap-1">
                                    {renderStars(book.averageRating)}
                                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '0.3rem' }}>
                                        {book.averageRating?.toFixed(1)} ({book.totalReviews} reviews)
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div style={{ background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
                                <div className="d-flex align-items-baseline gap-3">
                                    <span style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>₹{book.finalPrice}</span>
                                    {book.discountPercent > 0 && (
                                        <>
                                            <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>₹{book.price}</span>
                                            <span style={{ background: 'var(--success)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700 }}>
                                                {book.discountPercent}% OFF
                                            </span>
                                        </>
                                    )}
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 0, marginTop: '0.3rem' }}>Inclusive of all taxes</p>
                            </div>

                            {/* Details Grid */}
                            <Row className="g-3 mb-4">
                                {[
                                    { icon: FiBook, label: 'Format', value: book.format || 'Paperback' },
                                    { icon: FiLayers, label: 'Pages', value: book.pages },
                                    { icon: FiGlobe, label: 'Language', value: book.language },
                                    { icon: FiBook, label: 'ISBN', value: book.isbn },
                                ].map(({ icon: Icon, label, value }, i) => value && (
                                    <Col xs={6} md={3} key={i}>
                                        <div style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                                            <Icon size={18} style={{ color: 'var(--primary)', marginBottom: '0.25rem' }} />
                                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>

                            {/* Quantity & Actions */}
                            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                                <div className="d-flex align-items-center gap-2">
                                    <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus size={14} /></button>
                                    <span style={{ fontWeight: 700, fontSize: '1rem', width: 30, textAlign: 'center' }}>{qty}</span>
                                    <button className="qty-btn" onClick={() => setQty(Math.min(book.stockQuantity, qty + 1))}><FiPlus size={14} /></button>
                                </div>

                                {isAlreadyInCart ? (
                                    <button className="btn-primary-custom flex-grow-1" onClick={() => navigate('/cart')}
                                        style={{ padding: '0.7rem', justifyContent: 'center', background: 'var(--success)', borderColor: 'var(--success)' }}>
                                        <FiShoppingCart /> View Cart
                                    </button>
                                ) : (
                                    <button className="btn-primary-custom flex-grow-1" onClick={handleAddToCart}
                                        disabled={book.stockQuantity === 0} style={{ padding: '0.7rem', justifyContent: 'center' }}>
                                        <FiShoppingCart /> {book.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                )}

                                {book.stockQuantity > 0 && (
                                    <button className="btn-primary-custom flex-grow-1" onClick={handleBuyNow}
                                        style={{ padding: '0.7rem', justifyContent: 'center', background: 'var(--primary)', borderColor: 'var(--primary)' }}>
                                        Buy Now
                                    </button>
                                )}

                                <button className={`btn-icon ${isInWishlist ? 'active' : ''}`} onClick={handleWishlist}
                                    style={{ width: 44, height: 44 }}>
                                    <FiHeart size={18} fill={isInWishlist ? 'currentColor' : 'none'} />
                                </button>

                                <button className="btn-icon" style={{ width: 44, height: 44 }}
                                    onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
                                    <FiShare2 size={18} />
                                </button>
                            </div>

                            {book.stockQuantity > 0 && book.stockQuantity <= 10 && (
                                <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600 }}>⚠️ Only {book.stockQuantity} left in stock</p>
                            )}
                            {book.stockQuantity > 0 && (
                                <div className="d-flex align-items-center gap-2" style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
                                    <FiCheck /> In Stock - Ships within 2-3 business days
                                </div>
                            )}
                        </motion.div>
                    </Col>
                </Row>

                {/* Tabs */}
                <div className="mt-5" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem' }}>
                    <Tabs defaultActiveKey="description" className="mb-4">
                        <Tab eventKey="description" title="Description">
                            <p style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>{book.description}</p>
                            {book.publisher && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}><strong>Publisher:</strong> {book.publisher.name}</p>}
                            {book.edition && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}><strong>Edition:</strong> {book.edition}</p>}
                            {book.tags?.length > 0 && (
                                <div className="d-flex gap-2 flex-wrap mt-3">
                                    {book.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
                                </div>
                            )}
                        </Tab>

                        <Tab eventKey="reviews" title={`Reviews (${book.totalReviews || 0})`}>
                            {/* Review Form */}
                            {isAuthenticated && (
                                <form onSubmit={handleReviewSubmit} style={{ marginBottom: '2rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                    <h6 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Write a Review</h6>
                                    <div className="d-flex gap-1 mb-2">
                                        {[1, 2, 3, 4, 5].map((r) => (
                                            <FiStar key={r} size={22} className={r <= reviewRating ? 'star-filled' : ''} fill={r <= reviewRating ? '#FBBF24' : 'none'}
                                                style={{ cursor: 'pointer' }} onClick={() => setReviewRating(r)} />
                                        ))}
                                    </div>
                                    <textarea className="form-input mb-2" rows={3} placeholder="Share your thoughts..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
                                    <button type="submit" className="btn-primary-custom" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Review'}</button>
                                </form>
                            )}

                            {reviews.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to review!</p> : (
                                reviews.map((rev) => (
                                    <div key={rev._id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <div>
                                                <strong style={{ fontSize: '0.9rem' }}>{rev.user?.fullName}</strong>
                                                <div className="d-flex gap-0.5">{renderStars(rev.rating, 13)}</div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(rev.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 0 }}>{rev.comment}</p>
                                    </div>
                                ))
                            )}
                        </Tab>
                    </Tabs>
                </div>

                {/* Related Books */}
                {relatedBooks.length > 0 && (
                    <section className="mt-5">
                        <h2 className="section-title">You Might Also Like</h2>
                        <p className="section-subtitle">Similar books in this category</p>
                        <Row className="g-3">
                            {relatedBooks.slice(0, 4).map((b) => (
                                <Col xs={6} md={3} key={b._id}><BookCard book={b} /></Col>
                            ))}
                        </Row>
                    </section>
                )}
            </Container>
        </>
    );
};

export default BookDetail;
