const Category = require('../models/Category');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');
const { isDbUnavailableError, getFallbackCategoriesResponse, getFallbackAuthorsResponse } = require('../utils/fallbackData');

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildCategorySearchRegex = (name) => new RegExp(`^${escapeRegExp(String(name || '').trim())}$`, 'i');

const buildCategoriesFromBooks = async () => {
    const books = await Book.find({ isActive: true }).select('categories category').populate('category', 'name slug').lean();
    const categoryMap = {};

    for (const book of books) {
        const categoryNames = new Set();
        for (const rawName of book.categories || []) {
            const name = String(rawName || '').trim();
            if (name) categoryNames.add(name);
        }
        if (book.category && book.category.name) {
            categoryNames.add(String(book.category.name).trim());
        }

        for (const name of categoryNames) {
            const key = name.toLowerCase();
            if (!categoryMap[key]) {
                categoryMap[key] = {
                    _id: null,
                    name,
                    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                    description: `Books in ${name}`,
                    icon: '📚',
                    isActive: true,
                    bookCount: 0,
                };
            }
            categoryMap[key].bookCount += 1;
        }
    }

    const categories = Object.values(categoryMap);
    const featuredThreshold = categories.length > 8 ? 8 : categories.length;
    const sortedByCount = [...categories].sort((a, b) => b.bookCount - a.bookCount);
    const featuredSlugs = new Set(sortedByCount.slice(0, featuredThreshold).map((item) => item.slug));
    return categories.sort((a, b) => a.name.localeCompare(b.name)).map((cat) => ({
        ...cat,
        isFeatured: featuredSlugs.has(cat.slug),
        isTrending: cat.bookCount >= 5,
    }));
};

const countBooksForCategory = async (cat) => {
    if (!cat) return 0;
    const regex = buildCategorySearchRegex(cat.name);
    const query = {
        isActive: true,
        $or: [
            { categories: { $elemMatch: { $regex: regex } } },
        ],
    };
    if (cat._id) {
        query.$or.unshift({ category: cat._id });
    }
    return Book.countDocuments(query);
};

// ==================== CATEGORIES ====================
exports.getCategories = async (req, res, next) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        let categories = await Category.find(filter).sort('name').lean();

        if (categories.length === 0) {
            categories = await buildCategoriesFromBooks();
            return res.status(200).json({ success: true, data: categories });
        }

        const books = await Book.find({ isActive: true }).select('categories category').lean();
        
        // Build map of category key -> Set of book IDs
        const bookMatches = {};
        for (const book of books) {
            const bookId = book._id.toString();
            if (book.category) {
                const catIdStr = book.category.toString();
                if (!bookMatches[catIdStr]) bookMatches[catIdStr] = new Set();
                bookMatches[catIdStr].add(bookId);
            }
            if (book.categories && Array.isArray(book.categories)) {
                for (const name of book.categories) {
                    if (name) {
                        const nameKey = name.trim().toLowerCase();
                        if (!bookMatches[nameKey]) bookMatches[nameKey] = new Set();
                        bookMatches[nameKey].add(bookId);
                    }
                }
            }
        }

        // Calculate count for each category
        for (let cat of categories) {
            const matchedBookIds = new Set();
            if (cat._id) {
                const catIdStr = cat._id.toString();
                const ids = bookMatches[catIdStr];
                if (ids) {
                    for (const id of ids) matchedBookIds.add(id);
                }
            }
            if (cat.name) {
                const nameKey = cat.name.trim().toLowerCase();
                const ids = bookMatches[nameKey];
                if (ids) {
                    for (const id of ids) matchedBookIds.add(id);
                }
            }
            cat.bookCount = matchedBookIds.size;
        }

        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        if (isDbUnavailableError(error)) {
            return res.status(200).json(getFallbackCategoriesResponse());
        }
        next(error);
    }
};

exports.getCategory = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        let category;
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            category = await Category.findById(identifier).lean();
        } else {
            category = await Category.findOne({ slug: identifier }).lean();
        }

        if (!category) {
            const categories = await buildCategoriesFromBooks();
            category = categories.find((cat) => cat.slug === identifier.toLowerCase() || cat.name.toLowerCase() === identifier.toLowerCase());
        }

        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        if (!category.bookCount) category.bookCount = await countBooksForCategory(category);
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        if (isDbUnavailableError(error)) {
            return res.status(200).json({ success: true, data: getFallbackCategoriesResponse().data[0] });
        }
        next(error);
    }
};

