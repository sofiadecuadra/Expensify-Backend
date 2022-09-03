const { Router } = require("express");
const users = require("./users");

const routes = Router({ mergeParams: true });

routes.use("/users", users);

module.exports = routes;