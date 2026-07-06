const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    title: String,
    coverImage: String,
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    finalPrice: { type: Number, required: true },
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        orderNumber: { type: String },
        items: [orderItemSchema],
        shippingAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            addressLine1: { type: String, required: true },
            addressLine2: String,
            city: { type: String, required: true },
            state: { type: String, required: true },
            country: { type: String, default: 'India' },
            postalCode: { type: String, required: true },
        },
        billingAddress: {
            fullName: String,
            phone: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            country: String,
            postalCode: String,
        },
        paymentMethod: {
            type: String,
            enum: ['razorpay', 'stripe', 'cod', 'upi', 'card', 'wallet'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
            default: 'pending',
        },
        orderStatus: {
            type: String,
            enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
            default: 'pending',
        },
        paymentId: String,
        transactionId: String,
        invoiceNumber: String,
        couponApplied: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
        couponDiscount: { type: Number, default: 0 },
        subtotal: { type: Number, required: true },
        taxAmount: { type: Number, default: 0 },
        shippingCharges: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        trackingNumber: String,
        estimatedDelivery: Date,
        deliveredAt: Date,
        cancelledAt: Date,
        cancelReason: String,
        notes: String,
        statusHistory: [
            {
                status: String,
                date: { type: Date, default: Date.now },
                note: String,
            },
        ],
    },
    { timestamps: true }
);

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1, createdAt: -1 });

orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

orderSchema.pre('save', function (next) {
    if (!this.orderNumber) {
        this.orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    if (!this.invoiceNumber) {
        this.invoiceNumber = 'INV-' + Date.now();
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);
