const Router = require('express');
const router = Router({ mergeParams: true });
const userController = require('../controllers/userController');

router.post('/', userController.createNewUser);

module.exports = router;