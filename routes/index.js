const { Router } = require("express");
const users = require("./users");
const expenses = require("./expenses");

const routes = Router({ mergeParams: true });

routes.use("/users", users);
routes.use("/expenses", expenses);

module.exports = routes;