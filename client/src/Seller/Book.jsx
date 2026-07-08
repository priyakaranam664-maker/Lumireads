import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Snavbar from './Snavbar';
import axios from 'axios';

const Book = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const res = await axios.get(`/api/books/${id}`);
                setBook(res.data.data?.book || res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBook();
    }, [id]);

    if (loading) return <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh' }}><Snavbar /><p className="text-center py-5 text-muted">Loading...</p></div>;
    if (!book) return <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh' }}><Snavbar /><p className="text-center py-5 text-muted">Book not found.</p></div>;

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Snavbar />
            <div className="container py-5">
                <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>← Back</button>
                <div className="row g-4">
                    <div className="col-md-4">
                        <img src={book.coverImage} alt={book.title} className="w-100 rounded shadow-sm" style={{ maxHeight: '500px', objectFit: 'cover' }} />
                    </div>
                    <div className="col-md-8">
                        <h2 className="fw-bold" style={{ color: '#5D2E17' }}>{book.title}</h2>
                        <p className="text-muted">Author: <strong>{book.author?.name || 'Unknown'}</strong></p>
                        <p className="text-muted">Genre: <strong>{book.category?.name || 'N/A'}</strong></p>
                        <h4 className="fw-bold mt-3" style={{ color: '#8B4513' }}>Price: ₹{book.finalPrice || book.price}</h4>
                        <p className="mt-3">{book.description}</p>
                        <div className="mt-3">
                            <span className="badge bg-secondary me-2">Stock: {book.stockQuantity}</span>
                            <span className="badge bg-info me-2">Sold: {book.totalSold}</span>
                            <span className={`badge ${book.isActive ? 'bg-success' : 'bg-danger'}`}>{book.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Book;
