const Book = require('../models/Book');
const { APIFeatures } = require('../utils/helpers');

// @desc    Get all books with filtering, sorting, pagination
// @route   GET /api/books
exports.getBooks = async (req, res, next) => {
    try {
        // Build filter object
        const filter = { isActive: true };

        if (req.query.category) filter.category = req.query.category;
        if (req.query.author) filter.author = req.query.author;
        if (req.query.publisher) filter.publisher = req.query.publisher;
        if (req.query.language) filter.language = req.query.language;
        if (req.query.format) filter.format = req.query.format;
        if (req.query.isFeatured) filter.isFeatured = req.query.isFeatured === 'true';
        if (req.query.isBestSeller) filter.isBestSeller = req.query.isBestSeller === 'true';
        if (req.query.isTrending) filter.isTrending = req.query.isTrending === 'true';
        if (req.query.isNewArrival) filter.isNewArrival = req.query.isNewArrival === 'true';

        // Price range
        if (req.query.minPrice || req.query.maxPrice) {
            filter.finalPrice = {};
            if (req.query.minPrice) filter.finalPrice.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.finalPrice.$lte = Number(req.query.maxPrice);
        }

        // Rating filter
        if (req.query.minRating) {
            filter.averageRating = { $gte: Number(req.query.minRating) };
        }

        // Discount filter
        if (req.query.hasDiscount === 'true') {
            filter.discountPercent = { $gt: 0 };
        }

        // Stock filter
        if (req.query.inStock === 'true') {
            filter.stockQuantity = { $gt: 0 };
        }

        // Search
        if (req.query.q || req.query.search) {
            const searchTerm = req.query.q || req.query.search;
            filter.$or = [
                { title: { $regex: searchTerm, $options: 'i' } },
                { tags: { $regex: searchTerm, $options: 'i' } },
                { isbn: { $regex: searchTerm, $options: 'i' } },
            ];
        }

        // Sorting
        let sortBy = '-createdAt';
        if (req.query.sort) {
            const sortMap = {
                'price-low': 'finalPrice',
                'price-high': '-finalPrice',
                'rating': '-averageRating',
                'newest': '-createdAt',
                'oldest': 'createdAt',
                'popular': '-totalSold',
                'title-az': 'title',
                'title-za': '-title',
                'discount': '-discountPercent',
            };
            sortBy = sortMap[req.query.sort] || req.query.sort;
        }

        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const skip = (page - 1) * limit;

        const total = await Book.countDocuments(filter);
        const books = await Book.find(filter)
            .populate('author', 'name slug photo')
            .populate('category', 'name slug')
            .populate('publisher', 'name slug')
            .sort(sortBy)
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({
            success: true,
            data: books,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single book by slug or id
// @route   GET /api/books/:identifier
exports.getBook = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        let book;

        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            book = await Book.findById(identifier);
        } else {
            book = await Book.findOne({ slug: identifier });
        }

        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }

        await book.populate('author', 'name slug photo biography country awards socialLinks');
        await book.populate('category', 'name slug description');
        await book.populate('publisher', 'name slug logo website');

        // Get related books
        const relatedBooks = book.category
            ? await Book.find({
                category: book.category._id,
                _id: { $ne: book._id },
                isActive: true,
            })
                .populate('author', 'name slug')
                .limit(8)
                .lean()
            : [];

        res.status(200).json({ success: true, data: { book, relatedBooks } });
    } catch (error) {
        next(error);
    }
};

// @desc    Create book (Admin)
// @route   POST /api/books
exports.createBook = async (req, res, next) => {
    try {
        const book = await Book.create(req.body);
        res.status(201).json({ success: true, data: book, message: 'Book created successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Update book (Admin)
// @route   PUT /api/books/:id
exports.updateBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        res.status(200).json({ success: true, data: book, message: 'Book updated successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete book (Admin - soft delete)
// @route   DELETE /api/books/:id
exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!book) {
            return res.status(404).json({ success: false, message: 'Book not found' });
        }
        res.status(200).json({ success: true, message: 'Book deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured books
// @route   GET /api/books/featured
exports.getFeaturedBooks = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 8;
        const books = await Book.find({ isFeatured: true, isActive: true })
            .populate('author', 'name slug')
            .limit(limit)
            .lean();
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        next(error);
    }
};

// @desc    Get best sellers
// @route   GET /api/books/best-sellers
exports.getBestSellers = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 8;
        const books = await Book.find({ isBestSeller: true, isActive: true })
            .populate('author', 'name slug')
            .sort('-totalSold')
            .limit(limit)
            .lean();
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        next(error);
    }
};

// @desc    Get new arrivals
// @route   GET /api/books/new-arrivals
exports.getNewArrivals = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 8;
        const books = await Book.find({ isNewArrival: true, isActive: true })
            .populate('author', 'name slug')
            .sort('-createdAt')
            .limit(limit)
            .lean();
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        next(error);
    }
};

// @desc    Get trending books
// @route   GET /api/books/trending
exports.getTrendingBooks = async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 8;
        const books = await Book.find({ isTrending: true, isActive: true })
            .populate('author', 'name slug')
            .sort('-averageRating')
            .limit(limit)
            .lean();
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        next(error);
    }
};

// @desc    Search books with autocomplete
// @route   GET /api/books/search/autocomplete
exports.autocomplete = async (req, res, next) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) {
            return res.status(200).json({ success: true, data: [] });
        }
        const books = await Book.find({
            isActive: true,
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { tags: { $regex: q, $options: 'i' } },
                { isbn: { $regex: q, $options: 'i' } },
            ],
        })
            .select('title slug coverImage finalPrice author')
            .populate('author', 'name')
            .limit(8)
            .lean();
        res.status(200).json({ success: true, data: books });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all books for admin (including inactive)
// @route   GET /api/books/admin/all
exports.getAllBooksAdmin = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const filter = {};

        if (req.query.q) {
            filter.$or = [
                { title: { $regex: req.query.q, $options: 'i' } },
                { isbn: { $regex: req.query.q, $options: 'i' } },
            ];
        }

        const total = await Book.countDocuments(filter);
        const books = await Book.find(filter)
            .populate('author', 'name')
            .populate('category', 'name')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({ success: true, data: books, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) {
        next(error);
    }
};
