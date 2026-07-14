const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Category name is required'], trim: true },
        slug: { type: String, lowercase: true },
        description: { type: String },
        icon: { type: String },
        bannerImage: { type: String },
        popularAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Author' }],
        books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
        totalBooks: { type: Number, default: 0 },
        isFeatured: { type: Boolean, default: false },
        isTrending: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        seo: { metaTitle: String, metaDescription: String, keywords: [String] },
        bookCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true });

categorySchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
