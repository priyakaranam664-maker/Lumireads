const Review = require('../models/Review');
const Book = require('../models/Book');
const mongoose = require('mongoose');

exports.getBookReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        const filter = { book: req.params.bookId, isApproved: true, isActive: true };
        const total = await Review.countDocuments(filter);
        const reviews = await Review.find(filter)
            .populate('user', 'fullName avatar')
            .sort('-createdAt').skip(skip).limit(limit).lean();

        const breakdown = await Review.aggregate([
            { $match: { book: new mongoose.Types.ObjectId(req.params.bookId), isApproved: true, isActive: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);
        const ratingBreakdown = {};
        for (let i = 5; i >= 1; i--) {
            const f = breakdown.find((b) => b._id === i);
            ratingBreakdown[i] = f ? f.count : 0;
        }

        res.status(200).json({ success: true, data: reviews, ratingBreakdown, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
};

exports.createReview = async (req, res, next) => {
    try {
        const { rating, title, comment } = req.body;
        const existing = await Review.findOne({ user: req.user._id, book: req.params.bookId });
        if (existing) return res.status(409).json({ success: false, message: 'You already reviewed this book' });
        const review = await Review.create({ user: req.user._id, book: req.params.bookId, rating, title, comment });
        await review.populate('user', 'fullName avatar');
        res.status(201).json({ success: true, data: review, message: 'Review submitted' });
    } catch (error) { next(error); }
};

exports.updateReview = async (req, res, next) => {
    try {
        const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        if (req.body.rating) review.rating = req.body.rating;
        if (req.body.title) review.title = req.body.title;
        if (req.body.comment) review.comment = req.body.comment;
        await review.save();
        res.status(200).json({ success: true, data: review, message: 'Review updated' });
    } catch (error) { next(error); }
};

exports.deleteReview = async (req, res, next) => {
    try {
        const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.status(200).json({ success: true, message: 'Review deleted' });
    } catch (error) { next(error); }
};

exports.toggleLike = async (req, res, next) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        const idx = review.likedBy.indexOf(req.user._id);
        if (idx > -1) { review.likedBy.splice(idx, 1); review.likes = Math.max(0, review.likes - 1); }
        else { review.likedBy.push(req.user._id); review.likes += 1; }
        await review.save();
        res.status(200).json({ success: true, data: review });
    } catch (error) { next(error); }
};

exports.getAllReviews = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const total = await Review.countDocuments();
        const reviews = await Review.find()
            .populate('user', 'fullName email').populate('book', 'title')
            .sort('-createdAt').skip(skip).limit(limit).lean();
        res.status(200).json({ success: true, data: reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
};

exports.moderateReview = async (req, res, next) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: req.body.isApproved }, { new: true });
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        res.status(200).json({ success: true, data: review, message: `Review ${req.body.isApproved ? 'approved' : 'rejected'}` });
    } catch (error) { next(error); }
};
