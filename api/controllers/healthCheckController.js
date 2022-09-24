const HealthCheckLogic = require("../../businessLogic/healthCheckLogic");
class HealthCheckController {
    static connection;

    static async healthCheck(req, res, next) {
        const result = await HealthCheckLogic.healthCheck();
        res.status(200).json(result);
    }
}

module.exports = HealthCheckController;
