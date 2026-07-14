const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, 'Book title is required'], trim: true, maxlength: 300 },
        subtitle: { type: String, trim: true },
        slug: { type: String, lowercase: true },
        isbn: { type: String, trim: true },
        googleBookId: { type: String, trim: true },
        isbn10: { type: String, trim: true },
        isbn13: { type: String, trim: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
        authors: [{ type: String, trim: true }],
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        categories: [{ type: String, trim: true }],
        publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'Publisher' },
        publisherName: { type: String, trim: true },
        description: { type: String, required: [true, 'Description is required'] },
        shortDescription: { type: String, maxlength: 500 },
        language: { type: String, default: 'English' },
        edition: { type: String },
        publicationDate: { type: Date },
        pages: { type: Number, min: 1 },
        price: { type: Number, required: [true, 'Price is required'], min: 0 },
        currency: { type: String, default: 'INR' },
        discountPercent: { type: Number, default: 0, min: 0, max: 100 },
        finalPrice: { type: Number },
        stockQuantity: { type: Number, default: 0, min: 0 },
        coverImage: { type: String },
        highResCoverImage: { type: String },
        previewLink: { type: String },
        infoLink: { type: String },
        saleability: { type: String },
        country: { type: String },
        priceSource: { type: String, default: 'generated' },
        stockSource: { type: String, default: 'generated' },
        source: { type: String, default: 'manual' },
        galleryImages: [{ type: String }],
        pdfPreview: { type: String },
        tags: [{ type: String, trim: true }],
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0 },
        totalSold: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        isTrending: { type: Boolean, default: false },
        isBestSeller: { type: Boolean, default: false },
        isNewArrival: { type: Boolean, default: true },
        isActive: { type: Boolean, default: true },
        seo: {
            metaTitle: String,
            metaDescription: String,
            keywords: [String],
        },
        weight: { type: String },
        dimensions: { type: String },
        format: { type: String, enum: ['Hardcover', 'Paperback', 'eBook', 'Audiobook'], default: 'Paperback' },
        textLang: { type: String, default: 'english' },
        seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

bookSchema.index({
    title: 'text',
    subtitle: 'text',
    description: 'text',
    shortDescription: 'text',
    tags: 'text',
    authors: 'text',
    publisherName: 'text',
    categories: 'text',
    isbn: 'text',
}, { default_language: 'english', weights: {
    title: 10,
    subtitle: 5,
    authors: 8,
    publisherName: 6,
    categories: 4,
    tags: 3,
    description: 2,
    shortDescription: 2,
    isbn: 1,
} });
bookSchema.index({ slug: 1 }, { unique: true });
bookSchema.index({ googleBookId: 1 }, { unique: true, sparse: true });
bookSchema.index({ isbn: 1 }, { unique: true, sparse: true });
bookSchema.index({ isbn10: 1 }, { sparse: true });
bookSchema.index({ isbn13: 1 }, { sparse: true });
bookSchema.index({ category: 1 });
bookSchema.index({ author: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ averageRating: -1 });
bookSchema.index({ isFeatured: 1 });
bookSchema.index({ isBestSeller: 1 });
bookSchema.index({ isTrending: 1 });
bookSchema.index({ isNewArrival: 1 });


bookSchema.pre('save', function (next) {
    this.finalPrice = this.discountPercent > 0
        ? Math.round(this.price * (1 - this.discountPercent / 100) * 100) / 100
        : this.price;
    if (!this.slug) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Book', bookSchema);
