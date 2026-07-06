const router = require('express').Router();
const { protect, authorize } = require('../middlewares/auth');
const { getProfile, updateProfile, addAddress, updateAddress, deleteAddress, toggleWishlist, getWishlist, getAllUsers, updateUser, deleteUser } = require('../controllers/userController');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:addressId', protect, updateAddress);
router.delete('/addresses/:addressId', protect, deleteAddress);
router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:bookId', protect, toggleWishlist);

// Admin
router.get('/', protect, authorize('admin'), getAllUsers);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
