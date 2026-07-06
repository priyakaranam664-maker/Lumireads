const Category = require('../models/Category');
const Author = require('../models/Author');
const Publisher = require('../models/Publisher');
const Book = require('../models/Book');

// ==================== CATEGORIES ====================
exports.getCategories = async (req, res, next) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const categories = await Category.find(filter).sort('name').lean();
        // Add book count
        for (let cat of categories) {
            cat.bookCount = await Book.countDocuments({ category: cat._id, isActive: true });
        }
        res.status(200).json({ success: true, data: categories });
    } catch (error) { next(error); }
};

exports.getCategory = async (req, res, next) => {
    try {
        const { identifier } = req.params;
        let category;
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            category = await Category.findById(identifier);
        } else {
            category = await Category.findOne({ slug: identifier });
        }
        if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
        res.status(200).json({ success: true, data: category });
    } catch (error) { next(error); }
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
    } catch (error) { next(error); }
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
            author = await Author.findById(identifier);
        } else {
            author = await Author.findOne({ slug: identifier });
        }
        if (!author) return res.status(404).json({ success: false, message: 'Author not found' });

        const books = await Book.find({ author: author._id, isActive: true })
            .populate('category', 'name slug')
            .sort('-createdAt')
            .lean();

        res.status(200).json({ success: true, data: { author, books } });
    } catch (error) { next(error); }
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
