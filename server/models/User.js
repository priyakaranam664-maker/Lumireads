const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: [true, 'Full name is required'], trim: true, maxlength: 100 },
        email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
        phone: { type: String, trim: true },
        password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
        avatar: { type: String, default: '' },
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        gender: { type: String, enum: ['male', 'female', 'other', ''] },
        dateOfBirth: { type: Date },
        addresses: [
            {
                label: { type: String, default: 'Home' },
                fullName: String,
                phone: String,
                addressLine1: { type: String, required: true },
                addressLine2: String,
                city: { type: String, required: true },
                state: { type: String, required: true },
                country: { type: String, default: 'India' },
                postalCode: { type: String, required: true },
                isDefault: { type: Boolean, default: false },
            },
        ],
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
        isEmailVerified: { type: Boolean, default: false },
        emailVerificationToken: String,
        emailVerificationExpire: Date,
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        refreshTokens: [{ token: String, createdAt: { type: Date, default: Date.now } }],
        lastLogin: { type: Date },
        isActive: { type: Boolean, default: true },
        preferences: {
            newsletter: { type: Boolean, default: true },
            notifications: { type: Boolean, default: true },
            theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        },
    },
    { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
