import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiGlobe, FiAward, FiArrowLeft } from 'react-icons/fi';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { authorAPI, bookAPI } from '../services/api';

const AuthorDetail = () => {
    const { identifier } = useParams();
    const [author, setAuthor] = useState(null);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await authorAPI.get(identifier);
                setAuthor(data.data);
                const booksRes = await bookAPI.getBooks({ author: data.data._id, limit: 20 });
                setBooks(booksRes.data.data);
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
                        <FiArrowLeft size={16} /> Back
                    </button>
                </div>
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '2rem', marginBottom: '2rem' }}>
                    <Row className="align-items-center">
                        <Col md={3} className="text-center mb-3 mb-md-0">
                            <img src={author.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} alt={author.name}
                                style={{ width: 150, height: 150, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--primary)' }} />
                        </Col>
                        <Col md={9}>
                            <h2 style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{author.name}</h2>
                            {author.country && <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><FiGlobe size={14} /> {author.country}</p>}
                            {author.biography && <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{author.biography}</p>}
                            {author.awards?.length > 0 && (
                                <div className="d-flex gap-2 flex-wrap">
                                    {author.awards.map((a) => <span key={a} className="tag"><FiAward size={12} /> {a}</span>)}
                                </div>
                            )}
                        </Col>
                    </Row>
                </div>
                <h3 className="section-title">Books by {author.name}</h3>
                <Row className="g-3 mt-2">
                    {books.map((book) => <Col xs={6} md={4} lg={3} key={book._id}><BookCard book={book} /></Col>)}
                </Row>
                {books.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No books found for this author.</p>}
            </Container>
        </>
    );
};

export default AuthorDetail;
