const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const a = require('../controllers/adminController');

// Public
router.get('/banners', a.getBanners);
router.post('/contact', a.submitContact);

// Auth required
router.get('/notifications', protect, a.getUserNotifications);
router.put('/notifications/:id/read', protect, a.markNotificationRead);
router.put('/notifications/read-all', protect, a.markAllRead);

module.exports = router;
