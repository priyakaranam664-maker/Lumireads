import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { bookAPI, categoryAPI, authorAPI, publisherAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminBookForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(isEdit);
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, authRes, pubRes] = await Promise.all([categoryAPI.getAll(), authorAPI.getAll({ limit: 100 }), publisherAPI.getAll({ limit: 100 })]);
                setCategories(catRes.data.data);
                setAuthors(authRes.data.data);
                setPublishers(pubRes.data.data);
                if (isEdit) {
                    const { data } = await bookAPI.getBook(id);
                    const book = data.data;
                    reset({
                        title: book.title, subtitle: book.subtitle, isbn: book.isbn,
                        author: book.author?._id, category: book.category?._id, publisher: book.publisher?._id,
                        description: book.description, shortDescription: book.shortDescription,
                        price: book.price, discountPercent: book.discountPercent, stockQuantity: book.stockQuantity,
                        pages: book.pages, language: book.language, edition: book.edition, format: book.format,
                        coverImage: book.coverImage, tags: book.tags?.join(', '),
                        isFeatured: book.isFeatured, isBestSeller: book.isBestSeller, isTrending: book.isTrending, isNewArrival: book.isNewArrival,
                    });
                }
            } catch { } finally { setFetchLoading(false); }
        };
        fetchData();
    }, [id, isEdit, reset]);

    const onSubmit = async (formData) => {
        setLoading(true);
        try {
            formData.tags = formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [];
            formData.price = Number(formData.price);
            formData.discountPercent = Number(formData.discountPercent) || 0;
            formData.stockQuantity = Number(formData.stockQuantity);
            formData.pages = Number(formData.pages) || undefined;

            if (isEdit) {
                await bookAPI.update(id, formData);
                toast.success('Book updated!');
            } else {
                await bookAPI.create(formData);
                toast.success('Book created!');
            }
            navigate('/admin/books');
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
        finally { setLoading(false); }
    };

    if (fetchLoading) return <LoadingSpinner />;

    return (
        <>
            <Helmet><title>{isEdit ? 'Edit Book' : 'Add Book'} - Admin</title></Helmet>
            <h4 style={{ fontWeight: 800, marginBottom: '1.5rem' }}>{isEdit ? 'Edit Book' : 'Add New Book'}</h4>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Basic Information</h6>
                    <Row className="g-3">
                        <Col md={8}><label className="form-label">Title *</label><input className="form-input" {...register('title', { required: 'Required' })} />{errors.title && <small style={{ color: 'var(--danger)' }}>{errors.title.message}</small>}</Col>
                        <Col md={4}><label className="form-label">Subtitle</label><input className="form-input" {...register('subtitle')} /></Col>
                        <Col md={4}><label className="form-label">ISBN *</label><input className="form-input" {...register('isbn', { required: 'Required' })} />{errors.isbn && <small style={{ color: 'var(--danger)' }}>{errors.isbn.message}</small>}</Col>
                        <Col md={4}><label className="form-label">Author *</label>
                            <select className="form-input" {...register('author', { required: 'Required' })}><option value="">Select Author</option>{authors.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}</select>
                            {errors.author && <small style={{ color: 'var(--danger)' }}>{errors.author.message}</small>}
                        </Col>
                        <Col md={4}><label className="form-label">Category *</label>
                            <select className="form-input" {...register('category', { required: 'Required' })}><option value="">Select Category</option>{categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select>
                        </Col>
                        <Col md={4}><label className="form-label">Publisher</label>
                            <select className="form-input" {...register('publisher')}><option value="">Select Publisher</option>{publishers.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}</select>
                        </Col>
                        <Col xs={12}><label className="form-label">Description *</label><textarea className="form-input" rows={4} {...register('description', { required: 'Required' })} /></Col>
                        <Col xs={12}><label className="form-label">Short Description</label><input className="form-input" {...register('shortDescription')} /></Col>
                    </Row>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Pricing & Stock</h6>
                    <Row className="g-3">
                        <Col md={3}><label className="form-label">Price (₹) *</label><input className="form-input" type="number" {...register('price', { required: 'Required', min: 1 })} /></Col>
                        <Col md={3}><label className="form-label">Discount %</label><input className="form-input" type="number" {...register('discountPercent')} /></Col>
                        <Col md={3}><label className="form-label">Stock *</label><input className="form-input" type="number" {...register('stockQuantity', { required: 'Required' })} /></Col>
                        <Col md={3}><label className="form-label">Pages</label><input className="form-input" type="number" {...register('pages')} /></Col>
                        <Col md={3}><label className="form-label">Language</label><input className="form-input" defaultValue="English" {...register('language')} /></Col>
                        <Col md={3}><label className="form-label">Edition</label><input className="form-input" {...register('edition')} /></Col>
                        <Col md={3}><label className="form-label">Format</label>
                            <select className="form-input" {...register('format')}><option value="Paperback">Paperback</option><option value="Hardcover">Hardcover</option><option value="eBook">eBook</option></select>
                        </Col>
                    </Row>
                </div>

                <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h6 style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>Media & Tags</h6>
                    <Row className="g-3">
                        <Col md={8}><label className="form-label">Cover Image URL *</label><input className="form-input" {...register('coverImage', { required: 'Required' })} /></Col>
                        <Col md={4}><label className="form-label">Tags (comma separated)</label><input className="form-input" {...register('tags')} /></Col>
                    </Row>
                    <div className="d-flex gap-4 mt-3 flex-wrap">
                        {['isFeatured', 'isBestSeller', 'isTrending', 'isNewArrival'].map((f) => (
                            <label key={f} className="d-flex align-items-center gap-2" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input type="checkbox" {...register(f)} /> {f.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn-primary-custom" disabled={loading}>{loading ? 'Saving...' : isEdit ? 'Update Book' : 'Create Book'}</button>
                    <button type="button" className="btn-secondary-custom" onClick={() => navigate('/admin/books')}>Cancel</button>
                </div>
            </form>
        </>
    );
};

export default AdminBookForm;
