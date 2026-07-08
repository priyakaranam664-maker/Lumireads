import React, { useEffect, useState } from 'react';
import Anavbar from './Anavbar';
import axios from 'axios';
import toast from 'react-hot-toast';

const Items = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBooks = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get('/api/books/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBooks(res.data.data || []);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load books catalog');
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
            toast.success('Book deleted successfully');
            fetchBooks();
        } catch (error) {
            toast.error('Failed to delete book');
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Anavbar />
            <div className="container py-5">
                <h3 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Books Catalogue (Admin)</h3>
                <div className="card shadow-sm p-4 border" style={{ backgroundColor: '#FDFBF7' }}>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-muted">No books in catalog.</td>
                                    </tr>
                                ) : (
                                    books.map((book) => (
                                        <tr key={book._id}>
                                            <td>
                                                <img
                                                    src={book.coverImage || 'https://via.placeholder.com/60x90?text=Cover'}
                                                    alt={book.title}
                                                    style={{ width: '45px', height: '65px', objectFit: 'cover', borderRadius: '4px' }}
                                                />
                                            </td>
                                            <td>
                                                <div className="fw-bold">{book.title}</div>
                                                <div className="text-muted small">ID: <code>{book._id}</code></div>
                                            </td>
                                            <td>₹{book.finalPrice}</td>
                                            <td>{book.stockQuantity}</td>
                                            <td>
                                                <span className={`badge ${book.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                    {book.isActive ? 'Active' : 'Deleted'}
                                                </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-outline-danger fw-bold"
                                                    onClick={() => handleDelete(book._id)}
                                                    disabled={!book.isActive}
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Items;
