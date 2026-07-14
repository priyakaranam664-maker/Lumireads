import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useInView } from 'framer-motion';
import {
  FiShoppingCart, FiHeart, FiStar, FiShare2, FiMinus, FiPlus,
  FiCheck, FiBook, FiGlobe, FiLayers, FiArrowLeft, FiTruck,
  FiRefreshCw, FiShield, FiChevronLeft, FiChevronRight, FiUser
} from 'react-icons/fi';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { bookAPI, reviewAPI, userAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/book-detail-premium.css';

/* ─── Stars renderer ────────────────────────────────────── */
const Stars = ({ rating, size = 15 }) =>
  Array.from({ length: 5 }, (_, i) => (
    <FiStar
      key={i}
      size={size}
      fill={i < Math.round(rating) ? '#FBBF24' : 'none'}
      style={{ color: i < Math.round(rating) ? '#FBBF24' : 'var(--text-muted)' }}
    />
  ));

/* ─── Horizontal related rail ───────────────────────────── */
const RelatedRail = ({ books }) => {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d * 270, behavior: 'smooth' });
  if (!books?.length) return null;
  return (
    <div className="bd-rail-wrapper">
      <button className="bd-rail-arrow bd-rail-arrow-left" onClick={() => scroll(-1)} aria-label="Scroll left">
        <FiChevronLeft size={18} />
      </button>
      <div className="bd-rail" ref={ref}>
        {books.map((b) => (
          <div className="bd-rail-item" key={b._id}>
            <BookCard book={b} />
          </div>
        ))}
      </div>
      <button className="bd-rail-arrow bd-rail-arrow-right" onClick={() => scroll(1)} aria-label="Scroll right">
        <FiChevronRight size={18} />
      </button>
    </div>
  );
};

/* ─── Review rating bar ─────────────────────────────────── */
const RatingBar = ({ label, count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="bd-rating-bar-row">
      <span className="bd-rating-bar-lbl">{label}★</span>
      <div className="bd-rating-bar-track">
        <div className="bd-rating-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="bd-rating-bar-pct">{pct}%</span>
    </div>
  );
};

/* ─── FadeIn wrapper ────────────────────────────────────── */
const FadeIn = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════
   BOOK DETAIL COMPONENT
