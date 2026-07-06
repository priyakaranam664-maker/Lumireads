const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema(
    {
        name: { type: String, required: [true, 'Author name is required'], trim: true },
        slug: { type: String, lowercase: true },
        biography: { type: String },
        photo: { type: String },
        socialLinks: {
            website: String,
            twitter: String,
            instagram: String,
            facebook: String,
        },
        awards: [{ type: String }],
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
