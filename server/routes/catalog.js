const router = require('express').Router();
const { protect, authorize } = require('../middlewares/auth');
const c = require('../controllers/catalogController');

// Categories
router.get('/categories', c.getCategories);
router.get('/categories/:identifier', c.getCategory);
router.post('/categories', protect, authorize('admin'), c.createCategory);
router.put('/categories/:id', protect, authorize('admin'), c.updateCategory);
router.delete('/categories/:id', protect, authorize('admin'), c.deleteCategory);

// Authors
router.get('/authors', c.getAuthors);
router.get('/authors/:identifier', c.getAuthor);
router.post('/authors', protect, authorize('admin'), c.createAuthor);
router.put('/authors/:id', protect, authorize('admin'), c.updateAuthor);
router.delete('/authors/:id', protect, authorize('admin'), c.deleteAuthor);

// Publishers
router.get('/publishers', c.getPublishers);
router.get('/publishers/:id', c.getPublisher);
router.post('/publishers', protect, authorize('admin'), c.createPublisher);
router.put('/publishers/:id', protect, authorize('admin'), c.updatePublisher);
router.delete('/publishers/:id', protect, authorize('admin'), c.deletePublisher);

module.exports = router;
