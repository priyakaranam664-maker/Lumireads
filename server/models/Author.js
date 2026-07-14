const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Author name is required'], trim: true },
        slug: { type: String, lowercase: true },
        biography: { type: String },
        photoUrl: { type: String },
        nationality: { type: String },
        birthDate: { type: String },
        deathDate: { type: String },
        genres: [{ type: String, trim: true }],
        occupation: [{ type: String, trim: true }],
        officialWebsite: { type: String },
        wikipediaUrl: { type: String },
        openLibraryId: { type: String },
        awards: [{ type: String }],
        languages: [{ type: String, trim: true }],
        isVerified: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        totalBooks: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        followers: { type: Number, default: 0 },
        followersEstimated: { type: Boolean, default: false },
        books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
        country: { type: String },
        isActive: { type: Boolean, default: true },
        bookCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

authorSchema.index({ slug: 1 }, { unique: true });
authorSchema.index({ name: 'text' });

authorSchema.pre('save', function (next) {
    if (!this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

module.exports = mongoose.model('Author', authorSchema);
