import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';
import BookCard from '../components/BookCard';
import { useAuth } from '../context/AuthContext';
import { bookAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Wishlist = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user?.wishlist?.length) { setLoading(false); return; }
            try {
                const promises = user.wishlist.map((id) => bookAPI.getBook(id._id || id));
                const results = await Promise.all(promises);
                setBooks(results.map((r) => r.data.data));
            } catch { } finally { setLoading(false); }
        };
        fetchWishlist();
    }, [user?.wishlist]);

    if (loading) return <LoadingSpinner />;

    return (
        <>
            <Helmet><title>Wishlist - BookStore</title></Helmet>
            <div className="page-header">
                <Container><div className="breadcrumb-custom mb-2"><Link to="/">Home</Link><span>/</span><span style={{ color: 'white' }}>Wishlist</span></div><h1>My Wishlist</h1></Container>
            </div>
            <Container className="py-4">
                <div className="mb-3">
                    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 650, display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', padding: 0, fontSize: '0.9rem', transition: 'color 0.2s ease' }}>
                        <FiArrowLeft size={16} /> Back
                    </button>
                </div>
                {books.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon"><FiHeart /></div><h3>Your Wishlist is Empty</h3><p>Save books you love for later</p><Link to="/books" className="btn-primary-custom">Browse Books</Link></div>
                ) : (
                    <Row className="g-3">{books.map((book) => <Col xs={6} md={4} lg={3} key={book._id}><BookCard book={book} /></Col>)}</Row>
                )}
            </Container>
        </>
    );
};

export default Wishlist;
