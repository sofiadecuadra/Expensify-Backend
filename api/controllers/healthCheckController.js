const HealthCheckLogic = require("../../businessLogic/healthCheckLogic");
class HealthCheckController {
    healthCheckLogic;

    constructor(healthCheckLogic) {
        this.healthCheckLogic = healthCheckLogic;
    }

    async healthCheck(req, res, next) {
        try {
            const result = await this.healthCheckLogic.healthCheck();
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = HealthCheckController;
