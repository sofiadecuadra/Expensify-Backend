const Router = require('express');
const router = Router({ mergeParams: true });
const FamilyController = require('../controllers/familyController');

router.patch('/:familyId/apiKey/', FamilyController.updateApiKey);

module.exports = router;