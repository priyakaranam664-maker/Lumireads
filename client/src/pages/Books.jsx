import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { FiGrid, FiList, FiFilter, FiX, FiSearch } from 'react-icons/fi';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { bookAPI, categoryAPI, authorAPI, publisherAPI } from '../services/api';

const BookGridSkeleton = () => (
    <Row className="g-3">
        {Array.from({ length: 6 }).map((_, index) => (
            <Col xs={6} md={4} key={index}>
                <div className="skeleton-card">
                    <div className="skeleton skeleton-img" />
                    <div className="p-3">
                        <div className="skeleton skeleton-title" />
                        <div className="skeleton skeleton-text" />
                        <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                    </div>
                </div>
            </Col>
        ))}
    </Row>
);

const Books = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const timerRef = useRef(null);
    const navigate = useNavigate();

    // Derived filters directly from searchParams
    const filters = {
        q: searchParams.get('q') || '',
        category: searchParams.get('category') || '',
        author: searchParams.get('author') || '',
        publisher: searchParams.get('publisher') || '',
        language: searchParams.get('language') || '',
        yearFrom: searchParams.get('yearFrom') || '',
        yearTo: searchParams.get('yearTo') || '',
        isFeatured: searchParams.get('isFeatured') || '',
        isBestSeller: searchParams.get('isBestSeller') || '',
        isTrending: searchParams.get('isTrending') || '',
        isNewArrival: searchParams.get('isNewArrival') || '',
        hasDiscount: searchParams.get('hasDiscount') || '',
        inStock: searchParams.get('inStock') || '',
        page: searchParams.get('page') || '1',
    };

    // Load filter dropdown options once
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [catRes, authRes, pubRes] = await Promise.all([
                    categoryAPI.getAll(),
                    authorAPI.getAll({ limit: 100 }),
                    publisherAPI.getAll({ limit: 100 }),
                ]);
                setCategories(catRes.data.data);
                setAuthors(authRes.data.data);
                setPublishers(pubRes.data.data);
            } catch { }
        };
        fetchFilters();
    }, []);

    // Load books whenever URL search params change
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const params = {};
                Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
                const { data } = await bookAPI.getBooks(params);
                setBooks(data.data);
                setPagination(data.pagination);
            } catch { }
            finally { setLoading(false); }
        };
        fetchBooks();
    }, [searchParams]);

    // Page autocomplete handlers
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (val) => {
        setSearchQuery(val);
        clearTimeout(timerRef.current);
        if (val.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
        timerRef.current = setTimeout(async () => {
            try {
                const { data } = await bookAPI.autocomplete(val);
                setSuggestions(data.data);
                setShowSuggestions(true);
            } catch { setSuggestions([]); }
        }, 300);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) { const next = new URLSearchParams(searchParams); next.set('q', searchQuery); next.set('page','1'); setSearchParams(next); setShowSuggestions(false); }
    };

    const updateFilter = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        next.set('page', '1');
        setSearchParams(next);
    };

    const clearFilters = () => {
        setSearchParams({});
    };

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'most-reviewed', label: 'Most Reviewed' },
        { value: 'trending', label: 'Trending' },
    ];

    return (
        <>
            <Helmet><title>Browse Books - BookStore</title></Helmet>
            <div className="page-header">
                <Container>
                    <div className="breadcrumb-custom mb-2">
                        <Link to="/">Home</Link><span>/</span><span style={{ color: 'white' }}>Books</span>
                    </div>
                    <h1>Browse Books</h1>
                    {pagination.total !== undefined && <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 0 }}>{pagination.total} books found</p>}
                </Container>
            </div>

            <Container className="py-4">
                <Row>
                    {/* Filter Sidebar */}
                    <Col lg={3} className={`${showFilters ? 'd-block' : 'd-none'} d-lg-block`}>
                        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', padding: '1.25rem', position: 'sticky', top: 'calc(var(--navbar-height) + 1rem)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 style={{ fontWeight: 800, fontSize: '1rem', margin: 0, color: 'var(--text-primary)' }}>Filters</h5>
                                <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Clear All</button>
                            </div>

                            {/* Search */}
                            <div className="filter-section">
                                <div className="filter-title">Search</div>
                                <input className="form-input" placeholder="Search books..." value={filters.q} onChange={(e) => updateFilter('q', e.target.value)} style={{ fontSize: '0.85rem' }} />
                            </div>

                            {/* Category */}
                            <div className="filter-section">
                                <div className="filter-title">Category</div>
                                <Form.Select size="sm" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                    <option value="">All Categories</option>
                                    {(categories || []).map((c) => <option key={c._id} value={c.slug || c._id}>{c.name}</option>)}
                                </Form.Select>
                            </div>

                            {/* Author */}
                            <div className="filter-section">
                                <div className="filter-title">Author</div>
                                <Form.Select size="sm" value={filters.author} onChange={(e) => updateFilter('author', e.target.value)}
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                    <option value="">All Authors</option>
                                    {(authors || []).map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
                                </Form.Select>
                            </div>

                            {/* Publisher */}
                            <div className="filter-section">
                                <div className="filter-title">Publisher</div>
                                <Form.Select size="sm" value={filters.publisher} onChange={(e) => updateFilter('publisher', e.target.value)}
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                    <option value="">All Publishers</option>
                                    {(publishers || []).map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </Form.Select>
                            </div>

                            {/* Language */}
                            <div className="filter-section">
                                <div className="filter-title">Language</div>
                                <Form.Select size="sm" value={filters.language} onChange={(e) => updateFilter('language', e.target.value)}
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                    <option value="">Any Language</option>
                                    {['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Arabic'].map((lang) => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </Form.Select>
                            </div>

                            {/* Publication Year */}
                            <div className="filter-section">
                                <div className="filter-title">Publication Year</div>
                                <div className="d-flex gap-2">
                                    <input className="form-input" type="number" placeholder="From" value={filters.yearFrom} onChange={(e) => updateFilter('yearFrom', e.target.value)} style={{ fontSize: '0.8rem' }} />
                                    <input className="form-input" type="number" placeholder="To" value={filters.yearTo} onChange={(e) => updateFilter('yearTo', e.target.value)} style={{ fontSize: '0.8rem' }} />
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="filter-section">
                                <div className="filter-title">Price Range</div>
                                <div className="d-flex gap-2">
                                    <input className="form-input" type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} style={{ fontSize: '0.8rem' }} />
                                    <input className="form-input" type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} style={{ fontSize: '0.8rem' }} />
                                </div>
                            </div>

                            {/* Rating */}
                            <div className="filter-section">
                                <div className="filter-title">Minimum Rating</div>
                                <Form.Select size="sm" value={filters.minRating} onChange={(e) => updateFilter('minRating', e.target.value)}
                                    style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                                    <option value="">Any Rating</option>
                                    {[4, 3, 2, 1].map((r) => <option key={r} value={r}>{r}★ & above</option>)}
                                </Form.Select>
                            </div>

                            {/* Quick Filters */}
                            <div className="filter-section">
                                <div className="filter-title">Quick Filters</div>
                                {[
                                    { key: 'isBestSeller', label: 'Best Sellers' },
                                    { key: 'isTrending', label: 'Trending' },
                                    { key: 'isNewArrival', label: 'New Arrivals' },
                                    { key: 'hasDiscount', label: 'On Sale' },
                                    { key: 'inStock', label: 'In Stock' },
                                ].map(({ key, label }) => (
                                    <Form.Check key={key} type="checkbox" label={label}
                                        checked={filters[key] === 'true'}
                                        onChange={(e) => updateFilter(key, e.target.checked ? 'true' : '')}
                                        style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }} className="mb-1" />
                                ))}
                            </div>
                        </div>
                    </Col>

                    {/* Book Grid */}
                    <Col lg={9}>
                        {/* Toolbar */}
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2" style={{ background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <div className="d-flex align-items-center gap-2">
                                    <div className="search-wrapper me-3" ref={searchRef} style={{ minWidth: 260 }}>
                                        <form onSubmit={handleSearchSubmit}>
                                            <FiSearch className="search-icon" />
                                            <input className="search-input" placeholder="Search books, authors, ISBN..." value={searchQuery}
                                                onChange={(e) => handleSearch(e.target.value)} onFocus={() => suggestions.length > 0 && setShowSuggestions(true)} />
                                        </form>
                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="search-dropdown">
                                                {suggestions.map((book) => (
                                                    <div className="search-item" key={book._id}
                                                        onClick={() => { navigate(`/books/${book.slug}`); setShowSuggestions(false); setSearchQuery(''); }}>
                                                        <img src={book.coverImage} alt={book.title} />
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{book.title}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.author?.name}</div>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>₹{book.finalPrice}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button className="btn-icon d-lg-none" onClick={() => setShowFilters(!showFilters)}>{showFilters ? <FiX /> : <FiFilter />}</button>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        Showing {books.length} of {pagination.total || 0} books
                                    </span>
                                </div>
                            <div className="d-flex align-items-center gap-2">
                                <Form.Select size="sm" value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}
                                    style={{ width: 'auto', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                                    {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </Form.Select>
                                <button className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} style={viewMode === 'grid' ? { background: 'var(--primary)', color: 'white' } : {}}><FiGrid size={16} /></button>
                                <button className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} style={viewMode === 'list' ? { background: 'var(--primary)', color: 'white' } : {}}><FiList size={16} /></button>
                            </div>
                        </div>

                        {loading ? (
                            <BookGridSkeleton />
                        ) : books.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">📚</div>
                                <h3>No Books Found</h3>
                                <p>Try adjusting your filters or search terms</p>
                                <button className="btn-primary-custom" onClick={clearFilters}>Clear Filters</button>
                            </div>
                        ) : (
                            <>
                                <Row className="g-3">
                                    {(books || []).map((book) => (
                                        <Col xs={6} md={viewMode === 'grid' ? 4 : 12} key={book._id}>
                                            <BookCard book={book} />
                                        </Col>
                                    ))}
                                </Row>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="d-flex justify-content-center gap-2 mt-4">
                                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                            <button key={page} onClick={() => {
                                                const next = new URLSearchParams(searchParams);
                                                next.set('page', page.toString());
                                                setSearchParams(next);
                                            }}
                                                style={{
                                                    width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                                                    background: page === pagination.page ? 'var(--primary)' : 'var(--bg-card)',
                                                    color: page === pagination.page ? 'white' : 'var(--text-secondary)',
                                                    fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                                                }}>
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Books;
