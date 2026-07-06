const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    price: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
});

const cartSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [cartItemSchema],
        coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
        couponDiscount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

cartSchema.index({ user: 1 }, { unique: true });

cartSchema.virtual('subtotal').get(function () {
    return this.items.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0);
});

cartSchema.virtual('taxAmount').get(function () {
    return Math.round(this.subtotal * 0.18 * 100) / 100; // 18% GST
});

cartSchema.virtual('shippingCharges').get(function () {
    return this.subtotal >= 499 ? 0 : 49;
});

cartSchema.virtual('grandTotal').get(function () {
    return Math.round((this.subtotal + this.taxAmount + this.shippingCharges - this.couponDiscount) * 100) / 100;
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);
