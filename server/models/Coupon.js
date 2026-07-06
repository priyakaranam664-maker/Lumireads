const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, uppercase: true, trim: true },
        description: { type: String },
        discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
        discountValue: { type: Number, required: true, min: 0 },
        minOrderAmount: { type: Number, default: 0 },
        maxDiscount: { type: Number },
        usageLimit: { type: Number },
        usedCount: { type: Number, default: 0 },
        perUserLimit: { type: Number, default: 1 },
        usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, usedAt: Date }],
        validFrom: { type: Date, required: true },
        validUntil: { type: Date, required: true },
        isActive: { type: Boolean, default: true },
        applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    },
    { timestamps: true }
);

couponSchema.index({ code: 1 }, { unique: true });




couponSchema.methods.isValid = function () {
    const now = new Date();
    return this.isActive && now >= this.validFrom && now <= this.validUntil && (!this.usageLimit || this.usedCount < this.usageLimit);
};

module.exports = mongoose.model('Coupon', couponSchema);
