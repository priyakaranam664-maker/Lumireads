const router = require('express').Router();
const { protect, authorize } = require('../middlewares/auth');
const a = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get('/dashboard', a.getDashboardStats);

// Coupons
router.get('/coupons', a.getCoupons);
router.post('/coupons', a.createCoupon);
router.put('/coupons/:id', a.updateCoupon);
router.delete('/coupons/:id', a.deleteCoupon);

// Banners
router.get('/banners', a.getBanners);
router.post('/banners', a.createBanner);
router.put('/banners/:id', a.updateBanner);
router.delete('/banners/:id', a.deleteBanner);

// Contact messages
router.get('/contact', a.getContactMessages);

module.exports = router;
