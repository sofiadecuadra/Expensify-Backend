//const HealthCheckLogic = require("./businessLogic/healthCheckLogic");
const StartupHelper = require("./startupHelper");

(async () => {
    const startupHelper = new StartupHelper();
    await startupHelper.startServer();
    //HealthCheckLogic.connection = sequelizeContext.connection;
})();
