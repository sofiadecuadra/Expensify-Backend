const config = require("config");
const express = require('express');
const apiPort = config.get("API_PORT");
const cors = require("cors");
const routes = require("./routes");
const error = require("./middleware/error");

class Server {
    app;

    constructor() {
        this.app = express();
        this.config();
    }

    start() {
        this.app.listen(apiPort, () => console.log(`Listening on port ${apiPort}...`));
    }

    config() {
        this.app.set("port", apiPort || 3003);
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use("/", routes);
        this.app.use(error);
    }

}

module.exports = Server;