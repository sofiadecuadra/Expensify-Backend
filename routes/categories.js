const Router = require('express');
const router = Router({ mergeParams: true });
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');
const Roles = require('../library/roles');

router.post('/', authMiddleware([Roles.Administrator]), categoryController.createCategory);
router.delete('/:categoryId', authMiddleware([Roles.Administrator]), categoryController.deleteCategory);
router.put('/:categoryId', authMiddleware([Roles.Administrator]), categoryController.updateCategory);
router.get('/', authMiddleware([Roles.Member, Roles.Administrator]), categoryController.getCategories);

module.exports = router;