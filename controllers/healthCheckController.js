const HealthCheckError = require("../errors/HealthCheckError");

class HealthCheckController {
    static connection;

    static async healthCheck(req, res, next) {
        try {
            await HealthCheckController.connection.authenticate();
            const result = {
                uptime: process.uptime(),
                message: "OK",
                timestamp: Date.now(),
            }
            res.status(200).json(result);
        }
        catch (err) {
            next(new HealthCheckError(err.message));
        }
    }

}

module.exports = HealthCheckController;
