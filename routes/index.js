const { Router } = require("express");
const users = require("./users");
const expenses = require("./expenses");
const login = require("./auth");
const categories = require("./categories");
const routes = Router({ mergeParams: true });

routes.use("/users", users);
routes.use("/expenses", expenses);
routes.use("/logIn", login);
routes.use("/categories", categories);

module.exports = routes;