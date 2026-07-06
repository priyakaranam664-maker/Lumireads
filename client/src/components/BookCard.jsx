import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

const BookCard = ({ book }) => {
    const { isAuthenticated, user, updateUser } = useAuth();
    const { cart, addToCart } = useCart();
    const navigate = useNavigate();

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
        } catch { }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        addToCart(book._id);
    };

    const handleBuyNow = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        try {
            if (!isAlreadyInCart) {
                await addToCart(book._id, 1);
            }
            navigate('/checkout');
        } catch {
            toast.error('Buy Now failed');
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(<FiStar key={i} size={12} className={i <= Math.round(rating) ? 'star-filled' : 'star-empty'}
                fill={i <= Math.round(rating) ? '#FBBF24' : 'none'} />);
        }
        return stars;
    };

    return (
        <Link to={`/books/${book.slug || book._id}`} style={{ textDecoration: 'none' }}>
            <div className="book-card">
                <div className="book-card-img-wrapper">
                    <img src={book.coverImage} alt={book.title} loading="lazy" />
                    {book.discountPercent > 0 && <span className="book-card-badge badge-sale">{book.discountPercent}% OFF</span>}
                    {book.isNewArrival && !book.discountPercent && <span className="book-card-badge badge-new">New</span>}
                    {book.isTrending && !book.discountPercent && !book.isNewArrival && <span className="book-card-badge badge-trending">Trending</span>}
                    {book.isBestSeller && !book.discountPercent && !book.isNewArrival && !book.isTrending && <span className="book-card-badge badge-bestseller">Best Seller</span>}
                    <div className="book-card-actions">
                        <button className={`btn-icon ${isInWishlist ? 'active' : ''}`} onClick={handleWishlist} title="Wishlist">
                            <FiHeart size={14} fill={isInWishlist ? 'currentColor' : 'none'} />
                        </button>
                        <button className="btn-icon" onClick={handleAddToCart} title="Add to cart">
                            <FiShoppingCart size={14} />
                        </button>
                    </div>
                </div>
                <div className="book-card-body">
                    <div className="book-card-category">{book.category?.name || 'Uncategorized'}</div>
                    <h3 className="book-card-title">{book.title}</h3>
                    <p className="book-card-author">by {book.author?.name || 'Unknown'}</p>
                    <div className="book-card-rating">
                        {renderStars(book.averageRating)}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                            ({book.totalReviews || 0})
                        </span>
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
                                style={{ background: 'var(--success)', borderColor: 'var(--success)', color: 'white', padding: '0.4rem 0.5rem', fontSize: '0.82rem', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    navigate('/cart');
                                }}
                            >
                                <FiShoppingCart size={13} style={{ marginRight: '4px' }} /> View Cart
                            </button>
                        ) : (
                            <button
                                className="book-card-add-cart flex-grow-1"
                                onClick={handleAddToCart}
                                style={{ padding: '0.4rem 0.5rem', fontSize: '0.82rem', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <FiShoppingCart size={13} style={{ marginRight: '4px' }} /> Add to Cart
                            </button>
                        )}
                        <button
                            className="book-card-add-cart flex-grow-1"
                            style={{ background: 'var(--primary)', borderColor: 'var(--primary)', color: 'white', padding: '0.4rem 0.5rem', fontSize: '0.82rem', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={handleBuyNow}
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BookCard;
