import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  FiArrowRight, FiTrendingUp, FiZap, FiAward, FiStar,
  FiChevronLeft, FiChevronRight, FiMail, FiShield, FiRefreshCw,
  FiTruck, FiHeadphones, FiPercent, FiClock, FiBookOpen,
  FiCopy, FiHeart
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import BookCard from '../components/BookCard';
import PremiumNavbar from '../components/PremiumNavbar';
import PremiumFooter from '../components/PremiumFooter';
import LoadingSpinner from '../components/LoadingSpinner';
import { bookAPI, categoryAPI, generalAPI } from '../services/api';
import toast from 'react-hot-toast';
import '../styles/premium-home.css';

/* ─── Scroll-triggered section wrapper ─────────────────── */
const FadeInSection = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

/* ─── Horizontal Book Rail ──────────────────────────────── */
const BookRail = ({ books }) => {
  const railRef = useRef(null);
  const scroll = (dir) => {
    if (railRef.current) railRef.current.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };
  if (!books?.length) return null;
  return (
    <div className="book-rail-wrapper">
      <button className="rail-arrow rail-arrow-left" onClick={() => scroll(-1)} aria-label="Scroll left">
        <FiChevronLeft size={20} />
      </button>
      <div className="book-rail" ref={railRef}>
        {books.map((book) => (
          <div className="book-rail-item" key={book._id}>
            <BookCard book={book} />
          </div>
        ))}
      </div>
      <button className="rail-arrow rail-arrow-right" onClick={() => scroll(1)} aria-label="Scroll right">
        <FiChevronRight size={20} />
      </button>
    </div>
  );
};

