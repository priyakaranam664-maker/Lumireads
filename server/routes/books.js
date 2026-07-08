const router = require('express').Router();
const { protect, authorize } = require('../middlewares/auth');
const { getBooks, getBook, createBook, updateBook, deleteBook, getFeaturedBooks, getBestSellers, getNewArrivals, getTrendingBooks, autocomplete, getAllBooksAdmin } = require('../controllers/bookController');

// Public routes (order matters - specific before params)
router.get('/featured', getFeaturedBooks);
router.get('/best-sellers', getBestSellers);
router.get('/new-arrivals', getNewArrivals);
router.get('/trending', getTrendingBooks);
router.get('/search/autocomplete', autocomplete);
router.get('/', getBooks);
router.get('/:identifier', getBook);

// Admin & Seller routes
router.get('/admin/all', protect, authorize('admin', 'seller'), getAllBooksAdmin);
router.post('/', protect, authorize('admin', 'seller'), createBook);
router.put('/:id', protect, authorize('admin', 'seller'), updateBook);
router.delete('/:id', protect, authorize('admin', 'seller'), deleteBook);

module.exports = router;
