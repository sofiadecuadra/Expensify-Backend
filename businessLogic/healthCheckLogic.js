const HealthCheckError = require("../errors/HealthCheckError");

class HealthCheckLogic {
    sqlConnection;

    constructor(sqlConnection) {
        this.sqlConnection = sqlConnection;
    }

    async healthCheck() {
        try {
            await this.sqlConnection.authenticate();
            const result = {
                uptime: process.uptime(),
                message: "OK",
                timestamp: Date.now(),
            };
            console.info("[HealthCheck] " + JSON.stringify(result));
            return result;
        } catch (err) {
            throw new HealthCheckError(err.message);
        }
    }
}

module.exports = HealthCheckLogic;