/* ─── Live Countdown Timer ──────────────────────────────── */
const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = target - now;
      setTime({
        h: Math.floor((diff / 3600000) % 24),
        m: Math.floor((diff / 60000) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (n) => String(n).padStart(2, '0');
  return (
    <div className="countdown-box">
      {[['h', 'HRS'], ['m', 'MIN'], ['s', 'SEC']].map(([key, lbl], i) => (
        <div key={key} className="countdown-unit">
          <AnimatePresence mode="popLayout">
            <motion.span
              key={time[key]}
              className="countdown-val"
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 12, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {fmt(time[key])}
            </motion.span>
          </AnimatePresence>
          <span className="countdown-lbl">{lbl}</span>
          {i < 2 && <span className="countdown-sep">:</span>}
        </div>
      ))}
    </div>
  );
};

/* ─── Section Header ────────────────────────────────────── */
const SectionHeader = ({ pretitle, title, linkTo, linkLabel }) => (
  <div className="ph-section-header">
    <div>
      {pretitle && <span className="ph-pretitle">{pretitle}</span>}
      <h2 className="ph-section-title">{title}</h2>
    </div>
    {linkTo && (
      <Link to={linkTo} className="ph-view-all">
        {linkLabel || 'View All'} <FiArrowRight size={14} />
      </Link>
    )}
  </div>
);

/* ─── TESTIMONIALS DATA ─────────────────────────────────── */
const TESTIMONIALS = [
  {
    name: 'Aanya Kapoor', role: 'Avid Reader', initials: 'AK', rating: 5,
    quote: 'LumiReads has completely transformed how I discover books. The curation is absolutely impeccable — every recommendation feels personally chosen.',
  },
  {
    name: 'Rohan Mehta', role: 'Book Collector', initials: 'RM', rating: 5,
    quote: 'The browsing experience is beautifully designed and lightning fast. My wishlist fills up faster than ever. Best book platform I\'ve used.',
  },
  {
    name: 'Priya Sharma', role: 'Literature Enthusiast', initials: 'PS', rating: 5,
    quote: 'From packaging to delivery — pure premium. And the categories section helped me find genres I never knew I\'d love!',
  },
];

/* ─── CATEGORY ICONS ────────────────────────────────────── */
const CAT_COLORS = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#f97316,#ef4444)',
  'linear-gradient(135deg,#10b981,#059669)',
  'linear-gradient(135deg,#0ea5e9,#2563eb)',
  'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ec4899,#db2777)',
  'linear-gradient(135deg,#14b8a6,#0891b2)',
  'linear-gradient(135deg,#84cc16,#65a30d)',
];

/* ═══════════════════════════════════════════════════════════
   PREMIUM HOME COMPONENT
═══════════════════════════════════════════════════════════ */
const PremiumHome = () => {
  const [loading, setLoading] = useState(true);
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [email, setEmail] = useState('');
  const [selectedArrivalCat, setSelectedArrivalCat] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [featRes, bestRes, newRes, trendRes, catRes, banRes] = await Promise.all([
          bookAPI.getFeatured(12).catch(() => ({ data: { data: [] } })),
          bookAPI.getBestSellers(12).catch(() => ({ data: { data: [] } })),
          bookAPI.getNewArrivals(12).catch(() => ({ data: { data: [] } })),
          bookAPI.getTrending(12).catch(() => ({ data: { data: [] } })),
          categoryAPI.getAll().catch(() => ({ data: { data: [] } })),
          generalAPI.getBanners({ position: 'hero' }).catch(() => ({ data: { data: [] } })),
        ]);
        setFeatured(featRes?.data?.data || []);
        setBestSellers(bestRes?.data?.data || []);
        setNewArrivals(newRes?.data?.data || []);
        setTrending(trendRes?.data?.data || []);
        setCategories(catRes?.data?.data || []);
        setBanners(banRes?.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleCopyPromo = useCallback(() => {
    navigator.clipboard.writeText('READ50');
    toast.success('Promo code READ50 copied!');
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('🎉 Welcome to the Reading Club!');
    setEmail('');
  };

  if (loading) return <LoadingSpinner />;

  const arrivalCats = ['ALL', ...Array.from(new Set(newArrivals.map(b => b.category?.name).filter(Boolean))).slice(0, 5)];
  const filteredArrivals = selectedArrivalCat === 'ALL'
    ? newArrivals
    : newArrivals.filter(b => b.category?.name === selectedArrivalCat);

  const trustItems = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders above ₹499' },
    { icon: FiShield, title: 'Secure Payments', desc: '100% encrypted & safe' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '7-day no-questions policy' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Always here for you' },
  ];

  return (
    <>
      <Helmet>
        <title>LumiReads — Discover Stories That Shape Your World</title>
        <meta name="description" content="Browse thousands of handpicked books — bestsellers, new arrivals, trending reads. Premium delivery, curated collections." />
      </Helmet>

      <PremiumNavbar />

      {/* ══════════════ HERO ══════════════ */}
      <section className="ph-hero">
        {/* Decorative blobs */}
        <div className="ph-hero-blobs" aria-hidden="true">
          <div className="ph-blob ph-blob-1" />
          <div className="ph-blob ph-blob-2" />
          <div className="ph-blob ph-blob-3" />
        </div>
        {/* Animated grid */}
        <div className="ph-hero-grid" aria-hidden="true" />

        <div className="ph-hero-inner">
          {/* Left: Text */}
          <motion.div
            className="ph-hero-copy"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.span
              className="ph-hero-badge"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FiZap size={14} /> ✨ The Ultimate Literary Destination
            </motion.span>

            <h1 className="ph-hero-headline">
              Discover Books That <br />
              <span className="ph-hero-gradient">Shape Your Mind</span>
            </h1>

            <p className="ph-hero-subtext">
              Browse thousands of handpicked hardcovers, digital releases, and timeless
              bestsellers curated for the passionate reader.
            </p>

            <div className="ph-hero-actions">
              <Link to="/books" className="ph-btn-primary">
                <FiBookOpen size={16} /> Explore Books
              </Link>
              <Link to="/categories" className="ph-btn-ghost">
                Browse Categories
              </Link>
            </div>

            {/* Stats row */}
            <div className="ph-hero-stats">
              {[
                { val: '30K+', lbl: 'Premium Books' },
                { val: '12K+', lbl: 'Loyal Readers' },
                { val: '4.9★', lbl: 'Service Rating' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  className="ph-stat"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <span className="ph-stat-val">{s.val}</span>
                  <span className="ph-stat-lbl">{s.lbl}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Floating book covers */}
          <motion.div
            className="ph-hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <div className="ph-book-stack">
              {featured.slice(0, 5).map((book, i) => (
                <motion.div
                  key={book._id}
                  className={`ph-book-float ph-book-float-${i}`}
                  animate={{ y: [0, i % 2 === 0 ? -14 : 14, 0] }}
                  transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Link to={`/books/${book.slug || book._id}`}>
                    <img src={book.coverImage} alt={book.title} />
                  </Link>
                </motion.div>
              ))}
              {/* Glow ring behind books */}
              <div className="ph-glow-ring" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ TRUST BAR ══════════════ */}
      <section className="ph-trust-bar">
        <div className="ph-container">
          <FadeInSection className="ph-trust-grid">
            {trustItems.map(({ icon: Icon, title, desc }, i) => (
              <div className="ph-trust-item" key={i}>
                <div className="ph-trust-icon"><Icon size={18} /></div>
                <div>
                  <div className="ph-trust-title">{title}</div>
                  <div className="ph-trust-desc">{desc}</div>
                </div>
              </div>
            ))}
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════ FEATURED BOOKS ══════════════ */}
      {featured.length > 0 && (
        <section className="ph-section">
          <div className="ph-container">
            <FadeInSection>
              <SectionHeader
                pretitle="Selected by Experts"
                title="✨ Featured Collections"
                linkTo="/books?isFeatured=true"
                linkLabel="View All"
              />
            </FadeInSection>
            <FadeInSection delay={0.1}>
              <BookRail books={featured} />
            </FadeInSection>
          </div>
        </section>
      )}

      {/* ══════════════ TRENDING ══════════════ */}
      {trending.length > 0 && (
        <section className="ph-section ph-section-alt">
          <div className="ph-container">
            <FadeInSection>
              <SectionHeader
                pretitle={<><FiTrendingUp style={{ marginRight: '4px' }} />Readers' High Choices</>}
                title="🔥 Trending Now"
                linkTo="/books?isTrending=true"
                linkLabel="Full Leaderboard"
              />
            </FadeInSection>
            <FadeInSection delay={0.1}>
              <BookRail books={trending} />
            </FadeInSection>
          </div>
        </section>
      )}

      {/* ══════════════ PROMO BANNER ══════════════ */}
      <section className="ph-promo-section">
        <div className="ph-container">
          <FadeInSection>
            <div className="ph-promo-banner">
              <div className="ph-promo-left">
                <span className="ph-promo-badge">
                  <FiPercent size={13} /> LIMITED TIME OFFER
                </span>
                <h3 className="ph-promo-title">Mega Cyber Book Sale</h3>
                <p className="ph-promo-desc">
                  Up to 50% off bestselling releases, classic literature & study hardcovers. Free shipping included!
                </p>
                <div className="ph-promo-actions">
                  <Link to="/books?hasDiscount=true" className="ph-promo-btn">
                    Shop Sale <FiArrowRight size={14} />
                  </Link>
                  <button className="ph-promo-code" onClick={handleCopyPromo}>
                    Code: <strong>READ50</strong> <FiCopy size={13} />
                  </button>
                </div>
              </div>
              <div className="ph-promo-right">
                <div className="ph-promo-timer-label">
                  <FiClock size={13} /> HURRY! DEALS EXPIRE IN:
                </div>
                <CountdownTimer />
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ══════════════ BEST SELLERS ══════════════ */}
      {bestSellers.length > 0 && (
        <section className="ph-section">
          <div className="ph-container">
            <FadeInSection>
              <SectionHeader
                pretitle="Popular Demands"
                title="🏆 Best Selling Titles"
                linkTo="/books?isBestSeller=true"
                linkLabel="See All Best Sellers"
              />
            </FadeInSection>
            <FadeInSection delay={0.1}>
              <BookRail books={bestSellers} />
            </FadeInSection>
          </div>
        </section>
      )}

      {/* ══════════════ RECENTLY ADDED ══════════════ */}
      {newArrivals.length > 0 && (
        <section className="ph-section ph-section-alt">
          <div className="ph-container">
            <FadeInSection>
              <SectionHeader
                pretitle="Hot Off the Press"
                title="🆕 Recently Added"
                linkTo="/books?isNewArrival=true"
                linkLabel="Browse All Releases"
              />
            </FadeInSection>

            {/* Category tabs */}
            <FadeInSection delay={0.05}>
              <div className="ph-tab-strip">
                {arrivalCats.map((cat) => (
                  <button
                    key={cat}
                    className={`ph-tab-btn ${selectedArrivalCat === cat ? 'active' : ''}`}
                    onClick={() => setSelectedArrivalCat(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </FadeInSection>

            <AnimatePresence mode="popLayout">
              <motion.div
                key={selectedArrivalCat}
                className="ph-books-grid"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
              >
                {filteredArrivals.slice(0, 8).map((book) => (
                  <BookCard book={book} key={book._id} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* ══════════════ CATEGORIES ══════════════ */}
      {categories.length > 0 && (
        <section className="ph-section ph-categories-section">
          <div className="ph-container">
            <FadeInSection>
              <SectionHeader
                pretitle="What Are You In The Mood For?"
                title="📚 Browse by Category"
                linkTo="/categories"
                linkLabel="All Categories"
              />
            </FadeInSection>
            <FadeInSection delay={0.1}>
              <div className="ph-cat-grid">
                {categories.filter(c => c).slice(0, 8).map((cat, i) => (
                  <Link
                    to={`/books?category=${cat._id}`}
                    key={cat._id}
                    className="ph-cat-card"
                    style={{ '--cat-gradient': CAT_COLORS[i % CAT_COLORS.length] }}
                  >
                    <div className="ph-cat-icon">
                      <span>{cat.icon || '📖'}</span>
                    </div>
                    <span className="ph-cat-name">{cat.name}</span>
                    {cat.booksCount > 0 && <span className="ph-cat-count">{cat.booksCount} books</span>}
                  </Link>
                ))}
              </div>
            </FadeInSection>
          </div>
        </section>
      )}

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section className="ph-section ph-testimonials-section">
        <div className="ph-container">
          <FadeInSection>
            <SectionHeader
              pretitle="Loved by Readers"
              title="💬 What Our Readers Say"
            />
          </FadeInSection>
          <div className="ph-testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <FadeInSection key={i} delay={i * 0.12}>
                <div className="ph-testimonial-card">
                  <div className="ph-testimonial-quote">"</div>
                  <p className="ph-testimonial-text">{t.quote}</p>
                  <div className="ph-testimonial-footer">
                    <div className="ph-testimonial-avatar">{t.initials}</div>
                    <div>
                      <div className="ph-testimonial-name">{t.name}</div>
                      <div className="ph-testimonial-role">{t.role}</div>
                    </div>
                    <div className="ph-testimonial-stars">
                      {Array.from({ length: t.rating }, (_, j) => (
                        <FiStar key={j} size={13} fill="#FBBF24" style={{ color: '#FBBF24' }} />
                      ))}
                    </div>
                  </div>
                </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ NEWSLETTER ══════════════ */}
      <section className="ph-newsletter-section">
        <div className="ph-container">
          <FadeInSection>
            <div className="ph-newsletter-panel">
              <div className="ph-newsletter-blobs" aria-hidden="true">
                <div className="ph-nl-blob ph-nl-blob-1" />
                <div className="ph-nl-blob ph-nl-blob-2" />
              </div>
              <div className="ph-newsletter-inner">
                <div className="ph-newsletter-icon"><FiMail size={28} /></div>
                <h3 className="ph-newsletter-title">Join the Reading Club</h3>
                <p className="ph-newsletter-desc">
                  Get handpicked weekly releases, exclusive coupon codes &amp; invitations to premium author events.
                </p>
                <form className="ph-newsletter-form" onSubmit={handleNewsletter}>
                  <input
                    type="email"
                    className="ph-newsletter-input"
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Newsletter email"
                    required
                  />
                  <button type="submit" className="ph-newsletter-btn">
                    Subscribe <FiArrowRight size={15} />
                  </button>
                </form>
                <p className="ph-newsletter-note">No spam, unsubscribe anytime.</p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <PremiumFooter />
    </>
  );
};

export default PremiumHome;
