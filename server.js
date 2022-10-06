const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const apiPort = process.env.API_PORT;
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


        this.app.use(cors({ credentials: true, origin: process.env.FRONTEND_ORIGIN }));
        this.app.use("/", routes);
        this.app.use(errorMiddleware);
    }
}

module.exports = Server;
