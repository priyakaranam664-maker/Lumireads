import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { categoryAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        categoryAPI.getAll().then(({ data }) => setCategories(data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Helmet><title>Categories - BookStore</title></Helmet>
            <div className="page-header">
                <Container>
                    <div className="breadcrumb-custom mb-2"><Link to="/">Home</Link><span>/</span><span style={{ color: 'white' }}>Categories</span></div>
                    <h1>Browse Categories</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>Explore books by genre and topic</p>
                </Container>
            </div>
            <Container className="py-4">
                <Row className="g-3">
                    {(categories || []).map((cat, i) => (
                        <Col xs={6} md={4} lg={3} key={cat._id}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                <Link to={`/books?category=${cat._id}`} style={{ textDecoration: 'none' }}>
                                    <div className="category-card" style={{ height: '100%' }}>
                                        <div className="category-card-icon">{cat.icon || '📖'}</div>
                                        <div className="category-card-name">{cat.name}</div>
                                        <div className="category-card-count">{cat.bookCount || 0} Books</div>
                                        {cat.description && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>{cat.description}</p>}
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

export default Categories;
