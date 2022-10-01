const config = require("config");
const express = require("express");
const apiPort = config.get("API_PORT");
const cors = require("cors");
const errorMiddleware = require("./api/middleware/error");
const cookieParser = require("cookie-parser");

class Server {
    app;

    constructor() {
        this.app = express();
    }

    start() {
        this.app.listen(apiPort, () => console.log(`Listening on port ${apiPort}...`));
    }

    config(routes) {
        this.app.set("port", apiPort || 3003);

        this.app.use(express.json());
        this.app.use(cookieParser());

        this.app.use(cors());
        this.app.use("/", routes);
        this.app.use(errorMiddleware);
    }
}

module.exports = Server;
