const Router = require('express');
const router = Router({ mergeParams: true });
const HealthCheckController = require('../controllers/healthCheckController');

router.get('/', HealthCheckController.healthCheck);

module.exports = router;