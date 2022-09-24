const HealthCheckError = require("../errors/HealthCheckError");

class HealthCheckLogic {
    static connection;

    static async healthCheck() {
        try {
            await HealthCheckLogic.connection.authenticate();
            const result = {
                uptime: process.uptime(),
                message: "OK",
                timestamp: Date.now(),
            };
            return result;
        } catch (err) {
            throw new HealthCheckError(err.message);
        }
    }
}

module.exports = HealthCheckLogic;
