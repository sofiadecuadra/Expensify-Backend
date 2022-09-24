const HealthCheckLogic = require("../../businessLogic/healthCheckLogic");
class HealthCheckController {
    static connection;

    static async healthCheck(req, res, next) {
        try {
            const result = await HealthCheckLogic.healthCheck();
            res.status(200).json(result);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = HealthCheckController;
