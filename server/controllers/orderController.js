const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const Payment = require('../models/Payment');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { sendEmail } = require('../config/email');
const { orderConfirmationTemplate, adminOrderNotificationTemplate } = require('../utils/emailTemplates');

const ADMIN_EMAIL = '23kb1a3064@nbkrist.org';

// @desc    Create order from cart
exports.createOrder = async (req, res, next) => {
    try {
        const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

        const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        // Validate stock
        for (const item of cart.items) {
            if (!item.book || item.book.stockQuantity < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${item.book?.title || 'Unknown'}"`,
                });
            }
        }

        const orderItems = cart.items.map((item) => ({
            book: item.book._id,
            title: item.book.title,
            coverImage: item.book.coverImage,
            quantity: item.quantity,
            price: item.price,
            finalPrice: item.finalPrice,
        }));

        const subtotal = cart.subtotal;
        const taxAmount = cart.taxAmount;
        const shippingCharges = cart.shippingCharges;
        const couponDiscount = cart.couponDiscount || 0;
        const totalAmount = Math.round((subtotal + taxAmount + shippingCharges - couponDiscount) * 100) / 100;

        // Normalize address fields for Mongoose validation requirements (addressLine1, postalCode)
        const formatAddress = (addr) => {
            if (!addr) return undefined;
            return {
                fullName: addr.fullName,
                phone: addr.phone,
                addressLine1: addr.addressLine1 || addr.street || addr.address,
                addressLine2: addr.addressLine2 || '',
                city: addr.city,
                state: addr.state,
                country: addr.country || 'India',
                postalCode: addr.postalCode || addr.pincode,
            };
        };

        const finalShippingAddress = formatAddress(shippingAddress);
        const finalBillingAddress = formatAddress(billingAddress) || finalShippingAddress;

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress: finalShippingAddress,
            billingAddress: finalBillingAddress,
            paymentMethod,
            subtotal,
            taxAmount,
            shippingCharges,
            couponApplied: cart.coupon,
            couponDiscount,
            totalAmount,
            notes,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
            orderStatus: 'pending',
            statusHistory: [{ status: 'pending', note: 'Order placed' }],
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        // Create payment record
        await Payment.create({
            order: order._id,
            user: req.user._id,
            method: paymentMethod,
            amount: totalAmount,
            status: paymentMethod === 'cod' ? 'pending' : 'initiated',
            logs: [{ action: 'Order created', details: `Payment method: ${paymentMethod}` }],
        });

        // Update book stock
        for (const item of cart.items) {
            await Book.findByIdAndUpdate(item.book._id, {
                $inc: { stockQuantity: -item.quantity, totalSold: item.quantity },
            });
        }

        // Update coupon usage
        if (cart.coupon) {
            await Coupon.findByIdAndUpdate(cart.coupon, {
                $inc: { usedCount: 1 },
                $push: { usedBy: { user: req.user._id, usedAt: new Date() } },
            });
        }

        // Clear cart
        cart.items = [];
        cart.coupon = undefined;
        cart.couponDiscount = 0;
        await cart.save();

        // Send confirmation emails (non-blocking)
        try {
            const orderUser = await User.findById(req.user._id).select('fullName email');
            if (orderUser) {
                // Email to customer
                sendEmail({
                    to: orderUser.email,
                    subject: `Order Confirmed #${order.orderNumber} - BookStore`,
                    html: orderConfirmationTemplate(order, orderUser),
                }).catch(err => console.error('Customer email failed:', err.message));

                // Email to admin
                sendEmail({
                    to: ADMIN_EMAIL,
                    subject: `🔔 New Order #${order.orderNumber} from ${orderUser.fullName || orderUser.email}`,
                    html: adminOrderNotificationTemplate(order, orderUser),
                }).catch(err => console.error('Admin email failed:', err.message));
            }
        } catch (emailErr) {
            console.error('Email sending error:', emailErr.message);
        }

        res.status(201).json({ success: true, data: order, message: 'Order placed successfully' });
    } catch (error) { next(error); }
};

// @desc    Get user orders
exports.getUserOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;

        const filter = { user: req.user._id };
        if (req.query.status) filter.orderStatus = req.query.status;

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter).sort('-createdAt').skip(skip).limit(limit).lean();

        res.status(200).json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
};

// @desc    Get single order
exports.getOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id })
            .populate('items.book', 'title slug coverImage')
            .populate('couponApplied', 'code discountType discountValue');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        res.status(200).json({ success: true, data: order });
    } catch (error) { next(error); }
};

// @desc    Cancel order
exports.cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage' });
        }

        order.orderStatus = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = req.body.reason || 'Cancelled by customer';
        order.statusHistory.push({ status: 'cancelled', note: order.cancelReason });
        await order.save();

        // Restore stock
        for (const item of order.items) {
            await Book.findByIdAndUpdate(item.book, {
                $inc: { stockQuantity: item.quantity, totalSold: -item.quantity },
            });
        }

        res.status(200).json({ success: true, data: order, message: 'Order cancelled' });
    } catch (error) { next(error); }
};

// ==================== ADMIN ====================
// @desc    Get all orders (Admin)
exports.getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const filter = {};

        if (req.query.status) filter.orderStatus = req.query.status;
        if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
        if (req.query.q) filter.orderNumber = { $regex: req.query.q, $options: 'i' };

        // If seller, filter orders containing user's books
        if (req.user.role === 'seller') {
            const sellerBooks = await Book.find({ seller: req.user._id }).select('_id');
            const sellerBookIds = sellerBooks.map(b => b._id);
            filter['items.book'] = { $in: sellerBookIds };
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('user', 'fullName email')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean();

        res.status(200).json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (error) { next(error); }
};

// @desc    Update order status (Admin)
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { orderStatus, paymentStatus, trackingNumber, note } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        if (orderStatus) {
            order.orderStatus = orderStatus;
            order.statusHistory.push({ status: orderStatus, note: note || `Status changed to ${orderStatus}` });
            if (orderStatus === 'delivered') order.deliveredAt = new Date();
        }
        if (paymentStatus) order.paymentStatus = paymentStatus;
        if (trackingNumber) order.trackingNumber = trackingNumber;

        await order.save();
        res.status(200).json({ success: true, data: order, message: 'Order updated' });
    } catch (error) { next(error); }
};
