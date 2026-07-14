import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { authorAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AuthorCard from '../components/AuthorCard';

const Authors = () => {
    const [authors, setAuthors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 16;

    useEffect(() => {
        authorAPI.getAll({ limit: 200 }).then(({ data }) => setAuthors(data.data)).catch(() => { }).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner />;

    const totalPages = Math.max(1, Math.ceil((authors || []).length / pageSize));
    const visibleAuthors = (authors || []).slice((page - 1) * pageSize, page * pageSize);

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
                <Row className="g-4">
                    {visibleAuthors.map((author, i) => (
                        <Col xs={12} sm={6} md={4} lg={3} key={author._id}>
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                                <AuthorCard author={author} />
                            </motion.div>
                        </Col>
                    ))}
                </Row>

                {(authors || []).length > pageSize && (
                    <div className="author-pagination">
                        <button type="button" className="pagination-btn" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                            Previous
                        </button>
                        <span className="pagination-label">Page {page} of {totalPages}</span>
                        <button type="button" className="pagination-btn" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>
                            Next
                        </button>
                    </div>
                )}
            </Container>
        </>
    );
};

export default Authors;
