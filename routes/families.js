const Router = require('express');
const router = Router({ mergeParams: true });
const authMiddleware = require('../middleware/auth');
const FamilyController = require('../controllers/familyController');
const Roles = require('../library/roles');

router.patch('/:familyId/apiKey/', FamilyController.updateApiKey);
router.post('/invitations/', authMiddleware([Roles.Administrator]), FamilyController.createInvite);
router.get('/:inviteToken/', FamilyController.validateInviteToken);


module.exports = router;