exports.createCategory = async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, data: category, message: 'Category created' });
    } catch (error) { next(error); }
};

exports.updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.status(200).json({ success: true, data: category, message: 'Category updated' });
    } catch (error) { next(error); }
};

exports.deleteCategory = async (req, res, next) => {
    try {
        const bookCount = await Book.countDocuments({ category: req.params.id });
        if (bookCount > 0) {
            return res.status(400).json({ success: false, message: `Cannot delete. ${bookCount} books in this category.` });
        }
        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        if (isDbUnavailableError(error)) {
            return res.status(200).json(getFallbackCategoriesResponse());
        }
        next(error);
    }
};

// ==================== AUTHORS ====================
exports.getAuthors = async (req, res, next) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        if (req.query.q) {
            filter.$or = [{ name: { $regex: req.query.q, $options: 'i' } }];
        }

        const total = await Author.countDocuments(filter);
        const authors = await Author.find(filter).sort('name').skip(skip).limit(limit).lean();
        for (let author of authors) {
            author.bookCount = await Book.countDocuments({ author: author._id, isActive: true });
        }
        res.status(200).json({ success: true, data: authors, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
};

exports.getAuthor = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        let author;
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            author = await Author.findById(identifier).lean();
        } else {
            author = await Author.findOne({ slug: identifier }).lean();
        }
        if (!author) return res.status(404).json({ success: false, message: 'Author not found' });

        const books = await Book.find({ author: author._id, isActive: true })
            .populate('category', 'name slug')
            .sort('-createdAt')
            .lean();

        // Calculate dynamic properties
        author.bookCount = books.length;
        
        // Calculate average rating of books
        const booksWithRating = books.filter(b => b.averageRating > 0);
        if (booksWithRating.length > 0) {
            const sum = booksWithRating.reduce((acc, b) => acc + b.averageRating, 0);
            author.averageRating = parseFloat((sum / booksWithRating.length).toFixed(1));
        } else {
            author.averageRating = author.averageRating || 0;
        }

        res.status(200).json({ success: true, data: { author, books } });
    } catch (error) {
        if (isDbUnavailableError(error)) {
            return res.status(200).json(getFallbackAuthorsResponse());
        }
        next(error);
    }
};

exports.createAuthor = async (req, res, next) => {
    try {
        const author = await Author.create(req.body);
        res.status(201).json({ success: true, data: author, message: 'Author created' });
    } catch (error) { next(error); }
};

exports.updateAuthor = async (req, res, next) => {
    try {
        const author = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!author) return res.status(404).json({ success: false, message: 'Author not found' });
        res.status(200).json({ success: true, data: author, message: 'Author updated' });
    } catch (error) { next(error); }
};

exports.deleteAuthor = async (req, res, next) => {
    try {
        const bookCount = await Book.countDocuments({ author: req.params.id });
        if (bookCount > 0) {
            return res.status(400).json({ success: false, message: `Cannot delete. Author has ${bookCount} books.` });
        }
        await Author.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Author deleted' });
    } catch (error) { next(error); }
};

// ==================== PUBLISHERS ====================
exports.getPublishers = async (req, res, next) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const publishers = await Publisher.find(filter).sort('name').lean();
        for (let pub of publishers) {
            pub.bookCount = await Book.countDocuments({ publisher: pub._id, isActive: true });
        }
        res.status(200).json({ success: true, data: publishers });
    } catch (error) { next(error); }
};

exports.getPublisher = async (req, res, next) => {
    try {
        const publisher = await Publisher.findById(req.params.id);
        if (!publisher) return res.status(404).json({ success: false, message: 'Publisher not found' });
        res.status(200).json({ success: true, data: publisher });
    } catch (error) { next(error); }
};

exports.createPublisher = async (req, res, next) => {
    try {
        const publisher = await Publisher.create(req.body);
        res.status(201).json({ success: true, data: publisher, message: 'Publisher created' });
    } catch (error) { next(error); }
};

exports.updatePublisher = async (req, res, next) => {
    try {
        const publisher = await Publisher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!publisher) return res.status(404).json({ success: false, message: 'Publisher not found' });
        res.status(200).json({ success: true, data: publisher, message: 'Publisher updated' });
    } catch (error) { next(error); }
};

exports.deletePublisher = async (req, res, next) => {
    try {
        await Publisher.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Publisher deleted' });
    } catch (error) { next(error); }
};
