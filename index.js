//const HealthCheckLogic = require("./businessLogic/healthCheckLogic");
const StartupHelper = require("./startupHelper");
require('newrelic');

(async() => {
    const startupHelper = new StartupHelper();
    await startupHelper.startServer();
    //HealthCheckLogic.connection = sequelizeContext.connection;
})();