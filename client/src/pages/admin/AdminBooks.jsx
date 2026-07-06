import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { bookAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminBooks = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({});

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12 };
            if (search) params.q = search;
            const { data } = await bookAPI.getAllAdmin(params);
            setBooks(data.data);
            setPagination(data.pagination || {});
        } catch { } finally { setLoading(false); }
    };

    useEffect(() => { fetchBooks(); }, [page, search]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this book?')) return;
        try {
            await bookAPI.delete(id);
            toast.success('Book deleted');
            fetchBooks();
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    return (
        <>
            <Helmet><title>Manage Books - Admin</title></Helmet>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <h4 style={{ fontWeight: 800, marginBottom: 0 }}>Manage Books</h4>
                <Link to="/admin/books/new" className="btn-primary-custom"><FiPlus /> Add Book</Link>
            </div>

            <div className="d-flex gap-2 mb-3">
                <div className="search-wrapper flex-grow-1">
                    <FiSearch className="search-icon" />
                    <input className="search-input" placeholder="Search books..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
                </div>
            </div>

            {loading ? <LoadingSpinner /> : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                {['Book', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map((h) => (
                                    <th key={h} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => (
                                <tr key={book._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div className="d-flex align-items-center gap-2">
                                            <img src={book.coverImage} alt="" style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                                            <div>
                                                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{book.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.author?.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}><span className="tag">{book.category?.name}</span></td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ fontWeight: 700 }}>₹{book.finalPrice}</div>
                                        {book.discountPercent > 0 && <div style={{ fontSize: '0.72rem', color: 'var(--success)' }}>{book.discountPercent}% off</div>}
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{ fontWeight: 600, color: book.stockQuantity <= 5 ? 'var(--danger)' : 'var(--text-primary)' }}>{book.stockQuantity}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}>⭐ {book.averageRating?.toFixed(1) || 'N/A'}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div className="d-flex gap-1">
                                            <Link to={`/admin/books/edit/${book._id}`} className="btn-icon" title="Edit"><FiEdit2 size={14} /></Link>
                                            <button className="btn-icon" onClick={() => handleDelete(book._id)} title="Delete" style={{ color: 'var(--danger)' }}><FiTrash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {books.length === 0 && <div className="empty-state"><h3>No books found</h3></div>}
                </div>
            )}

            {pagination.pages > 1 && (
                <div className="d-flex justify-content-center gap-2 mt-3">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)} style={{
                            width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                            background: p === page ? 'var(--primary)' : 'var(--bg-card)', color: p === page ? 'white' : 'var(--text-secondary)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                        }}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </>
    );
};

export default AdminBooks;
