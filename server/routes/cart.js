const router = require('express').Router();
const { protect } = require('../middlewares/auth');
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, applyCoupon, removeCoupon } = require('../controllers/cartController');

router.use(protect); // All cart routes require auth
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:bookId', updateCartItem);
router.delete('/:bookId', removeFromCart);
router.delete('/', clearCart);
router.post('/coupon', applyCoupon);
router.delete('/coupon/remove', removeCoupon);

module.exports = router;
