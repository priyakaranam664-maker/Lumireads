import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar, FiEye, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookCard = ({ book }) => {
    const { isAuthenticated, user, updateUser } = useAuth();
    const { cart, addToCart } = useCart();
    const navigate = useNavigate();
    const [quickViewOpen, setQuickViewOpen] = useState(false);

    const isInWishlist = user?.wishlist?.some((w) => (w._id || w) === book._id);
    const isAlreadyInCart = cart?.items?.some((item) => (item.book?._id || item.book) === book._id);

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        try {
            const { data } = await userAPI.toggleWishlist(book._id);
            updateUser({ wishlist: data.data });
            toast.success(data.message);
        } catch {
            toast.error('Wishlist action failed');
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        addToCart(book._id);
    };

    const handleQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setQuickViewOpen(true);
    };

    const handleCloseQuickView = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setQuickViewOpen(false);
    };

    const handleViewDetails = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/books/${book.slug || book._id}`);
    };

    const renderStars = (rating) => {
        const stars = [];
        const value = Math.round(rating || 0);
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <FiStar
                    key={i}
                    size={12}
                    className={i <= value ? 'star-filled' : 'star-empty'}
                    fill={i <= value ? '#FBBF24' : 'none'}
                />
            );
        }
        return stars;
    };

    return (
        <>
            <Link to={`/books/${book.slug || book._id}`} style={{ textDecoration: 'none' }}>
                <div className="book-card">
                    <div className="book-card-img-wrapper">
                        <img src={book.coverImage} alt={book.title} loading="lazy" />
                        {book.discountPercent > 0 && <span className="book-card-badge badge-sale">{book.discountPercent}% OFF</span>}
                        {book.isNewArrival && !book.discountPercent && <span className="book-card-badge badge-new">New</span>}
                        {book.isTrending && !book.discountPercent && !book.isNewArrival && <span className="book-card-badge badge-trending">Trending</span>}
                        {book.isBestSeller && !book.discountPercent && !book.isNewArrival && !book.isTrending && <span className="book-card-badge badge-bestseller">Best Seller</span>}
                        <div className="book-card-actions">
                            <button className={`book-card-action-btn ${isInWishlist ? 'active' : ''}`} onClick={handleWishlist} title="Wishlist">
                                <FiHeart size={16} />
                            </button>
                            <button className="book-card-action-btn" onClick={handleQuickView} title="Quick view">
                                <FiEye size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="book-card-body">
                        <div className="book-card-category">{book.category?.name || 'Uncategorized'}</div>
                        <h3 className="book-card-title">{book.title}</h3>
                        <p className="book-card-author">by {book.author?.name || 'Unknown'}</p>
                        <div className="book-card-rating">
                            {renderStars(book.averageRating)}
                            <span className="review-count">({book.totalReviews || 0})</span>
                        </div>
                        <div className="book-card-price">
                            <span className="price-current">₹{book.finalPrice || book.price}</span>
                            {book.discountPercent > 0 && (
                                <>
                                    <span className="price-original">₹{book.price}</span>
                                    <span className="price-discount">{book.discountPercent}% off</span>
                                </>
                            )}
                        </div>
                        <div className="book-card-buy-buttons d-flex gap-2 mt-3 w-100" style={{ pointerEvents: 'auto' }}>
                            {isAlreadyInCart ? (
                                <button
                                    className="book-card-add-cart flex-grow-1 text-center"
                                    style={{ background: 'var(--success)', borderColor: 'var(--success)', color: 'white', padding: '0.55rem 0.75rem', fontSize: '0.88rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        navigate('/cart');
                                    }}
                                >
                                    <FiShoppingCart size={14} style={{ marginRight: '6px' }} /> View Cart
                                </button>
                            ) : (
                                <button
                                    className="book-card-add-cart flex-grow-1"
                                    onClick={handleAddToCart}
                                    style={{ padding: '0.55rem 0.75rem', fontSize: '0.88rem', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <FiShoppingCart size={14} style={{ marginRight: '6px' }} /> Add to Cart
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            {quickViewOpen && (
                <div className="quickview-modal-backdrop" onClick={handleCloseQuickView}>
                    <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="quickview-close-btn" onClick={handleCloseQuickView} aria-label="Close quick view">
                            <FiX size={18} />
                        </button>
                        <div className="quickview-grid">
                            <div className="quickview-image">
                                <img src={book.coverImage} alt={book.title} loading="lazy" />
                            </div>
                            <div className="quickview-content">
                                <span className="book-card-category">{book.category?.name || 'Uncategorized'}</span>
                                <h3 className="quickview-title">{book.title}</h3>
                                <p className="quickview-author">by {book.author?.name || 'Unknown'}</p>
                                <div className="book-card-rating">{renderStars(book.averageRating)}<span className="review-count">({book.totalReviews || 0})</span></div>
                                <p className="quickview-description">{book.description?.slice(0, 220) || 'A compelling read that keeps you turning pages through every chapter.'}</p>
                                <div className="book-card-price quickview-price">
                                    <span className="price-current">₹{book.finalPrice || book.price}</span>
                                    {book.discountPercent > 0 && (
                                        <>
                                            <span className="price-original">₹{book.price}</span>
                                            <span className="price-discount">{book.discountPercent}% off</span>
                                        </>
                                    )}
                                </div>
                                <div className="quickview-actions">
                                    <button className="btn-primary-custom" onClick={handleAddToCart}>
                                        <FiShoppingCart size={16} style={{ marginRight: '8px' }} /> Add to Cart
                                    </button>
                                    <button className="btn-secondary-custom" onClick={handleViewDetails}>
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BookCard;
