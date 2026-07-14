const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const a = require('../controllers/adminController');
const { buildLiveStatsPayload } = require('../utils/liveStats');
const Order = require('../models/Order');
const Book = require('../models/Book');
const Category = require('../models/Category');

// Public
router.get('/banners', a.getBanners);
router.get('/live-stats', async (req, res) => {
    try {
        const [totalBooks, totalCategories, totalOrders] = await Promise.all([
            Book.countDocuments({ isActive: true }),
            Category.countDocuments({ isActive: true }),
            Order.countDocuments(),
        ]);
        res.status(200).json({ success: true, data: buildLiveStatsPayload({ totalBooks, totalCategories, totalOrders }) });
    } catch (error) {
        res.status(200).json({ success: true, data: buildLiveStatsPayload({ totalBooks: 0, totalCategories: 0, totalOrders: 0 }) });
    }
});
router.post('/contact', a.submitContact);

// Auth required
router.get('/notifications', protect, a.getUserNotifications);
router.put('/notifications/:id/read', protect, a.markNotificationRead);
router.put('/notifications/read-all', protect, a.markAllRead);

module.exports = router;
