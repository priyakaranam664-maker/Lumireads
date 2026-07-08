import React, { useState } from 'react';
import Snavbar from './Snavbar';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Addbook = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        title: '',
        author: '',
        category: '',
        price: '',
        stockQuantity: '',
        description: '',
        coverImage: '',
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm({ ...form, coverImage: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const payload = {
                ...form,
                price: Number(form.price),
                stockQuantity: Number(form.stockQuantity),
            };
            await axios.post('/api/books', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Book added successfully!');
            navigate('/seller/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add book');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#F9F6F0', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
            <Snavbar />
            <div className="container py-5">
                <div className="card shadow-sm p-5 border mx-auto" style={{ maxWidth: '550px', backgroundColor: '#FDFBF7' }}>
                    <h3 className="text-center fw-bold mb-4" style={{ color: '#5D2E17' }}>Add Book</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold">Title</label>
                            <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold">Author</label>
                            <input type="text" name="author" className="form-control" value={form.author} onChange={handleChange} placeholder="Author ObjectId" required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold">Genre</label>
                            <input type="text" name="category" className="form-control" value={form.category} onChange={handleChange} placeholder="Category ObjectId" required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold">Price</label>
                            <input type="number" name="price" className="form-control" value={form.price} onChange={handleChange} required />
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold">Stock Quantity</label>
                            <input type="number" name="stockQuantity" className="form-control" value={form.stockQuantity} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold">Description</label>
                            <textarea name="description" className="form-control" rows="3" value={form.description} onChange={handleChange} required></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label text-secondary small fw-bold">Book Image</label>
                            <input type="text" name="coverImage" className="form-control mb-2" placeholder="Image URL" value={form.coverImage} onChange={handleChange} />
                            <input type="file" className="form-control" accept="image/*" onChange={handleFileChange} />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-lg w-100 text-white fw-bold mt-2"
                            style={{ backgroundColor: '#5D2E17', border: 'none', borderRadius: '4px' }}
                            disabled={loading}
                        >
                            {loading ? 'Submitting...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Addbook;