═══════════════════════════════════════════════════════════ */
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      try {
        const { data } = await bookAPI.getBook(identifier);
        const bookData = data.data.book || data.data;
        setBook(bookData);
        setSelectedImage(0);
        if (data.data.relatedBooks) {
          setRelatedBooks(data.data.relatedBooks.filter((b) => b._id !== bookData._id));
        }
        const revRes = await reviewAPI.getBookReviews(bookData._id, { limit: 20 });
        setReviews(revRes.data.data || []);
      } catch {
        toast.error('Book not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
    window.scrollTo(0, 0);
  }, [identifier]);

  const isInWishlist = user?.wishlist?.some((w) => (w._id || w) === book?._id);
  const isAlreadyInCart = cart?.items?.some((item) => (item.book?._id || item.book) === book?._id);

  const handleWishlist = useCallback(async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      const { data } = await userAPI.toggleWishlist(book._id);
      updateUser({ wishlist: data.data });
      toast.success(data.message);
    } catch { toast.error('Wishlist action failed'); }
  }, [isAuthenticated, book, updateUser]);

  const handleAddToCart = useCallback(() => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    addToCart(book._id, qty);
  }, [isAuthenticated, book, qty, addToCart]);

  const handleBuyNow = useCallback(async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    try {
      if (!isAlreadyInCart) await addToCart(book._id, qty);
      navigate('/checkout');
    } catch { toast.error('Buy Now failed'); }
  }, [isAuthenticated, book, qty, isAlreadyInCart, addToCart, navigate]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    setSubmitting(true);
    try {
      const { data } = await reviewAPI.create(book._id, { rating: reviewRating, comment: reviewText });
      setReviews((prev) => [data.data, ...prev]);
      setReviewText(''); setReviewRating(5);
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner />;
  if (!book) return <div className="bd-not-found"><h3>Book not found</h3></div>;

  const allImages = [book.coverImage, ...(book.galleryImages || [])].filter(Boolean);

  // Rating distribution (fake split based on averageRating for visual)
  const total = book.totalReviews || 0;
  const avg = book.averageRating || 0;
  const ratingDist = [5, 4, 3, 2, 1].map((star) => {
    const weight = Math.max(0, 1 - Math.abs(star - avg) * 0.4);
    const count = Math.round(weight * total * 0.4);
    return { star, count };
  });

  return (
    <>
      <Helmet>
        <title>{`${book.title} — LumiReads`}</title>
        <meta name="description" content={book.description?.slice(0, 155)} />
      </Helmet>

      {/* ══════════════ HERO BACKDROP ══════════════ */}
      <div className="bd-hero-backdrop">
        <div
          className="bd-hero-bg-blur"
          style={{ backgroundImage: `url(${book.coverImage})` }}
        />
        <div className="bd-hero-overlay" />
        <div className="bd-hero-content">
          <button className="bd-back-btn" onClick={() => navigate(-1)}>
            <FiArrowLeft size={16} /> Back to Catalog
          </button>
          {book.category && (
            <span className="bd-hero-category">{book.category.name}</span>
          )}
          <h1 className="bd-hero-title">{book.title}</h1>
          {book.subtitle && <p className="bd-hero-subtitle">{book.subtitle}</p>}
          <div className="bd-hero-meta">
            <Link to={`/authors/${book.author?.slug || book.author?._id}`} className="bd-hero-author">
              by {book.author?.name}
            </Link>
            <div className="bd-hero-rating">
              <Stars rating={avg} size={14} />
              <span>{avg?.toFixed(1)} ({total} reviews)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════ MAIN CONTENT ══════════════ */}
      <div className="bd-main">
        <div className="bd-container">
          <div className="bd-layout">

            {/* ─── Left: Image gallery + book info ─── */}
            <div className="bd-left">
              {/* Gallery */}
              <motion.div
                className="bd-gallery"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bd-main-img">
                  <img src={allImages[selectedImage]} alt={book.title} />
                  {book.discountPercent > 0 && (
                    <span className="bd-img-badge">{book.discountPercent}% OFF</span>
                  )}
                </div>
                {allImages.length > 1 && (
                  <div className="bd-thumb-strip">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        className={`bd-thumb ${i === selectedImage ? 'active' : ''}`}
                        onClick={() => setSelectedImage(i)}
                      >
                        <img src={img} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Book details grid */}
              <FadeIn delay={0.05}>
                <div className="bd-details-grid">
                  {[
                    { icon: FiBook, label: 'Format', value: book.format || 'Paperback' },
                    { icon: FiLayers, label: 'Pages', value: book.pages },
                    { icon: FiGlobe, label: 'Language', value: book.language },
                    { icon: FiBook, label: 'ISBN', value: book.isbn },
                  ].filter(d => d.value).map(({ icon: Icon, label, value }) => (
                    <div className="bd-detail-item" key={label}>
                      <Icon size={16} className="bd-detail-icon" />
                      <div className="bd-detail-lbl">{label}</div>
                      <div className="bd-detail-val">{value}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>

              {/* Guarantees */}
              <FadeIn delay={0.1}>
                <div className="bd-guarantees">
                  {[
                    { icon: FiTruck, text: 'Free shipping on orders ₹499+' },
                    { icon: FiRefreshCw, text: '7-day easy returns' },
                    { icon: FiShield, text: 'Secure encrypted checkout' },
                  ].map(({ icon: Icon, text }) => (
                    <div className="bd-guarantee-item" key={text}>
                      <Icon size={14} /> {text}
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            {/* ─── Center: Description + Reviews ─── */}
            <div className="bd-center">
              {/* Tabs */}
              <FadeIn>
                <div className="bd-tabs">
                  {['description', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      className={`bd-tab-btn ${activeTab === tab ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab === 'description' ? 'Description' : `Reviews (${total})`}
                    </button>
                  ))}
                </div>
              </FadeIn>

              {activeTab === 'description' && (
                <FadeIn delay={0.05}>
                  <div className="bd-description">
                    <p>{book.description || 'No description available.'}</p>
                    {book.publisher && (
                      <p className="bd-desc-meta"><strong>Publisher:</strong> {book.publisher.name}</p>
                    )}
                    {book.edition && (
                      <p className="bd-desc-meta"><strong>Edition:</strong> {book.edition}</p>
                    )}
                    {book.tags?.length > 0 && (
                      <div className="bd-tags">
                        {book.tags.map((tag) => (
                          <span key={tag} className="bd-tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </FadeIn>
              )}

              {activeTab === 'reviews' && (
                <FadeIn delay={0.05}>
                  <div className="bd-reviews-section">
                    {/* Rating overview */}
                    {total > 0 && (
                      <div className="bd-rating-overview">
                        <div className="bd-rating-big">
                          <span className="bd-rating-score">{avg?.toFixed(1)}</span>
                          <div className="bd-rating-stars-big">
                            <Stars rating={avg} size={20} />
                          </div>
                          <span className="bd-rating-total">{total} reviews</span>
                        </div>
                        <div className="bd-rating-bars">
                          {ratingDist.map(({ star, count }) => (
                            <RatingBar key={star} label={star} count={count} total={total} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Write a review */}
                    {isAuthenticated && (
                      <form className="bd-review-form" onSubmit={handleReviewSubmit}>
                        <h4 className="bd-review-form-title">Write a Review</h4>
                        <div className="bd-star-picker">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <FiStar
                              key={r}
                              size={26}
                              fill={r <= (hoverRating || reviewRating) ? '#FBBF24' : 'none'}
                              style={{
                                color: r <= (hoverRating || reviewRating) ? '#FBBF24' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'color 0.15s, transform 0.15s',
                                transform: r <= (hoverRating || reviewRating) ? 'scale(1.15)' : 'scale(1)',
                              }}
                              onMouseEnter={() => setHoverRating(r)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setReviewRating(r)}
                            />
                          ))}
                          <span className="bd-star-label">{reviewRating} / 5</span>
                        </div>
                        <textarea
                          className="bd-review-textarea"
                          rows={4}
                          placeholder="Share your thoughts about this book..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          required
                        />
                        <button type="submit" className="bd-review-submit" disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    )}

                    {/* Review list */}
                    <div className="bd-review-list">
                      {reviews.length === 0 ? (
                        <p className="bd-no-reviews">No reviews yet. Be the first!</p>
                      ) : (
                        reviews.map((rev) => (
                          <div key={rev._id} className="bd-review-card">
                            <div className="bd-review-header">
                              <div className="bd-review-avatar">
                                {rev.user?.fullName?.charAt(0) || <FiUser size={16} />}
                              </div>
                              <div className="bd-review-meta">
                                <strong className="bd-reviewer-name">{rev.user?.fullName}</strong>
                                <div className="bd-review-stars">
                                  <Stars rating={rev.rating} size={12} />
                                </div>
                              </div>
                              <span className="bd-review-date">
                                {new Date(rev.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <p className="bd-review-text">{rev.comment}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </FadeIn>
              )}
            </div>

            {/* ─── Right: Sticky Purchase Card ─── */}
            <div className="bd-right">
              <div className="bd-purchase-card">
                {/* Price block */}
                <div className="bd-price-block">
                  <span className="bd-price-current">₹{book.finalPrice || book.price}</span>
                  {book.discountPercent > 0 && (
                    <>
                      <span className="bd-price-original">₹{book.price}</span>
                      <span className="bd-price-badge">{book.discountPercent}% OFF</span>
                    </>
                  )}
                </div>
                <p className="bd-price-note">Inclusive of all taxes</p>

                {/* Stock status */}
                {book.stockQuantity > 0 ? (
                  <div className="bd-in-stock">
                    <FiCheck size={14} /> In Stock &mdash; Ships in 2–3 days
                  </div>
                ) : (
                  <div className="bd-out-stock">Out of Stock</div>
                )}
                {book.stockQuantity > 0 && book.stockQuantity <= 10 && (
                  <p className="bd-low-stock">⚠️ Only {book.stockQuantity} left!</p>
                )}

                {/* Quantity selector */}
                {book.stockQuantity > 0 && (
                  <div className="bd-qty-row">
                    <span className="bd-qty-label">Quantity</span>
                    <div className="bd-qty-ctrl">
                      <button className="bd-qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}>
                        <FiMinus size={13} />
                      </button>
                      <span className="bd-qty-val">{qty}</span>
                      <button className="bd-qty-btn" onClick={() => setQty(Math.min(book.stockQuantity, qty + 1))}>
                        <FiPlus size={13} />
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA buttons */}
                <div className="bd-cta-stack">
                  {isAlreadyInCart ? (
                    <button className="bd-btn-cart active" onClick={() => navigate('/cart')}>
                      <FiShoppingCart size={16} /> View Cart
                    </button>
                  ) : (
                    <button
                      className="bd-btn-cart"
                      onClick={handleAddToCart}
                      disabled={book.stockQuantity === 0}
                    >
                      <FiShoppingCart size={16} />
                      {book.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  )}

                  {book.stockQuantity > 0 && (
                    <button className="bd-btn-buy" onClick={handleBuyNow}>
                      Buy Now
                    </button>
                  )}

                  <div className="bd-action-row">
                    <button
                      className={`bd-btn-wish ${isInWishlist ? 'active' : ''}`}
                      onClick={handleWishlist}
                      title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <FiHeart size={16} fill={isInWishlist ? 'currentColor' : 'none'} />
                      {isInWishlist ? 'Wishlisted' : 'Wishlist'}
                    </button>
                    <button
                      className="bd-btn-share"
                      onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                      title="Share"
                    >
                      <FiShare2 size={16} /> Share
                    </button>
                  </div>
                </div>

                {/* Author pill */}
                {book.author && (
                  <Link
                    to={`/authors/${book.author.slug || book.author._id}`}
                    className="bd-author-pill"
                  >
                    <div className="bd-author-avatar">
                      <img src={book.author.photo || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(book.author.name || 'author')}` } alt={book.author.name} />
                    </div>
                    <div>
                      <div className="bd-author-pill-label">Author</div>
                      <div className="bd-author-pill-name">{book.author.name}</div>
                    </div>
                    <FiArrowLeft size={14} style={{ transform: 'rotate(180deg)', marginLeft: 'auto', color: 'var(--text-muted)' }} />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════ RELATED BOOKS ══════════════ */}
          {relatedBooks.length > 0 && (
            <FadeIn>
              <section className="bd-related-section">
                <div className="bd-related-header">
                  <div>
                    <span className="bd-related-pretitle">You Might Also Love</span>
                    <h2 className="bd-related-title">Similar Books</h2>
                  </div>
                  <Link to={`/books?category=${book.category?._id}`} className="bd-related-link">
                    More in {book.category?.name} <FiArrowLeft size={13} style={{ transform: 'rotate(180deg)' }} />
                  </Link>
                </div>
                <RelatedRail books={relatedBooks} />
              </section>
            </FadeIn>
          )}
        </div>
      </div>
    </>
  );
};

export default BookDetail;
