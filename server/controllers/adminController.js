const Order = require('../models/Order');
const Book = require('../models/Book');
const User = require('../models/User');
const Review = require('../models/Review');
const Coupon = require('../models/Coupon');
const Notification = require('../models/Notification');
const { Banner, Contact, Settings } = require('../models/Others');
const { isDbUnavailableError, getFallbackBannersResponse } = require('../utils/fallbackData');

// @desc    Get dashboard stats
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [totalUsers, totalBooks, totalOrders, totalCategories] = await Promise.all([
            User.countDocuments(),
            Book.countDocuments({ isActive: true }),
            Order.countDocuments(),
            require('../models/Category').countDocuments({ isActive: true }),
        ]);

        const revenueAgg = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]);

        const monthlySales = await Order.aggregate([
            { $match: { createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) } } },
            { $group: { _id: { $month: '$createdAt' }, orders: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
            { $sort: { _id: 1 } },
        ]);

        const recentOrders = await Order.find()
            .populate('user', 'fullName email')
            .sort('-createdAt')
            .limit(10)
            .lean();

        const orderStatusBreakdown = await Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]);

        const topBooks = await Book.find({ isActive: true })
            .sort('-totalSold')
            .limit(5)
            .select('title coverImage totalSold finalPrice')
            .lean();

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalBooks,
                totalOrders,
                totalCategories,
                totalRevenue: revenueAgg[0]?.total || 0,
                monthlySales,
                recentOrders,
                orderStatusBreakdown,
                topBooks,
            },
        });
    } catch (error) { next(error); }
};

// ==================== COUPONS ====================
exports.getCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort('-createdAt').lean();
        res.status(200).json({ success: true, data: coupons });
    } catch (error) { next(error); }
};

exports.createCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({ success: true, data: coupon, message: 'Coupon created' });
    } catch (error) { next(error); }
};

exports.updateCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
        res.status(200).json({ success: true, data: coupon, message: 'Coupon updated' });
    } catch (error) { next(error); }
};

exports.deleteCoupon = async (req, res, next) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Coupon deleted' });
    } catch (error) { next(error); }
};

// ==================== BANNERS ====================
exports.getBanners = async (req, res, next) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        if (req.query.position) filter.position = req.query.position;
        const banners = await Banner.find(filter).sort('sortOrder').lean();
        res.status(200).json({ success: true, data: banners });
    } catch (error) {
        if (isDbUnavailableError(error)) {
            return res.status(200).json(getFallbackBannersResponse());
        }
        next(error);
    }
};

exports.createBanner = async (req, res, next) => {
    try {
        const banner = await Banner.create(req.body);
        res.status(201).json({ success: true, data: banner, message: 'Banner created' });
    } catch (error) { next(error); }
};

exports.updateBanner = async (req, res, next) => {
    try {
        const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
        res.status(200).json({ success: true, data: banner, message: 'Banner updated' });
    } catch (error) { next(error); }
};

exports.deleteBanner = async (req, res, next) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Banner deleted' });
    } catch (error) { next(error); }
};

// ==================== CONTACT ====================
exports.submitContact = async (req, res, next) => {
    try {
        const contact = await Contact.create(req.body);
        res.status(201).json({ success: true, message: 'Message sent successfully' });
    } catch (error) { next(error); }
};

exports.getContactMessages = async (req, res, next) => {
    try {
        const messages = await Contact.find().sort('-createdAt').lean();
        res.status(200).json({ success: true, data: messages });
    } catch (error) { next(error); }
};

// ==================== NOTIFICATIONS ====================
exports.getUserNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({
            $or: [{ user: req.user._id }, { isGlobal: true }],
        }).sort('-createdAt').limit(50).lean();
        const unreadCount = notifications.filter((n) => !n.isRead).length;
        res.status(200).json({ success: true, data: notifications, unreadCount });
    } catch (error) { next(error); }
};

exports.markNotificationRead = async (req, res, next) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.status(200).json({ success: true, message: 'Marked as read' });
    } catch (error) { next(error); }
};

exports.markAllRead = async (req, res, next) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (error) { next(error); }
};
