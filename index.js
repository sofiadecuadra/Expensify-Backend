const StartupHelper = require("./startupHelper");

(async () => {
    const startupHelper = new StartupHelper();
    await startupHelper.startServer();
})();
