import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiGlobe, FiAward, FiArrowLeft, FiStar, FiUsers, FiExternalLink, FiClock, FiHeart, FiCheckCircle } from 'react-icons/fi';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { authorAPI, bookAPI } from '../services/api';

const AuthorDetail = () => {
    const { identifier } = useParams();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState([]);
    const [popular, setPopular] = useState([]);
    const [recent, setRecent] = useState([]);
    const [similarAuthors, setSimilarAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await authorAPI.get(identifier);
                const authorDoc = data.data?.author || data.data;
                setAuthor(authorDoc);
                const [booksRes, popularRes, recentRes, authorsRes] = await Promise.all([
                    bookAPI.getBooks({ author: authorDoc._id, limit: 24 }),
                    bookAPI.getBooks({ author: authorDoc._id, limit: 6, sort: 'rating' }),
                    bookAPI.getBooks({ author: authorDoc._id, limit: 6, sort: 'newest' }),
                    authorAPI.getAll({ limit: 100 }),
                ]);
                setBooks(booksRes.data.data || data.data.books || []);
                setPopular(popularRes.data.data || []);
                setRecent(recentRes.data.data || []);
                // derive similar authors by shared genres
                const allAuthors = authorsRes.data.data || [];
                const targetGenres = new Set((authorDoc.genres || []).map((g) => g.toLowerCase()));
                const similar = allAuthors
                    .filter((a) => a._id !== authorDoc._id)
                    .map((a) => ({ ...a, common: (a.genres || []).filter((g) => targetGenres.has((g || '').toLowerCase())).length }))
                    .filter((a) => a.common > 0)
                    .sort((x, y) => y.common - x.common)
                    .slice(0, 8);
                setSimilarAuthors(similar);
            } catch { } finally { setLoading(false); }
        };
        fetch();
    }, [identifier]);

    if (loading) return <LoadingSpinner />;
    if (!author) return <div className="empty-state"><h3>Author not found</h3></div>;

    return (
        <>
            <Helmet><title>{`${author.name} - BookStore`}</title></Helmet>
            <div className="page-header">
                <Container>
                    <div className="breadcrumb-custom mb-2"><Link to="/">Home</Link><span>/</span><Link to="/authors">Authors</Link><span>/</span><span style={{ color: 'white' }}>{author.name}</span></div>
                </Container>
            </div>
            <Container className="py-4">
                        <div className="author-detail-topbar">
                    <button onClick={() => navigate(-1)} className="btn-back-link">
                        <FiArrowLeft size={16} /> Back
                    </button>
                </div>
                <section className="author-detail-hero">
                    <div className="author-detail-hero-bg" />
                    <div className="author-detail-hero-card">
                        <div className="author-detail-avatar">
                            <img src={author.photoUrl || author.photo || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(author.name || 'author')}` } alt={author.name} />
                            {author.isVerified && <span className="author-verified-badge"><FiCheckCircle size={16} /> Verified</span>}
                        </div>
                        <div className="author-detail-main">
                            <div className="author-detail-heading">
                                <div>
                                    <h1>{author.name}</h1>
                                    <p className="author-detail-role">{(author.occupation || ['Author']).join(', ')}</p>
                                </div>
                                <div className="author-detail-links">
                                    {author.officialWebsite && (
                                        <a href={author.officialWebsite} target="_blank" rel="noreferrer" className="author-link">
                                            Official Site <FiExternalLink size={14} />
                                        </a>
                                    )}
                                    {author.wikipediaUrl && (
                                        <a href={author.wikipediaUrl} target="_blank" rel="noreferrer" className="author-link">
                                            Wikipedia <FiExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <p className="author-detail-bio">{author.biography || 'A prolific author with a growing body of works and reader acclaim.'}</p>
                            <div className="author-detail-meta-grid">
                                {author.nationality && <div><strong>Nationality</strong><span>{author.nationality}</span></div>}
                                {author.birthDate && <div><strong>Born</strong><span>{author.birthDate}</span></div>}
                                {author.deathDate && <div><strong>Died</strong><span>{author.deathDate}</span></div>}
                                {author.genres?.length > 0 && <div><strong>Genres</strong><span>{author.genres.slice(0, 4).join(', ')}</span></div>}
                            </div>
                            <div className="author-stat-grid">
                                <div className="author-stat-card"><span>{author.bookCount || author.totalBooks || 0}</span><small>Books Written</small></div>
                                <div className="author-stat-card"><span>{(author.averageRating || 0).toFixed(1)}</span><small>Average Rating</small></div>
                                <div className="author-stat-card"><span>{author.followers ? author.followers.toLocaleString() : '—'}</span><small>Followers</small></div>
                                <div className="author-stat-card"><span>{author.bookCount ? Math.max(0, Math.round((author.bookCount || author.totalBooks || 0) * 2.5)) : '—'}</span><small>Reviews</small></div>
                            </div>
                        </div>
                    </div>
                </section>
                <h3 className="section-title">Books by {author.name}</h3>
                <Row className="g-3 mt-2">
                    {books.map((book) => <Col xs={6} md={4} lg={3} key={book._id}><BookCard book={book} /></Col>)}
                </Row>
                {books.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No books found for this author.</p>}
                {popular.length > 0 && (
                    <>
                        <h4 className="section-title mt-4">Popular by {author.name}</h4>
                        <Row className="g-3 mt-2">
                            {popular.map((book) => <Col xs={6} md={4} lg={3} key={book._id}><BookCard book={book} /></Col>)}
                        </Row>
                    </>
                )}

                {recent.length > 0 && (
                    <>
                        <h4 className="section-title mt-4">Recently Added</h4>
                        <Row className="g-3 mt-2">
                            {recent.map((book) => <Col xs={6} md={4} lg={3} key={book._id}><BookCard book={book} /></Col>)}
                        </Row>
                    </>
                )}

                {similarAuthors.length > 0 && (
                    <>
                        <h4 className="section-title mt-4">Readers also like</h4>
                        <Row className="g-3 mt-2">
                            {similarAuthors.map((a) => (
                                <Col xs={6} md={4} lg={3} key={a._id}>
                                    <Link to={`/authors/${a.slug || a._id}`} style={{ textDecoration: 'none' }}>
                                        <div className="author-card" style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <img src={a.photo || `https://api.dicebear.com/6.x/initials/svg?seed=${encodeURIComponent(a.name || 'author')}` } alt={a.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border-color)' }} />
                                                <div>
                                                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{a.name}</div>
                                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{(a.genres || []).slice(0,2).join(', ')}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </Col>
                            ))}
                        </Row>
                    </>
                )}
            </Container>
        </>
    );
};

export default AuthorDetail;
