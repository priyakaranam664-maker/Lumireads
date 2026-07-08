const router = require('express').Router();
const { protect, authorize } = require('../middlewares/auth');
const { createOrder, getUserOrders, getOrder, cancelOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

router.use(protect);
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin/Seller
router.get('/admin/all', authorize('admin', 'seller'), getAllOrders);
router.put('/admin/:id', authorize('admin', 'seller'), updateOrderStatus);

module.exports = router;
