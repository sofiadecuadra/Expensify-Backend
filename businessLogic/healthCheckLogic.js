const HealthCheckError = require("../errors/HealthCheckError");

class HealthCheckLogic {
    sqlConnection;
    mongoDb;

    constructor(sqlConnection, mongoDb) {
        this.sqlConnection = sqlConnection;
        this.mongoDb = mongoDb;
    }

    async healthCheck() {
        try {
            await this.mongoDb.db("admin").command({ ping: 1 });
            const isConnected = !!this.mongoDb && !!this.mongoDb.topology && this.mongoDb.topology.isConnected();
            if (!isConnected) {
                throw new HealthCheckError("MongoDB Database is not connected");
            }
            await this.sqlConnection.authenticate();
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
