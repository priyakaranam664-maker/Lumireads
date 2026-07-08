import React, { useEffect, useState } from 'react';
import Snavbar from './Snavbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const MyProducts = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('/api/books/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooks(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load your books');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this book?')) return;
        try {
            const token = localStorage.getItem('accessToken');
            await axios.delete(`/api/books/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Book deleted');
            fetchBooks();
        } catch (error) {
            toast.error('Failed to delete book');
        }
    };

    useEffect(() => { fetchBooks(); }, []);

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Snavbar />
            <div className="container py-5">
                <h3 className="text-center fw-bold mb-5" style={{ color: '#5D2E17' }}>Books List</h3>
                {loading ? (
                    <p className="text-center text-muted">Loading...</p>
                ) : books.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted mb-3">You haven't added any books yet.</p>
                        <button onClick={() => navigate('/seller/add-book')} className="btn text-white fw-bold" style={{ backgroundColor: '#5CB85C' }}>
                            Add Your First Book
                        </button>
                    </div>
                ) : (
                    <div className="row g-4">
                        {books.map((book) => (
                            <div key={book._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <div className="card h-100 shadow-sm border" style={{ backgroundColor: '#FDFBF7' }}>
                                    <img
                                        src={book.coverImage || 'https://via.placeholder.com/300x400?text=No+Cover'}
                                        alt={book.title}
                                        className="card-img-top"
                                        style={{ height: '250px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body d-flex flex-column">
                                        <h6 className="card-title fw-bold text-truncate">{book.title}</h6>
                                        <p className="text-muted small mb-1">Author: {book.author?.name || 'Unknown'}</p>
                                        <p className="text-muted small mb-1">Genre: {book.category?.name || 'N/A'}</p>
                                        <p className="fw-bold mb-2" style={{ color: '#8B4513' }}>Price: ₹{book.finalPrice || book.price}</p>
                                        <p className="small text-muted mb-3">{book.description?.substring(0, 80)}...</p>
                                        <div className="mt-auto d-flex gap-2">
                                            <button
                                                onClick={() => navigate(`/seller/edit-book/${book._id}`)}
                                                className="btn btn-sm btn-outline-primary flex-fill fw-bold"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(book._id)}
                                                className="btn btn-sm btn-outline-danger flex-fill fw-bold"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProducts;
