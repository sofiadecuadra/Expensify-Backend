const Router = require('express');
const router = Router({ mergeParams: true });
const categoryController = require('../controllers/categoryController');

router.post('/', categoryController.createCategory);

module.exports = router;