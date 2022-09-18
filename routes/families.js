const Router = require('express');
const router = Router({ mergeParams: true });
const authMiddleware = require('../middleware/auth');
const FamilyController = require('../controllers/familyController');
const Roles = require('../library/roles');

router.get('/apiKey/', authMiddleware([Roles.Administrator]), FamilyController.getApiKey);
router.patch('/apiKey/', authMiddleware([Roles.Administrator]), FamilyController.updateApiKey);
router.post('/:familyId/invite/:userType/', authMiddleware([Roles.Administrator]), FamilyController.createInvite);
router.get('/:inviteToken/', FamilyController.validateInviteToken);


module.exports = router;