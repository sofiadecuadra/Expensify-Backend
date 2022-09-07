const { Router } = require("express");
const users = require("./users");
const expenses = require("./expenses");
const signIn = require("./auth");
const categories = require("./categories");
const families = require("./families");
const routes = Router({ mergeParams: true });

routes.use("/users", users);
routes.use("/expenses", expenses);
routes.use("/auth", signIn);
routes.use("/categories", categories);
routes.use("/families", families);

module.exports = routes;