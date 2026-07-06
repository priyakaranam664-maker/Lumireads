import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Carousel } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones,
    FiChevronLeft, FiChevronRight, FiSearch, FiStar, FiPercent,
    FiTrendingUp, FiBookmark, FiClock, FiHeart, FiShoppingCart, FiAward, FiCopy
} from 'react-icons/fi';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { bookAPI, categoryAPI, generalAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

/* Horizontal scroll strip for book cards */
const BookStrip = ({ books }) => {
    const ref = useRef(null);
    const scroll = (dir) => {
        if (ref.current) ref.current.scrollBy({ left: dir * 320, behavior: 'smooth' });
    };
    return (
        <div className="book-strip-wrapper">
            <button className="strip-arrow strip-arrow-left" onClick={() => scroll(-1)} aria-label="Scroll left"><FiChevronLeft /></button>
            <div className="book-strip" ref={ref}>
                {books.map((book) => (
                    <div className="book-strip-item" key={book._id}><BookCard book={book} /></div>
                ))}
            </div>
            <button className="strip-arrow strip-arrow-right" onClick={() => scroll(1)} aria-label="Scroll right"><FiChevronRight /></button>
        </div>
    );
};

/* Interactive Countdown Timer Component */
const CountdownTimer = () => {
    const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 34, seconds: 56 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            // Target: midnight tonight
            const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            const difference = target - now;

            if (difference <= 0) {
                return { hours: 23, minutes: 59, seconds: 59 };
            }

            return {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        // Initialize immediately
        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num) => String(num || 0).padStart(2, '0');

    return (
        <div className="promo-timer-box">
            <div className="timer-unit">
                <span className="timer-val">{formatNumber(timeLeft.hours)}</span>
                <span className="timer-lbl">hrs</span>
            </div>
            <span className="timer-divider">:</span>
            <div className="timer-unit">
                <span className="timer-val">{formatNumber(timeLeft.minutes)}</span>
                <span className="timer-lbl">mins</span>
            </div>
            <span className="timer-divider">:</span>
            <div className="timer-unit">
                <span className="timer-val">{formatNumber(timeLeft.seconds)}</span>
                <span className="timer-lbl">secs</span>
            </div>
        </div>
    );
};

/* Premium Spotlight Card for Editor's Pick Book */
const FeaturedSpotlight = ({ book }) => {
    const { isAuthenticated, user, updateUser } = useAuth();
    const { cart, addToCart } = useCart();
    const navigate = useNavigate();

    const isInWishlist = user?.wishlist?.some((w) => (w._id || w) === book._id);
    const isAlreadyInCart = cart?.items?.some((item) => (item.book?._id || item.book) === book._id);

    const handleWishlist = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        try {
            const { data } = await userAPI.toggleWishlist(book._id);
            updateUser({ wishlist: data.data });
            toast.success(data.message);
        } catch (err) {
            toast.error('Wishlist action failed');
        }
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) { toast.error('Please login first'); return; }
        addToCart(book._id);
    };

    const handleBuyNow = async () => {
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
        const ratingVal = rating || 5;
        for (let i = 1; i <= 5; i++) {
            stars.push(<FiStar key={i} size={13} className={i <= Math.round(ratingVal) ? 'star-filled' : 'star-empty'}
                fill={i <= Math.round(ratingVal) ? '#FBBF24' : 'none'} />);
        }
        return stars;
    };

    return (
        <div className="featured-spotlight-card">
            <span className="spotlight-badge"><FiAward className="me-1" /> EDITOR'S PICK OF THE MONTH</span>

            <div className="spotlight-body-layout">
                <div>
                    <Link to={`/books/${book.slug || book._id}`}>
                        <img src={book.coverImage} alt={book.title} className="spotlight-img" />
                    </Link>
                </div>
                <div style={{ minWidth: 0 }}>
                    <div className="book-card-category" style={{ fontSize: '0.65rem' }}>{book.category?.name || 'Uncategorized'}</div>
                    <Link to={`/books/${book.slug || book._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 className="spotlight-title">{book.title}</h3>
                    </Link>
                    <p className="spotlight-author">by {book.author?.name || 'Unknown Author'}</p>
                    <div className="book-card-rating">
                        {renderStars(book.averageRating)}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.2rem' }}>
                            ({book.totalReviews || 0} reviews)
                        </span>
                    </div>
                </div>
            </div>

            <p className="spotlight-desc">
                {book.description || `Embark on an unforgettable literary journey. A masterpiece that seamlessly blends depth, characterization, and gripping storytelling, earning its rightful place as our Editor's Pick this month. Discover why readers around the globe are recommending this spectacular title.`}
            </p>

            <div className="book-card-price">
                <span className="price-current" style={{ fontSize: '1.4rem' }}>₹{book.finalPrice || book.price}</span>
                {book.discountPercent > 0 && (
                    <>
                        <span className="price-original" style={{ fontSize: '0.95rem' }}>₹{book.price}</span>
                        <span className="price-discount" style={{ fontSize: '0.9rem' }}>{book.discountPercent}% off</span>
                    </>
                )}
            </div>

            <div className="spotlight-actions">
                {isAlreadyInCart ? (
                    <button
                        className="btn-primary-custom flex-grow-1"
                        style={{ padding: '0.65rem 1.25rem', background: 'var(--success)' }}
                        onClick={() => navigate('/cart')}
                    >
                        <FiShoppingCart /> View in Cart
                    </button>
                ) : (
                    <button
                        className="btn-primary-custom flex-grow-1"
                        style={{ padding: '0.65rem 1.25rem' }}
                        onClick={handleAddToCart}
                    >
                        <FiShoppingCart /> Add to Cart
                    </button>
                )}

                <button
                    className="btn-secondary-custom"
                    style={{ padding: '0.65rem 1.25rem', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    onClick={handleWishlist}
                    title="Add to Wishlist"
                >
                    <FiHeart fill={isInWishlist ? 'var(--danger)' : 'none'} style={{ color: isInWishlist ? 'var(--danger)' : 'inherit' }} />
                </button>

                <button
                    className="btn-secondary-custom flex-grow-1"
                    style={{ padding: '0.65rem 1.25rem' }}
                    onClick={handleBuyNow}
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
};

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [bestSellers, setBestSellers] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [trending, setTrending] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtering layout variables for New Arrivals
    const [selectedArrivalCategory, setSelectedArrivalCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [featRes, bestRes, newRes, trendRes, catRes, banRes] = await Promise.all([
                    bookAPI.getFeatured(10), bookAPI.getBestSellers(10),
                    bookAPI.getNewArrivals(10), bookAPI.getTrending(10),
                    categoryAPI.getAll(), generalAPI.getBanners({ position: 'hero' }),
                ]);
                setFeatured(featRes.data.data || []);
                setBestSellers(bestRes.data.data || []);
                setNewArrivals(newRes.data.data || []);
                setTrending(trendRes.data.data || []);
                setCategories(catRes.data.data || []);
                setBanners(banRes.data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/books?q=${searchQuery}`);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText('READ50');
        toast.success('Promo code READ50 copied!');
    };

    if (loading) return <LoadingSpinner />;

    const features = [
        { icon: FiTruck, title: 'Free Global Shipping', desc: 'Complimentary shipping above ₹499' },
        { icon: FiShield, title: 'Secure Encrypted Payments', desc: '100% protected and safe transactions' },
        { icon: FiRefreshCw, title: 'Stress-free Returns', desc: 'No-questions-asked 7-day policy' },
        { icon: FiHeadphones, title: 'Exceptional Support', desc: '24/7 client relations assistance' },
    ];

    const featuredCats = (categories || []).filter(c => c && c.isFeatured).slice(0, 8);

    // Categories available in new arrivals list
    const arrivalCategories = ['ALL', ...Array.from(new Set((newArrivals || []).map(b => b.category?.name).filter(Boolean))).slice(0, 4)];

    const filteredArrivals = (newArrivals || []).filter(book => {
        if (selectedArrivalCategory === 'ALL') return true;
        return book.category?.name === selectedArrivalCategory;
    });

    return (
        <>
            <Helmet><title>BookStore - Discover Stories That Shape Your World</title></Helmet>

            {/* Editorial Hero Section */}
            <section className="hero-editorial-section">
                <Container>
                    <Row className="align-items-center g-5">
                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="hero-badge-pill">✨ The Ultimate Literary Destination</span>
                                <h1 className="hero-title">
                                    Uncover Books That <br />
                                    <span className="title-gradient">Shape Your Mind</span>
                                </h1>
                                <p className="hero-subtitle">
                                    Browse thousands of handpicked hardcovers, digital releases, and timeless best sellers curated for the passionate reader.
                                </p>

                                {/* Integrated Search Form */}
                                <form onSubmit={handleSearchSubmit} className="hero-search-form">
                                    <FiSearch className="hero-search-icon" />
                                    <input
                                        type="text"
                                        className="hero-search-input"
                                        placeholder="Search books, authors, genres, ISBN..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <button type="submit" className="hero-search-btn">Discover</button>
                                </form>

                                {/* Responsive Stats Bar */}
                                <div className="hero-stats-row d-none d-sm-flex">
                                    <div className="hero-stat-card">
                                        <span className="hero-stat-val">30K<span>+</span></span>
                                        <span className="hero-stat-lbl">Premium Books</span>
                                    </div>
                                    <div style={{ width: '1px', background: 'var(--border-color)', height: '40px' }} />
                                    <div className="hero-stat-card">
                                        <span className="hero-stat-val">12K<span>+</span></span>
                                        <span className="hero-stat-lbl">Loyal Readers</span>
                                    </div>
                                    <div style={{ width: '1px', background: 'var(--border-color)', height: '40px' }} />
                                    <div className="hero-stat-card">
                                        <span className="hero-stat-val">4.9<span>★</span></span>
                                        <span className="hero-stat-lbl">Service Rating</span>
                                    </div>
                                </div>
                            </motion.div>
                        </Col>

                        <Col lg={6}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                className="hero-carousel-frame"
                            >
                                {banners && banners.length > 0 ? (
                                    <Carousel controls={banners.length > 1} indicators={banners.length > 1} interval={6000}>
                                        {banners.map((banner) => (
                                            <Carousel.Item key={banner._id}>
                                                <Link to={banner.link || '/books'}>
                                                    <img
                                                        src={banner.image}
                                                        alt={banner.title || 'Featured Book Collection'}
                                                        className="d-block w-100"
                                                        style={{ height: '350px', objectFit: 'cover', borderRadius: '16px' }}
                                                    />
                                                </Link>
                                            </Carousel.Item>
                                        ))}
                                    </Carousel>
                                ) : (
                                    <div style={{ height: '350px', display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: '16px' }}>
                                        {featured.slice(0, 3).map((book, i) => (
                                            <motion.img
                                                key={book._id}
                                                src={book.coverImage}
                                                alt={book.title}
                                                style={{ width: '110px', height: '165px', objectFit: 'cover', borderRadius: '8px', boxShadow: 'var(--shadow-lg)' }}
                                                initial={{ y: i % 2 === 0 ? 15 : -15 }}
                                                animate={{ y: i % 2 === 0 ? -15 : 15 }}
                                                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Category Pills Strip */}
            {featuredCats.length > 0 && (
                <section className="category-strip-section">
                    <Container>
                        <div className="category-strip">
                            {featuredCats.map((cat) => (
                                <Link to={`/books?category=${cat._id}`} key={cat._id} className="category-pill">
                                    <span className="category-pill-icon">{cat.icon || '📖'}</span>
                                    <span className="category-pill-name">{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* Trust Service Features Bar */}
            <section className="features-bar" style={{ padding: '1.5rem 0' }}>
                <Container>
                    <Row className="g-3">
                        {features.map(({ icon: Icon, title, desc }, i) => (
                            <Col xs={6} lg={3} key={i}>
                                <div className="feature-item" style={{ background: 'var(--bg-primary)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--border-light)', gap: '0.65rem' }}>
                                    <div className="feature-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0 }}><Icon size={16} /></div>
                                    <div style={{ minWidth: 0 }}>
                                        <div className="feature-title" style={{ fontFamily: 'var(--font-display)', fontSize: '0.82rem' }}>{title}</div>
                                        <div className="feature-desc" style={{ fontSize: '0.68rem' }}>{desc}</div>
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Featured Section - Custom Spotlight & Editorial Grid Layout */}
            {featured && featured.length > 0 && (
                <section className="home-section" style={{ background: 'var(--bg-primary)' }}>
                    <Container>
                        <div className="home-section-header">
                            <div>
                                <span className="hero-pretitle">Selected by Experts</span>
                                <h2 className="home-section-title">Featured Collections</h2>
                            </div>
                            <Link to="/books?isFeatured=true" className="home-section-link">View Curated List <FiArrowRight size={14} /></Link>
                        </div>

                        <div className="featured-flex">
                            {/* Spotlight Card */}
                            <div>
                                <FeaturedSpotlight book={featured[0]} />
                            </div>
                            {/* Right Grid of 4 cards */}
                            <div className="featured-subgrid">
                                {featured.slice(1, 5).map((book) => (
                                    <div key={book._id}>
                                        <BookCard book={book} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Container>
                </section>
            )}

            {/* Best Sellers Carousel Strip */}
            {bestSellers && bestSellers.length > 0 && (
                <section className="home-section home-section-alt">
                    <Container>
                        <div className="home-section-header">
                            <div>
                                <span className="hero-pretitle">Popular Demands</span>
                                <h2 className="home-section-title">🏆 Best Selling Titles</h2>
                            </div>
                            <Link to="/books?isBestSeller=true" className="home-section-link">See All Best Sellers <FiArrowRight size={14} /></Link>
                        </div>
                        <BookStrip books={bestSellers} />
                    </Container>
                </section>
            )}

            {/* Ultra-Premium Promo Banner with Countdown Clock */}
            <section className="promo-banner-section" style={{ background: 'var(--bg-primary)', padding: '2.5rem 0' }}>
                <Container>
                    <div className="promo-banner" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)' }}>
                        <Row className="g-4 align-items-center w-100 justify-content-between">
                            <Col lg={7}>
                                <div className="promo-content">
                                    <span className="spotlight-badge" style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#FBBF24', border: '1px solid rgba(251, 191, 36, 0.4)' }}>
                                        <FiPercent /> LIMITED HOUR PROMOTION
                                    </span>
                                    <h3 style={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '2rem', marginTop: '1rem' }}>Mega Cyber Book Sale</h3>
                                    <p style={{ opacity: 0.9, fontSize: '1rem', maxWidth: '580px', marginBottom: '1.5rem' }}>
                                        Up to 50% discount on bestselling releases, classic literature, and computer science study hardcovers. Free shipment applies!
                                    </p>
                                    <div className="promo-code-box">
                                        <Link to="/books?hasDiscount=true" className="promo-btn">Shop Cyber Sale <FiArrowRight /></Link>
                                        <button className="promo-code-btn animate-pulse" onClick={handleCopyCode}>
                                            Code: <strong style={{ color: '#FBBF24' }}>READ50</strong> <FiCopy className="ms-1" />
                                        </button>
                                    </div>
                                </div>
                            </Col>

                            <Col lg={4}>
                                <div className="promo-timer-container">
                                    <span className="promo-timer-label"><FiClock className="me-1" /> HURRY! DISCOUNTS EXPIRE IN:</span>
                                    <CountdownTimer />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Container>
            </section>

            {/* New Arrivals with On-Page Category Filter Tabs */}
            {newArrivals && newArrivals.length > 0 && (
                <section className="home-section">
                    <Container>
                        <div className="home-section-header" style={{ marginBottom: '0.75rem' }}>
                            <div>
                                <span className="hero-pretitle">Hot Off the Press</span>
                                <h2 className="home-section-title">✨ Fresh New Arrivals</h2>
                            </div>
                            <Link to="/books?isNewArrival=true" className="home-section-link">Browse Full Releases <FiArrowRight size={14} /></Link>
                        </div>

                        {/* Interactive local tab strip for categorization selection */}
                        <div className="filter-tab-strip">
                            {arrivalCategories.map((catName) => (
                                <button
                                    key={catName}
                                    className={`filter-tab-btn ${selectedArrivalCategory === catName ? 'active' : ''}`}
                                    onClick={() => setSelectedArrivalCategory(catName)}
                                >
                                    {catName}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="popLayout">
                            <motion.div
                                layout
                                className="books-grid-wrapper"
                            >
                                {filteredArrivals.slice(0, 8).map((book) => (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        key={book._id}
                                    >
                                        <BookCard book={book} />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {filteredArrivals.length === 0 && (
                            <div className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                                <FiBookmark size={30} className="mb-2" />
                                <p>No new arrivals loaded in this genre yet. Explore all books in catalog.</p>
                            </div>
                        )}
                    </Container>
                </section>
            )}

            {/* Trending Now Ranked Leaderboard (#1 - #5 Showcase) */}
            {trending && trending.length > 0 && (
                <section className="home-section home-section-alt" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <Container>
                        <div className="home-section-header">
                            <div>
                                <span className="hero-pretitle"><FiTrendingUp /> Readers' High Choices</span>
                                <h2 className="home-section-title">🔥 Trending Leaderboard</h2>
                            </div>
                            <Link to="/books?isTrending=true" className="home-section-link">View Full Leaderboard <FiArrowRight size={14} /></Link>
                        </div>

                        <div className="trending-leaderboard">
                            {trending.slice(0, 5).map((book, index) => (
                                <div className="leaderboard-item" key={book._id}>
                                    <div className="leaderboard-rank">0{index + 1}</div>
                                    <div className="leaderboard-card-wrapper">
                                        <BookCard book={book} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Container>
                </section>
            )}

            {/* Newsletter Subscription Card Redesign */}
            <Container>
                <div className="newsletter-section newsletter-premium" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, rgba(124, 58, 237, 0.95) 100%)' }}>
                    <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }}>📬</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem' }}>Subscribe to our Reading Club</h3>
                    <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '520px', margin: '0.5rem auto 1.5rem' }}>
                        Get handpicked weekly book releases, exclusive promotion discount coupon codes, and invitations to premium author events.
                    </p>
                    <div className="newsletter-input-group">
                        <input type="email" placeholder="Enter your active email address..." aria-label="Newsletter email address" style={{ borderRadius: '10px', outline: 'none' }} />
                        <button style={{ borderRadius: '10px', background: 'var(--secondary)' }} onClick={() => toast.success('Awesome! Welcome to the Reading Club.')}>Join Club</button>
                    </div>
                </div>
            </Container>
        </>
    );
};

export default Home;
