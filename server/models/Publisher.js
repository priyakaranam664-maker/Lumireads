const mongoose = require('mongoose');

const publisherSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Publisher name is required'], trim: true },
        slug: { type: String, lowercase: true },
        logoUrl: { type: String },
        country: { type: String },
        website: { type: String },
        description: { type: String },
        totalPublishedBooks: { type: Number, default: 0 },
        bookCount: { type: Number, default: 0 },
        books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

publisherSchema.index({ name: 1 }, { unique: true });
publisherSchema.index({ slug: 1 }, { unique: true });

publisherSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Publisher', publisherSchema);
