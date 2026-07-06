const router = require('express').Router();
const { protect, authorize } = require('../middlewares/auth');
const r = require('../controllers/reviewController');

router.get('/book/:bookId', r.getBookReviews);
router.post('/book/:bookId', protect, r.createReview);
router.put('/:id', protect, r.updateReview);
router.delete('/:id', protect, r.deleteReview);
router.post('/:id/like', protect, r.toggleLike);

// Admin
router.get('/admin/all', protect, authorize('admin'), r.getAllReviews);
router.put('/admin/:id/moderate', protect, authorize('admin'), r.moderateReview);

module.exports = router;
