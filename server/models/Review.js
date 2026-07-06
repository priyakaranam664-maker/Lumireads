const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
        rating: { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
        title: { type: String, trim: true, maxlength: 200 },
        comment: { type: String, required: [true, 'Review comment is required'], maxlength: 2000 },
        likes: { type: Number, default: 0 },
        dislikes: { type: Number, default: 0 },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        isApproved: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

reviewSchema.index({ book: 1, user: 1 }, { unique: true });
reviewSchema.index({ book: 1, isApproved: 1 });

// Update book's average rating after save
reviewSchema.statics.calcAverageRating = async function (bookId) {
    const stats = await this.aggregate([
        { $match: { book: bookId, isApproved: true, isActive: true } },
        { $group: { _id: '$book', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const Book = mongoose.model('Book');
    if (stats.length > 0) {
        await Book.findByIdAndUpdate(bookId, {
            averageRating: Math.round(stats[0].avgRating * 10) / 10,
            totalReviews: stats[0].count,
        });
    } else {
        await Book.findByIdAndUpdate(bookId, { averageRating: 0, totalReviews: 0 });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.book);
});

reviewSchema.post('findOneAndDelete', function (doc) {
    if (doc) doc.constructor.calcAverageRating(doc.book);
});

module.exports = mongoose.model('Review', reviewSchema);
