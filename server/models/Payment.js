const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
    {
        order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        method: { type: String, enum: ['razorpay', 'stripe', 'cod', 'upi', 'card', 'wallet'], required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        status: { type: String, enum: ['initiated', 'pending', 'completed', 'failed', 'refunded'], default: 'initiated' },
        gatewayOrderId: String,
        gatewayPaymentId: String,
        gatewaySignature: String,
        transactionId: String,
        refundId: String,
        refundAmount: { type: Number, default: 0 },
        refundStatus: { type: String, enum: ['none', 'partial', 'full'], default: 'none' },
        metadata: { type: mongoose.Schema.Types.Mixed },
        logs: [{ action: String, timestamp: { type: Date, default: Date.now }, details: String }],
    },
    { timestamps: true }
);

paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
