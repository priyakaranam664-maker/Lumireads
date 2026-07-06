import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { authorAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Authors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authorAPI.getAll({ limit: 50 }).then(({ data }) => setAuthors(data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Helmet><title>Authors - BookStore</title></Helmet>
            <div className="page-header">
                <Container>
                    <div className="breadcrumb-custom mb-2"><Link to="/">Home</Link><span>/</span><span style={{ color: 'white' }}>Authors</span></div>
                    <h1>Our Authors</h1>
                </Container>
            </div>
            <Container className="py-4">
                <Row className="g-3">
                    {(authors || []).map((author, i) => (
                        <Col xs={6} md={4} lg={3} key={author._id}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <Link to={`/authors/${author.slug || author._id}`} style={{ textDecoration: 'none' }}>
                                    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', textAlign: 'center', transition: 'var(--transition)' }}
                                        className="book-card">
                                        <img src={author.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'} alt={author.name}
                                            style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '3px solid var(--border-color)' }} />
                                        <h6 style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-primary)' }}>{author.name}</h6>
                                        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{author.country}</p>
                                        <span className="tag">{author.bookCount || 0} Books</span>
                                    </div>
                                </Link>
                            </motion.div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    );
};

export default Authors;
